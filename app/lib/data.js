import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const items = [
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with silent clicks",
      price: 799,
      category: "Electronics",
      imageUrl: "https://images.pexels.com/photos/3945650/pexels-photo-3945650.jpeg",
      stock: 120,
      reason: "Best for students and professionals needing comfort for long hours.",
    },
    {
      name: "Bluetooth Headphones",
      description: "Noise-cancelling over-ear headphones with deep bass",
      price: 2499,
      category: "Electronics",
      imageUrl: "https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg",
      stock: 80,
      reason: "Perfect for immersive sound experience.",
    },
    {
      name: "Office Chair",
      description: "Comfortable mesh chair for long working hours",
      price: 5499,
      category: "Furniture",
      imageUrl: "https://images.pexels.com/photos/813691/pexels-photo-813691.jpeg",
      stock: 50,
      reason: "Ideal for productivity and posture support.",
    },
    {
      name: "Smartwatch",
      description: "Water-resistant fitness tracker with heart rate monitor",
      price: 3299,
      category: "Gadgets",
      imageUrl: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg",
      stock: 90,
      reason: "Tracks your health and daily steps accurately.",
    },
    {
      name: "Study Table",
      description: "Wooden table with drawers for study or work",
      price: 6999,
      category: "Furniture",
      imageUrl: "https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg",
      stock: 35,
      reason: "Strong build and elegant finish for modern homes.",
    },
    {
      name: "Keyboard Combo",
      description: "Wireless keyboard and mouse combo with long battery life",
      price: 1499,
      category: "Electronics",
      imageUrl: "https://images.pexels.com/photos/121027/pexels-photo-121027.jpeg",
      stock: 200,
      reason: "Perfect for office and home use.",
    },
    {
      name: "Table Lamp",
      description: "Minimalist LED lamp with touch control and dimmer",
      price: 1899,
      category: "Home Decor",
      imageUrl: "https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg",
      stock: 65,
      reason: "Makes your evenings cozy.",
    },
    {
      name: "Backpack",
      description: "Waterproof laptop backpack with USB charging port",
      price: 2199,
      category: "Accessories",
      imageUrl: "https://images.pexels.com/photos/374563/pexels-photo-374563.jpeg",
      stock: 150,
      reason: "Best companion for students and travelers.",
    },
    {
      name: "Portable Speaker",
      description: "Compact Bluetooth speaker with 12-hour playtime",
      price: 1799,
      category: "Electronics",
      imageUrl: "https://images.pexels.com/photos/63703/pexels-photo-63703.jpeg",
      stock: 120,
      reason: "Crystal clear sound and deep bass.",
    },
    {
      name: "Coffee Mug",
      description: "Ceramic mug with motivational quote",
      price: 399,
      category: "Kitchen",
      imageUrl: "https://images.pexels.com/photos/585750/pexels-photo-585750.jpeg",
      stock: 300,
      reason: "Start your day with inspiration!",
    },
  ];

  await prisma.item.createMany({ data: items });
  console.log("✅ Items inserted successfully!");
}

main()
  .catch((e) => {
    console.error("Error inserting data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
