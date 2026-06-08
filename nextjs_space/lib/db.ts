import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

// Set up Firebase Admin SDK
let admin: any = null;
let firestore: any = null;
let useFirestore = false;

try {
  // We dynamically load firebase-admin to avoid startup issues if dependencies are still installing
  admin = require('firebase-admin');
  
  let projectId = process.env.FIREBASE_PROJECT_ID;
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Try loading directly from serviceAccountKey.json file inside the app
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      if (serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
        projectId = serviceAccount.project_id;
        clientEmail = serviceAccount.client_email;
        privateKey = serviceAccount.private_key;
        console.log('📦 Loaded Firebase credentials from local serviceAccountKey.json');
      }
    } catch (e: any) {
      console.warn('⚠️ Found serviceAccountKey.json but failed to parse:', e.message || e);
    }
  }

  if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
      firestore = admin.firestore();
      useFirestore = true;
      console.log('🔥 Connected to Firebase Firestore in the Cloud.');
    } else if (process.env.FIRESTORE_EMULATOR_HOST) {
      admin.initializeApp({
        projectId: projectId || 'demo-project',
      });
      firestore = admin.firestore();
      useFirestore = true;
      console.log('🔥 Connected to local Firebase Firestore Emulator.');
    } else {
      const missing = [];
      if (!projectId) missing.push('FIREBASE_PROJECT_ID');
      if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
      if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');
      console.warn(`⚠️ Firebase credentials not configured. Missing: [${missing.join(', ')}]. Falling back to local file database.`);
    }
  } else {
    firestore = admin.firestore();
    useFirestore = true;
  }
} catch (err: any) {
  console.warn('⚠️ Could not load firebase-admin or initialize. Falling back to local file database:', err.message || err);
}

// Local file database fallback engine
class LocalFileDb {
  private filePath: string;
  private data: Record<string, any[]> = {};

  constructor() {
    this.filePath = path.resolve(process.cwd(), 'firebase-mock.json');
    this.load();
  }

  private load() {
    if (fs.existsSync(this.filePath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      } catch (e) {
        this.data = {};
      }
    } else {
      this.data = {};
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving local file database:', e);
    }
  }

  getCollection(name: string): any[] {
    this.load(); // Reload to capture external changes (e.g. from seed scripts)
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  saveCollection(name: string, items: any[]) {
    this.data[name] = items;
    this.save();
  }
}

const localDb = new LocalFileDb();

// Helper database operations
async function getCollectionDocs(collectionName: string): Promise<any[]> {
  if (useFirestore && firestore) {
    try {
      const snapshot = await firestore.collection(collectionName).get();
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        // Convert any Firestore Timestamps to ISO strings
        const cleaned: any = { id: doc.id };
        for (const k of Object.keys(data)) {
          if (data[k] && typeof data[k] === 'object' && typeof data[k].toDate === 'function') {
            cleaned[k] = data[k].toDate().toISOString();
          } else {
            cleaned[k] = data[k];
          }
        }
        return cleaned;
      });
    } catch (e) {
      console.error(`Firestore fetch error on ${collectionName}, falling back to local:`, e);
      return localDb.getCollection(collectionName);
    }
  } else {
    return localDb.getCollection(collectionName);
  }
}

async function getDoc(collectionName: string, id: string): Promise<any | null> {
  if (useFirestore && firestore) {
    try {
      const doc = await firestore.collection(collectionName).doc(id).get();
      if (!doc.exists) return null;
      const data = doc.data();
      const cleaned: any = { id: doc.id };
      for (const k of Object.keys(data)) {
        if (data[k] && typeof data[k] === 'object' && typeof data[k].toDate === 'function') {
          cleaned[k] = data[k].toDate().toISOString();
        } else {
          cleaned[k] = data[k];
        }
      }
      return cleaned;
    } catch (e) {
      console.error(`Firestore fetch error on ${collectionName}/${id}, falling back:`, e);
    }
  }
  const items = localDb.getCollection(collectionName);
  return items.find(item => item.id === id) || null;
}

async function saveDoc(collectionName: string, id: string, data: any) {
  if (useFirestore && firestore) {
    try {
      // Remove undefined values to prevent firestore validation errors
      const cleanData: any = {};
      for (const k of Object.keys(data)) {
        if (data[k] !== undefined && k !== 'id') {
          cleanData[k] = data[k];
        }
      }
      await firestore.collection(collectionName).doc(id).set(cleanData, { merge: true });
      return;
    } catch (e) {
      console.error(`Firestore set error on ${collectionName}/${id}:`, e);
      throw e;
    }
  }
  const items = localDb.getCollection(collectionName);
  const index = items.findIndex(item => item.id === id);
  if (index >= 0) {
    items[index] = { ...items[index], ...data };
  } else {
    items.push({ id, ...data });
  }
  localDb.saveCollection(collectionName, items);
}

async function deleteDoc(collectionName: string, id: string) {
  if (useFirestore && firestore) {
    try {
      await firestore.collection(collectionName).doc(id).delete();
      return;
    } catch (e) {
      console.error(`Firestore delete error on ${collectionName}/${id}:`, e);
      throw e;
    }
  }
  const items = localDb.getCollection(collectionName);
  const updated = items.filter(item => item.id !== id);
  localDb.saveCollection(collectionName, updated);
}

// Generate a unique ID (similar to Prisma cuid)
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Filtering Helper
function matchesFilter(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const filterVal = where[key];
    if (filterVal === undefined) continue;

    // Handle Prisma specific unique composite keys
    if (key === 'userId_productId' && filterVal) {
      if (item.userId !== filterVal.userId || item.productId !== filterVal.productId) {
        return false;
      }
      continue;
    }

    if (key === 'OR' && Array.isArray(filterVal)) {
      const orMatches = filterVal.some(subWhere => matchesFilter(item, subWhere));
      if (!orMatches) return false;
      continue;
    }
    
    const itemVal = item[key];
    
    if (filterVal && typeof filterVal === 'object' && !Array.isArray(filterVal)) {
      if ('contains' in filterVal) {
        const query = String(filterVal.contains);
        const mode = filterVal.mode;
        const subject = String(itemVal ?? '');
        if (mode === 'insensitive') {
          if (!subject.toLowerCase().includes(query.toLowerCase())) return false;
        } else {
          if (!subject.includes(query)) return false;
        }
      }
      
      const getNumericValue = (val: any): number => {
        if (val instanceof Date) return val.getTime();
        if (typeof val === 'string') {
          if (val.includes('T') && val.includes('Z')) {
            const parsed = Date.parse(val);
            if (!isNaN(parsed)) return parsed;
          }
          const num = Number(val);
          if (!isNaN(num)) return num;
          const parsed = Date.parse(val);
          if (!isNaN(parsed)) return parsed;
        }
        return Number(val);
      };

      const itemNum = getNumericValue(itemVal);
      if ('gte' in filterVal && itemNum < getNumericValue(filterVal.gte)) return false;
      if ('lte' in filterVal && itemNum > getNumericValue(filterVal.lte)) return false;
      if ('gt' in filterVal && itemNum <= getNumericValue(filterVal.gt)) return false;
      if ('lt' in filterVal && itemNum >= getNumericValue(filterVal.lt)) return false;
      if ('in' in filterVal && Array.isArray(filterVal.in)) {
        if (!filterVal.in.includes(itemVal)) return false;
      }
      if ('not' in filterVal && itemVal === filterVal.not) return false;
    } else {
      if (itemVal !== filterVal) return false;
    }
  }
  return true;
}

// Sorting Helper
function sortItems(items: any[], orderBy: any) {
  if (!orderBy) return;
  const sortRules = Array.isArray(orderBy) ? orderBy : [orderBy];
  
  items.sort((a, b) => {
    for (const rule of sortRules) {
      const field = Object.keys(rule)[0];
      const direction = rule[field]; // "asc" or "desc"
      
      let valA = a[field];
      let valB = b[field];
      
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

// Select Helper
function applySelect(item: any, select: any) {
  if (!select) return item;
  const result: any = {};
  for (const key of Object.keys(select)) {
    if (select[key]) {
      result[key] = item[key];
    }
  }
  return result;
}

// Relationship Inclusion Helper
async function resolveIncludes(items: any[], include: any, modelName: string) {
  if (!include || items.length === 0) return;
  
  if (modelName === 'product' && include.category) {
    const categories = await getCollectionDocs('categories');
    for (const item of items) {
      item.category = categories.find(c => c.id === item.categoryId) || null;
    }
  }
  
  if (modelName === 'category' && include._count?.select?.products) {
    const products = await getCollectionDocs('products');
    for (const item of items) {
      const count = products.filter(p => p.categoryId === item.id).length;
      item._count = { products: count };
    }
  }
  
  if (modelName === 'cartItem' && include.product) {
    const products = await getCollectionDocs('products');
    const categories = await getCollectionDocs('categories');
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.category = categories.find(c => c.id === prod.categoryId) || null;
      }
      item.product = prod || null;
    }
  }
  
  if (modelName === 'wishlistItem' && include.product) {
    const products = await getCollectionDocs('products');
    const categories = await getCollectionDocs('categories');
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.category = categories.find(c => c.id === prod.categoryId) || null;
      }
      item.product = prod || null;
    }
  }

  if (modelName === 'orderItem' && include.product) {
    const products = await getCollectionDocs('products');
    const categories = await getCollectionDocs('categories');
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.category = categories.find(c => c.id === prod.categoryId) || null;
      }
      item.product = prod || null;
    }
  }

  if (modelName === 'order') {
    if (include.items) {
      const orderItems = await getCollectionDocs('orderItems');
      for (const item of items) {
        item.items = orderItems.filter(oi => oi.orderId === item.id);
      }
    }
    if (include.tracking) {
      const orderTrackings = await getCollectionDocs('orderTrackings');
      for (const item of items) {
        item.tracking = orderTrackings
          .filter(ot => ot.orderId === item.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
    }
    if (include.address) {
      const addresses = await getCollectionDocs('addresses');
      for (const item of items) {
        item.address = addresses.find(a => a.id === item.addressId) || null;
      }
    }
    if (include.user) {
      const users = await getCollectionDocs('users');
      for (const item of items) {
        item.user = users.find(u => u.id === item.userId) || null;
      }
    }
  }
}

// Wrapper for Prisma Client Compatibility
class ModelWrapper {
  constructor(private collectionName: string, private modelName: string) {}

  async findMany(args: any = {}) {
    let items = await getCollectionDocs(this.collectionName);
    
    // Filter
    if (args.where) {
      items = items.filter(item => matchesFilter(item, args.where));
    }
    
    // Sort
    if (args.orderBy) {
      sortItems(items, args.orderBy);
    }
    
    // Take / Limit
    if (typeof args.take === 'number') {
      items = items.slice(0, args.take);
    }
    
    // Include relationships
    if (args.include) {
      await resolveIncludes(items, args.include, this.modelName);
    }
    
    // Select fields
    if (args.select) {
      items = items.map(item => applySelect(item, args.select));
    }
    
    return items;
  }

  async findUnique(args: any) {
    if (args.where && args.where.id) {
      const doc = await getDoc(this.collectionName, args.where.id);
      if (!doc) return null;
      
      const items = [doc];
      if (args.include) {
        await resolveIncludes(items, args.include, this.modelName);
      }
      return args.select ? applySelect(items[0], args.select) : items[0];
    }
    
    // Composite key match OR other query matching
    const items = await this.findMany(args);
    return items.length > 0 ? items[0] : null;
  }

  async findFirst(args: any = {}) {
    const items = await this.findMany(args);
    return items.length > 0 ? items[0] : null;
  }

  async count(args: any = {}) {
    let items = await getCollectionDocs(this.collectionName);
    if (args.where) {
      items = items.filter(item => matchesFilter(item, args.where));
    }
    return items.length;
  }

  async create(args: any) {
    const id = args.data.id || generateId();
    const now = new Date().toISOString();
    
    // Extract relations
    const dataWithoutRelations: any = {};
    const nestedRelations: any = {};
    
    for (const key of Object.keys(args.data)) {
      const val = args.data[key];
      if (val && typeof val === 'object' && val.create !== undefined) {
        nestedRelations[key] = val.create;
      } else {
        dataWithoutRelations[key] = val;
      }
    }

    const docData = {
      id,
      createdAt: now,
      updatedAt: now,
      ...dataWithoutRelations,
    };
    
    await saveDoc(this.collectionName, id, docData);

    // Save nested relations
    for (const key of Object.keys(nestedRelations)) {
      const relationData = nestedRelations[key];
      const itemsToCreate = Array.isArray(relationData) ? relationData : [relationData];
      
      if (this.modelName === 'order' && key === 'items') {
        const orderItemWrapper = prisma.orderItem;
        for (const item of itemsToCreate) {
          await orderItemWrapper.create({
            data: {
              ...item,
              orderId: id,
            }
          });
        }
      }
      
      if (this.modelName === 'order' && key === 'tracking') {
        const orderTrackingWrapper = prisma.orderTracking;
        for (const item of itemsToCreate) {
          await orderTrackingWrapper.create({
            data: {
              ...item,
              orderId: id,
            }
          });
        }
      }
    }
    
    const items = [docData];
    if (args.include) {
      await resolveIncludes(items, args.include, this.modelName);
    }
    return args.select ? applySelect(items[0], args.select) : items[0];
  }

  async update(args: any) {
    const existing = await this.findUnique({ where: args.where });
    if (!existing) {
      throw new Error(`Record to update not found in ${this.modelName}.`);
    }
    
    const now = new Date().toISOString();
    const updatedData = {
      ...existing,
      ...args.data,
      updatedAt: now,
    };
    
    for (const key of Object.keys(updatedData)) {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    }
    
    await saveDoc(this.collectionName, existing.id, updatedData);
    
    const items = [updatedData];
    if (args.include) {
      await resolveIncludes(items, args.include, this.modelName);
    }
    return args.select ? applySelect(items[0], args.select) : items[0];
  }

  async updateMany(args: any) {
    let items = await getCollectionDocs(this.collectionName);
    if (args.where) {
      items = items.filter(item => matchesFilter(item, args.where));
    }
    
    const now = new Date().toISOString();
    let count = 0;
    for (const item of items) {
      const updatedData = {
        ...item,
        ...args.data,
        updatedAt: now,
      };
      await saveDoc(this.collectionName, item.id, updatedData);
      count++;
    }
    return { count };
  }

  async delete(args: any) {
    const existing = await this.findUnique({ where: args.where });
    if (!existing) {
      throw new Error(`Record to delete not found in ${this.modelName}.`);
    }
    
    await deleteDoc(this.collectionName, existing.id);
    return existing;
  }

  async deleteMany(args: any = {}) {
    let items = await getCollectionDocs(this.collectionName);
    if (args.where) {
      items = items.filter(item => matchesFilter(item, args.where));
    }
    
    let count = 0;
    for (const item of items) {
      await deleteDoc(this.collectionName, item.id);
      count++;
    }
    return { count };
  }

  async upsert(args: any) {
    const existing = await this.findUnique({ where: args.where });
    if (existing) {
      return this.update({
        where: { id: existing.id },
        data: args.update,
      });
    } else {
      const createData = { ...args.create };
      if (args.where.email && !createData.email) {
        createData.email = args.where.email;
      }
      if (args.where.slug && !createData.slug) {
        createData.slug = args.where.slug;
      }
      return this.create({ data: createData });
    }
  }

  async aggregate(args: any) {
    const items = await this.findMany();
    const result: any = {};
    if (args._sum) {
      result._sum = {};
      for (const field of Object.keys(args._sum)) {
        if (args._sum[field]) {
          const sumVal = items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
          result._sum[field] = sumVal;
        }
      }
    }
    return result;
  }
}

// Expose mock client object mimicking Prisma Client
export const prisma = {
  user: new ModelWrapper('users', 'user'),
  category: new ModelWrapper('categories', 'category'),
  product: new ModelWrapper('products', 'product'),
  address: new ModelWrapper('addresses', 'address'),
  cartItem: new ModelWrapper('cartItems', 'cartItem'),
  wishlistItem: new ModelWrapper('wishlistItems', 'wishlistItem'),
  order: new ModelWrapper('orders', 'order'),
  orderItem: new ModelWrapper('orderItems', 'orderItem'),
  orderTracking: new ModelWrapper('orderTrackings', 'orderTracking'),
  supportTicket: new ModelWrapper('supportTickets', 'supportTicket'),
  coupon: new ModelWrapper('coupons', 'coupon'),
  
  $disconnect: async () => {
    // No-op for Firestore/LocalDB
  }
};

export { admin as firebaseAdmin, useFirestore };
