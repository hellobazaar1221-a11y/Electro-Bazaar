const fs = require('fs');
const path = require('path');

async function main() {
  const filePath = path.resolve(__dirname, '../firebase-mock.json');
  if (!fs.existsSync(filePath)) {
    console.error('firebase-mock.json not found');
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  // 1. Upgrade existing products to have 'images' array if missing
  data.products = data.products.map(p => {
    if (!p.images || !Array.isArray(p.images)) {
      p.images = [p.image];
    }
    return p;
  });

  // Helper to generate a unique mock ID
  const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const newProducts = [
    {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: "Apple iPad Pro M4 (13-inch)",
      slug: "apple-ipad-pro-m4-13-inch",
      description: "Thinpossible. The all-new iPad Pro is incredibly thin, featuring outrageous performance with the Apple M4 chip, a breakthrough Ultra Retina XDR display, and superfast Wi-Fi 6E.",
      price: 129900,
      originalPrice: 139900,
      discount: 7,
      stock: 15,
      brand: "Apple",
      rating: 4.9,
      reviewCount: 88,
      image: "https://m.media-amazon.com/images/I/61fA8F7vMIL._SX679_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/61fA8F7vMIL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61Q3Y7g8JWL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61Z6571QkFL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61R-d7F1TLL._SX679_.jpg"
      ],
      featured: true,
      trending: true,
      specs: {
        "Display": "13-inch Tandem OLED",
        "Processor": "Apple M4 Chip",
        "RAM": "8GB Unified",
        "Storage": "256GB SSD",
        "Thickness": "5.1 mm",
        "Connectivity": "Wi-Fi 6E, Bluetooth 5.3"
      },
      categoryId: "qldiqfywqrgzawgr6dbcz" // Laptops
    },
    {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: "Sony PlayStation 5 Slim",
      slug: "sony-playstation-5-slim",
      description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games.",
      price: 44990,
      originalPrice: 54990,
      discount: 18,
      stock: 40,
      brand: "Sony",
      rating: 4.8,
      reviewCount: 312,
      image: "https://m.media-amazon.com/images/I/51r5aF5M7tL._SX522_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/51r5aF5M7tL._SX522_.jpg",
        "https://m.media-amazon.com/images/I/61y8B34QzKL._SX522_.jpg",
        "https://m.media-amazon.com/images/I/6105M1D0f5L._SX522_.jpg",
        "https://m.media-amazon.com/images/I/61d-h7G8aIL._SX522_.jpg"
      ],
      featured: true,
      trending: true,
      specs: {
        "Console": "Disc Edition (Slim)",
        "Storage": "1TB Custom SSD",
        "Graphics": "AMD Radeon RDNA 2",
        "Resolution": "Supports 4K 120Hz & 8K",
        "Audio": "Tempest 3D AudioTech",
        "Controller": "DualSense Wireless Controller"
      },
      categoryId: "vz1l45nu6fk728g93zilqj" // Accessories
    },
    {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: "Bose QuietComfort Ultra Headphones",
      slug: "bose-quietcomfort-ultra-headphones",
      description: "World-class noise cancellation, quieter than ever before. Breakthrough spatialized audio for more immersive listening. Premium materials and deluxe comfort for long sessions.",
      price: 35900,
      originalPrice: 39900,
      discount: 10,
      stock: 25,
      brand: "Bose",
      rating: 4.7,
      reviewCount: 142,
      image: "https://m.media-amazon.com/images/I/51QeS0Z7n0L._SX522_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/51QeS0Z7n0L._SX522_.jpg",
        "https://m.media-amazon.com/images/I/61a34vP96mL._SX522_.jpg",
        "https://m.media-amazon.com/images/I/611ZzF44bNL._SX522_.jpg",
        "https://m.media-amazon.com/images/I/61lqX2K8TKL._SX522_.jpg"
      ],
      featured: true,
      trending: false,
      specs: {
        "Type": "Over-Ear Wireless",
        "ANC": "Custom Active Noise Cancelling",
        "Battery Life": "Up to 24 hours",
        "Audio": "Immersive Audio (Spatial)",
        "Bluetooth": "Version 5.3 (aptX Adaptive)",
        "Weight": "250 g"
      },
      categoryId: "3bceh0h153uyq143ym7qpo" // Audio
    },
    {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: "Dyson V15 Detect Cordless Vacuum",
      slug: "dyson-v15-detect-cordless-vacuum",
      description: "The most powerful, intelligent cordless vacuum cleaner. A piezo sensor continuously sizes and counts dust particles – automatically increasing suction power when needed.",
      price: 65900,
      originalPrice: 74900,
      discount: 12,
      stock: 12,
      brand: "Dyson",
      rating: 4.7,
      reviewCount: 95,
      image: "https://m.media-amazon.com/images/I/61Jc7Bq6lKL._SX522_.jpg",
      images: [
        "https://m.media-amazon.com/images/I/61Jc7Bq6lKL._SX522_.jpg",
        "https://m.media-amazon.com/images/I/61t-X7G2pIL._SX522_.jpg",
        "https://m.media-amazon.com/images/I/61U-D7G5dIL._SX522_.jpg"
      ],
      featured: false,
      trending: true,
      specs: {
        "Suction Power": "240 AW",
        "Run Time": "Up to 60 minutes",
        "Weight": "3 kg",
        "Bin Volume": "0.76 L",
        "Filtration": "Whole-machine HEPA filtration",
        "Technology": "Laser Dust Detection"
      },
      categoryId: "wdf9rytwo5cfref43cpit6" // Home Appliances
    }
  ];

  // Add only if they don't already exist by slug
  newProducts.forEach(newP => {
    if (!data.products.some(p => p.slug === newP.slug)) {
      data.products.push(newP);
      console.log(`Added product: ${newP.name}`);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully upgraded existing products and seeded new example products!');
}

main().catch(err => {
  console.error('Error seeding examples:', err);
});
