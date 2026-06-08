import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing Firebase credentials");
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });

  const firestore = admin.firestore();
  
  const email = 'electrobazaar0@gmail.com';
  const newPassword = 'Yuvraj@122112';

  const snapshot = await firestore.collection('users').where('email', '==', email).get();
  
  if (snapshot.empty) {
    console.log(`User ${email} not found. Creating...`);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    await firestore.collection('users').add({
      email: email,
      password: hash,
      fullName: 'Admin User',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Admin user created.");
  } else {
    console.log(`User ${email} found. Updating password...`);
    const docId = snapshot.docs[0].id;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    await firestore.collection('users').doc(docId).update({
      password: hash,
      role: 'ADMIN',
      updatedAt: new Date()
    });
    console.log("Admin password updated.");
  }
}

updateAdmin().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
