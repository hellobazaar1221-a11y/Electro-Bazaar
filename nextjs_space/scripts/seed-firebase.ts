import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";

async function main() {
  console.log("🌱 Starting Firebase/Mock database seed...");

  // 1. Seed Admin User
  const adminPassword = await bcrypt.hash("Yuvraj@1221", 10);
  await prisma.user.upsert({
    where: { email: "yuku8434023311@gmail.com" },
    update: {
      password: adminPassword,
      fullName: "R.K Admin",
      role: "ADMIN",
    },
    create: {
      email: "yuku8434023311@gmail.com",
      password: adminPassword,
      fullName: "R.K Admin",
      role: "ADMIN",
      securityQuestion: "What was the name of your first pet?",
      securityAnswer: await bcrypt.hash("admin", 10),
    },
  });
  console.log("✅ Seeded Admin User: yuku8434023311@gmail.com");

  // 2. Seed Test Customer User
  const customerPassword = await bcrypt.hash("johndoe123", 10);
  await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {
      password: customerPassword,
      fullName: "John Doe",
      role: "CUSTOMER",
    },
    create: {
      email: "john@doe.com",
      password: customerPassword,
      fullName: "John Doe",
      role: "CUSTOMER",
      phone: "9876543210",
      securityQuestion: "What was the name of your first pet?",
      securityAnswer: await bcrypt.hash("rocky", 10),
    },
  });
  console.log("✅ Seeded Test Customer User: john@doe.com");

  // 3. Seed Categories
  const categories = [
    { name: "Smartphones", slug: "smartphones", description: "Latest smartphones from top brands", icon: "Smartphone", image: "https://cdn.abacus.ai/images/43fe3e39-178b-4a6a-96ea-8ff350f5c434.png" },
    { name: "Laptops", slug: "laptops", description: "Powerful laptops for work and play", icon: "Laptop", image: "https://cdn.abacus.ai/images/95ace027-c845-48ae-929d-af4d4bd5c784.png" },
    { name: "Televisions", slug: "televisions", description: "Premium TVs with stunning displays", icon: "Tv", image: "https://m.media-amazon.com/images/I/81aMS6p4xlL._AC_UF1000,1000_QL80_.jpg" },
    { name: "Audio", slug: "audio", description: "Headphones, speakers and earbuds", icon: "Headphones", image: "https://d1ncau8tqf99kp.cloudfront.net/converted/103364_original_local_1200x1050_v3_converted.webp" },
    { name: "Accessories", slug: "accessories", description: "Smart accessories and add-ons", icon: "Watch", image: "https://m.media-amazon.com/images/I/71aXGgNCE9L._AC_UF894,1000_QL80_.jpg" },
    { name: "Home Appliances", slug: "home-appliances", description: "Modern home appliances", icon: "Refrigerator", image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800" },
  ];

  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon, image: c.image },
      create: c,
    });
    categoryMap[c.slug] = cat.id;
  }
  console.log(`✅ Seeded ${categories.length} Categories`);

  // 4. Seed Products
  const products = [
    // Smartphones
    { name: "Apple iPhone 15 Pro Max", slug: "apple-iphone-15-pro-max", description: "6.7-inch Super Retina XDR display, A17 Pro chip, 48MP Pro camera system, titanium design. The most advanced iPhone ever.", price: 144900, originalPrice: 159900, discount: 9, stock: 25, brand: "Apple", rating: 4.8, reviewCount: 245, image: "https://m.media-amazon.com/images/I/61+PdZLA6NL.jpg", category: "smartphones", featured: true, trending: true, specs: { Display: "6.7-inch OLED", Processor: "A17 Pro", RAM: "8GB", Storage: "256GB", Battery: "4422mAh", Camera: "48MP Triple" } },
    { name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", description: "Galaxy AI is here. 6.8-inch Dynamic AMOLED 2X, Snapdragon 8 Gen 3, 200MP camera, built-in S Pen.", price: 129999, originalPrice: 139999, discount: 7, stock: 30, brand: "Samsung", rating: 4.7, reviewCount: 198, image: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6570/6570297_sd.jpg;maxHeight=828;maxWidth=400?format=webp", category: "smartphones", featured: true, trending: true, specs: { Display: "6.8-inch AMOLED", Processor: "Snapdragon 8 Gen 3", RAM: "12GB", Storage: "256GB", Battery: "5000mAh", Camera: "200MP Quad" } },
    { name: "OnePlus 12", slug: "oneplus-12", description: "Flagship killer is back. Snapdragon 8 Gen 3, Hasselblad cameras, 100W SUPERVOOC charging.", price: 64999, originalPrice: 69999, discount: 7, stock: 40, brand: "OnePlus", rating: 4.6, reviewCount: 156, image: "https://oasis.opstatics.com/content/dam/oasis/page/2023/cn/12/12-green.png", category: "smartphones", featured: true, trending: false, specs: { Display: "6.82-inch LTPO AMOLED", Processor: "Snapdragon 8 Gen 3", RAM: "16GB", Storage: "512GB", Battery: "5400mAh", Camera: "50MP Hasselblad" } },
    { name: "Xiaomi Redmi Note 13 Pro", slug: "xiaomi-redmi-note-13-pro", description: "200MP camera, 120Hz AMOLED display, MediaTek Dimensity 7200 Ultra. Pro features at a great price.", price: 24999, originalPrice: 27999, discount: 11, stock: 60, brand: "Xiaomi", rating: 4.4, reviewCount: 312, image: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-13-pro/m/d023af592ae2eff5cae8137bb85ba8b6.jpg", category: "smartphones", featured: false, trending: true, specs: { Display: "6.67-inch AMOLED", Processor: "Dimensity 7200 Ultra", RAM: "8GB", Storage: "256GB", Battery: "5100mAh", Camera: "200MP Triple" } },
    { name: "Realme GT Neo 6", slug: "realme-gt-neo-6", description: "6.78-inch 1.5K AMOLED, Snapdragon 8s Gen 3, 5500mAh battery with 120W charging.", price: 29999, originalPrice: 33999, discount: 12, stock: 45, brand: "Realme", rating: 4.3, reviewCount: 87, image: "https://www.giztop.com/media/catalog/product/cache/97cc1143d2e20f2b0c8ea91aaa12053c/r/e/realme_gt_neo_6.png", category: "smartphones", featured: false, trending: true, specs: { Display: "6.78-inch AMOLED", Processor: "Snapdragon 8s Gen 3", RAM: "12GB", Storage: "256GB", Battery: "5500mAh", Camera: "50MP Sony" } },

    // Laptops
    { name: "Apple MacBook Air M3", slug: "apple-macbook-air-m3", description: "Supercharged by M3. 13.6-inch Liquid Retina display, up to 18 hours of battery life, fanless design.", price: 114900, originalPrice: 119900, discount: 4, stock: 20, brand: "Apple", rating: 4.9, reviewCount: 178, image: "https://www.applefixpros.com/wp-content/uploads/2025/02/mba13-m3-silver-gallery1-202402-scaled.jpeg", category: "laptops", featured: true, trending: true, specs: { Display: "13.6-inch Liquid Retina", Processor: "Apple M3", RAM: "8GB", Storage: "256GB SSD", Battery: "18 hours", Weight: "1.24 kg" } },
    { name: "Dell XPS 15", slug: "dell-xps-15", description: "15.6-inch InfinityEdge display, Intel Core i7, NVIDIA RTX 4060, premium build for creators.", price: 189999, originalPrice: 209999, discount: 10, stock: 12, brand: "Dell", rating: 4.6, reviewCount: 92, image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-black/notebook-xps-15-9530-t-black-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&wid=3778&hei=2323&qlt=100,1&resMode=sharp2&size=3778,2323&chrss=full&imwidth=5000", category: "laptops", featured: true, trending: false, specs: { Display: "15.6-inch OLED", Processor: "Intel i7-13700H", RAM: "16GB", Storage: "512GB SSD", GPU: "RTX 4060", Weight: "1.86 kg" } },
    { name: "HP Pavilion 15", slug: "hp-pavilion-15", description: "15.6-inch FHD display, Intel Core i5, ideal for work and entertainment at a great price.", price: 54999, originalPrice: 64999, discount: 15, stock: 35, brand: "HP", rating: 4.3, reviewCount: 215, image: "https://m.media-amazon.com/images/I/81NF8kgcsZL.jpg", category: "laptops", featured: false, trending: true, specs: { Display: "15.6-inch FHD", Processor: "Intel i5-1335U", RAM: "16GB", Storage: "512GB SSD", GPU: "Intel Iris Xe", Weight: "1.75 kg" } },
    { name: "Lenovo ThinkPad X1 Carbon", slug: "lenovo-thinkpad-x1-carbon", description: "Ultralight business laptop with Intel Evo, 14-inch IPS display, legendary keyboard.", price: 159999, originalPrice: 179999, discount: 11, stock: 15, brand: "Lenovo", rating: 4.7, reviewCount: 67, image: "https://m.media-amazon.com/images/I/71B06cYCkyL.jpg", category: "laptops", featured: false, trending: false, specs: { Display: "14-inch IPS", Processor: "Intel i7-1365U", RAM: "16GB", Storage: "1TB SSD", Battery: "15 hours", Weight: "1.12 kg" } },
    { name: "ASUS ROG Strix G16", slug: "asus-rog-strix-g16", description: "Gaming powerhouse. Intel Core i9, NVIDIA RTX 4070, 16-inch QHD 240Hz display.", price: 174990, originalPrice: 194990, discount: 10, stock: 18, brand: "ASUS", rating: 4.5, reviewCount: 124, image: "https://dlcdnwebimgs.asus.com/files/media/71a33ba1-1be2-44c1-9541-70b4c800abf8/v1/images/Strix_G16_KV_1x1.webp", category: "laptops", featured: true, trending: true, specs: { Display: "16-inch QHD 240Hz", Processor: "Intel i9-13980HX", RAM: "16GB", Storage: "1TB SSD", GPU: "RTX 4070", Weight: "2.5 kg" } },

    // Televisions
    { name: "Samsung Neo QLED 55-inch", slug: "samsung-neo-qled-55", description: "Quantum Mini LED technology, 4K AI Upscaling, Dolby Atmos, Neo Quantum Processor.", price: 124999, originalPrice: 149999, discount: 17, stock: 10, brand: "Samsung", rating: 4.7, reviewCount: 89, image: "https://images.samsung.com/is/image/samsung/p6pim/us/qn55qn90fafxza/gallery/us-qled-qn90f-qn55qn90fafxza-550561131?$product-details-jpg$", category: "televisions", featured: true, trending: true, specs: { Display: "55-inch Neo QLED", Resolution: "4K UHD", HDR: "HDR10+", Audio: "Dolby Atmos", Smart: "Tizen OS", Refresh: "120Hz" } },
    { name: "LG OLED C4 55-inch", slug: "lg-oled-c4-55", description: "Self-lit OLED pixels, \u03b19 AI Processor Gen7, perfect blacks, Dolby Vision IQ.", price: 149990, originalPrice: 179990, discount: 17, stock: 8, brand: "LG", rating: 4.8, reviewCount: 145, image: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/74b88666-bc93-4e40-853d-5e486a90d8d3.jpg;maxHeight=828;maxWidth=400?format=webp", category: "televisions", featured: true, trending: false, specs: { Display: "55-inch OLED", Resolution: "4K UHD", HDR: "Dolby Vision IQ", Audio: "Dolby Atmos", Smart: "webOS 24", Refresh: "120Hz" } },
    { name: "Sony Bravia XR A80L", slug: "sony-bravia-xr-a80l", description: "BRAVIA XR cognitive processor, OLED panel with XR Triluminos Pro, premium cinematic experience.", price: 169990, originalPrice: 199990, discount: 15, stock: 6, brand: "Sony", rating: 4.7, reviewCount: 76, image: "https://m.media-amazon.com/images/I/81aMS6p4xlL._AC_UF1000,1000_QL80_.jpg", category: "televisions", featured: false, trending: true, specs: { Display: "55-inch OLED", Resolution: "4K UHD", HDR: "Dolby Vision", Audio: "Acoustic Surface Audio+", Smart: "Google TV", Refresh: "120Hz" } },

    // Audio
    { name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", description: "Industry-leading noise cancellation, 30-hour battery life, crystal clear hands-free calling.", price: 29990, originalPrice: 34990, discount: 14, stock: 50, brand: "Sony", rating: 4.8, reviewCount: 423, image: "https://d1ncau8tqf99kp.cloudfront.net/converted/103364_original_local_1200x1050_v3_converted.webp", category: "audio", featured: true, trending: true, specs: { Type: "Over-Ear", ANC: "Yes", Battery: "30 hours", Connectivity: "Bluetooth 5.2", Driver: "30mm", Weight: "250g" } },
    { name: "Apple AirPods Pro 2", slug: "apple-airpods-pro-2", description: "Active Noise Cancellation, Adaptive Transparency, Personalised Spatial Audio with MagSafe charging case.", price: 24990, originalPrice: 26900, discount: 7, stock: 75, brand: "Apple", rating: 4.7, reviewCount: 567, image: "https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111851_sp880-airpods-Pro-2nd-gen.png", category: "audio", featured: true, trending: true, specs: { Type: "In-Ear", ANC: "Yes", Battery: "30 hours total", Chip: "Apple H2", Charging: "MagSafe / USB-C", Sweat: "IPX4" } },
    { name: "JBL Flip 6", slug: "jbl-flip-6", description: "Portable Bluetooth speaker with bold JBL Original Pro Sound, IP67 waterproof, 12 hours playtime.", price: 9999, originalPrice: 11999, discount: 17, stock: 90, brand: "JBL", rating: 4.5, reviewCount: 689, image: "https://global.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw46cc380c/1_JBL_FLIP6_HERO_TEAL_29399_x1.png?sw=535&sh=535", category: "audio", featured: false, trending: true, specs: { Type: "Portable Speaker", Battery: "12 hours", Connectivity: "Bluetooth 5.1", Waterproof: "IP67", Output: "30W", Weight: "550g" } },

    // Accessories
    { name: "Apple Watch Series 9", slug: "apple-watch-series-9", description: "Smarter, brighter, mightier. New S9 chip, Double Tap gesture, brightest Always-On Retina display.", price: 41900, originalPrice: 45900, discount: 9, stock: 40, brand: "Apple", rating: 4.7, reviewCount: 234, image: "https://m.media-amazon.com/images/I/71aXGgNCE9L._AC_UF894,1000_QL80_.jpg", category: "accessories", featured: true, trending: true, specs: { Display: "Always-On Retina", Chip: "S9 SiP", Battery: "18 hours", Water: "50m WR", Health: "ECG, SpO2", GPS: "Yes" } },
    { name: "Logitech MX Master 3S", slug: "logitech-mx-master-3s", description: "Performance wireless mouse with quiet clicks, 8K DPI tracking, Bluetooth and USB-C charging.", price: 9495, originalPrice: 11995, discount: 21, stock: 65, brand: "Logitech", rating: 4.7, reviewCount: 312, image: "https://www.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/2025-update/mx-master-3s-bluetooth-edition-top-view-black-new-1.png", category: "accessories", featured: false, trending: false, specs: { DPI: "8000", Connectivity: "Bluetooth / USB", Battery: "70 days", Buttons: "7", Weight: "141g", Charging: "USB-C" } },
    { name: "Anker 65W GaN Charger", slug: "anker-65w-gan-charger", description: "Powerful 65W GaN II charger with 3 ports. Charge laptops, phones, and tablets simultaneously.", price: 3499, originalPrice: 4999, discount: 30, stock: 120, brand: "Anker", rating: 4.6, reviewCount: 458, image: "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A2663111-Anker_715_Charger_Nano_II_65W.png?v=1767756360", category: "accessories", featured: false, trending: true, specs: { Power: "65W", Ports: "USB-C / USB-A", Tech: "GaN II", Compatibility: "MacBook, iPhone, Galaxy", Foldable: "Yes", Weight: "112g" } },
    { name: "Samsung T7 SSD 1TB", slug: "samsung-t7-ssd-1tb", description: "Portable solid state drive with up to 1050MB/s transfer speed, shock-resistant, secure encryption.", price: 8999, originalPrice: 12999, discount: 31, stock: 80, brand: "Samsung", rating: 4.7, reviewCount: 521, image: "https://images.samsung.com/is/image/samsung/p6pim/us/mu-pc1t0h-am/gallery/us-portable-ssd-t7-574760-mu-pc1t0h-am-550551662?$product-details-jpg$", category: "accessories", featured: false, trending: false, specs: { Capacity: "1TB", Speed: "1050 MB/s", Interface: "USB 3.2 Gen 2", Encryption: "AES 256-bit", Weight: "58g", Warranty: "3 years" } },
    { name: "boAt Smartwatch Wave", slug: "boat-smartwatch-wave", description: "1.83-inch HD display, 100+ sports modes, heart rate, SpO2, 7-day battery life. Made in India.", price: 1799, originalPrice: 5990, discount: 70, stock: 200, brand: "boAt", rating: 4.2, reviewCount: 1245, image: "https://m.media-amazon.com/images/I/61ZuL8CUigL._AC_UF1000,1000_QL80_.jpg", category: "accessories", featured: false, trending: true, specs: { Display: "1.83-inch HD", Battery: "7 days", Modes: "100+ sports", Calls: "Bluetooth Calling", Water: "IP68", App: "boAt Wave" } },

    // Home Appliances
    { name: "LG 7kg Front Load Washer", slug: "lg-7kg-front-load-washer", description: "AI Direct Drive, Steam+, smart diagnosis. Gentle on fabric, tough on stains.", price: 38990, originalPrice: 44990, discount: 13, stock: 15, brand: "LG", rating: 4.5, reviewCount: 156, image: "https://images.webfronts.com/cache/frlfkkytuape.jpg", category: "home-appliances", featured: true, trending: false, specs: { Capacity: "7 kg", Type: "Front Load", Tech: "AI Direct Drive", Energy: "5 Star", Programs: "14", Warranty: "10 years motor" } },
    { name: "Samsung 580L Side-by-Side", slug: "samsung-580l-fridge", description: "SpaceMax Technology, Digital Inverter Compressor, Twin Cooling Plus, 10-year warranty.", price: 79990, originalPrice: 94990, discount: 16, stock: 8, brand: "Samsung", rating: 4.4, reviewCount: 98, image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800", category: "home-appliances", featured: true, trending: true, specs: { Capacity: "580 L", Type: "Side-by-Side", Tech: "Digital Inverter", Energy: "3 Star", Cooling: "Twin Cooling Plus", Warranty: "10 years compressor" } },
    { name: "Mi Air Purifier 4", slug: "mi-air-purifier-4", description: "True HEPA filter, removes 99.97% of pollutants, smart app control, 360-degree air intake.", price: 11999, originalPrice: 14999, discount: 20, stock: 30, brand: "Xiaomi", rating: 4.4, reviewCount: 287, image: "https://m.media-amazon.com/images/I/71jQqynFuVL._AC_UF1000,1000_QL80_.jpg", category: "home-appliances", featured: false, trending: true, specs: { Coverage: "40 sq.m", Filter: "True HEPA H13", Noise: "32 dB", PM2_5: "Display", Smart: "Mi Home App", CADR: "400 m3/h" } },
  ];

  for (const p of products) {
    const { category, ...rest } = p as any;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...rest, isActive: true, categoryId: categoryMap[category] },
      create: { ...rest, isActive: true, categoryId: categoryMap[category] },
    });
  }

  console.log("🌱 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  });
