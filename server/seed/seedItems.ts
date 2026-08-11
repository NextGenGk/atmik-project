import "dotenv/config";
import mongoose from "mongoose";
import { Item } from "../src/models/Item.js";
import { env } from "../src/config/env.js";

const items = [
  // Produce
  { itemName: "Organic Bananas 1kg", sku: "PR-BAN-1K", category: "Produce", price: 1.8, quantity: 120, storageLocation: "Cooler A-1" },
  { itemName: "Gala Apples (bag of 6)", sku: "PR-APP-G6", category: "Produce", price: 3.5, quantity: 85, storageLocation: "Cooler A-1" },
  { itemName: "Roma Tomatoes 500g", sku: "PR-TOM-R5", category: "Produce", price: 2.2, quantity: 8, storageLocation: "Cooler A-1" },
  // Dairy & Eggs
  { itemName: "Whole Milk 2L Carton", sku: "DA-MLK-2L", category: "Dairy & Eggs", price: 4.25, quantity: 60, storageLocation: "Cooler B-1" },
  { itemName: "Free-Range Eggs 12pk", sku: "DA-EGG-12", category: "Dairy & Eggs", price: 5.6, quantity: 45, storageLocation: "Cooler B-1" },
  { itemName: "Salted Butter 500g", sku: "DA-BTR-500", category: "Dairy & Eggs", price: 6.4, quantity: 30, storageLocation: "Cooler B-2" },
  // Bakery
  { itemName: "Sourdough Loaf 600g", sku: "BK-SDG-600", category: "Bakery", price: 5.9, quantity: 24, storageLocation: "Bakery Stand 1" },
  { itemName: "Croissant 4-pack", sku: "BK-CRS-4", category: "Bakery", price: 4.5, quantity: 36, storageLocation: "Bakery Stand 2" },
  { itemName: "Whole Wheat Bread 700g", sku: "BK-WWB-700", category: "Bakery", price: 3.1, quantity: 40, storageLocation: "Bakery Stand 1" },
  // Beverages
  { itemName: "Cola 1.5L Bottle", sku: "BV-COL-15", category: "Beverages", price: 2.9, quantity: 150, storageLocation: "Aisle 3" },
  { itemName: "Orange Juice 1L", sku: "BV-OJ-1L", category: "Beverages", price: 3.7, quantity: 3, storageLocation: "Cooler C-1" },
  { itemName: "Filter Coffee 500g", sku: "BV-CFF-500", category: "Beverages", price: 12.5, quantity: 28, storageLocation: "Aisle 3" },
  // Dry Goods
  { itemName: "Basmati Rice 5kg", sku: "DG-RICE-5K", category: "Dry Goods", price: 15.9, quantity: 55, storageLocation: "Aisle 1" },
  { itemName: "Olive Oil Extra Virgin 1L", sku: "DG-OLV-1L", category: "Dry Goods", price: 11.8, quantity: 40, storageLocation: "Aisle 1" },
  { itemName: "Spaghetti Pasta 500g", sku: "DG-SPG-500", category: "Dry Goods", price: 1.6, quantity: 200, storageLocation: "Aisle 2" },
  // Frozen
  { itemName: "Frozen Peas 1kg", sku: "FZ-PEA-1K", category: "Frozen", price: 3.3, quantity: 70, storageLocation: "Freezer 1" },
  { itemName: "Vanilla Ice Cream 2L", sku: "FZ-VIC-2L", category: "Frozen", price: 7.2, quantity: 22, storageLocation: "Freezer 2" },
  // Snacks
  { itemName: "Potato Chips 150g", sku: "SN-CHP-150", category: "Snacks", price: 2.4, quantity: 180, storageLocation: "Aisle 4" },
  { itemName: "Dark Chocolate 70% 100g", sku: "SN-CHO-100", category: "Snacks", price: 3.6, quantity: 0, storageLocation: "Aisle 4" },
];

async function seed(): Promise<void> {
  if (!env.MONGO_URI) {
    console.error("MONGO_URI is required. Copy server/.env.example → server/.env and set it.");
    process.exit(1);
  }

  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("✅ Connected to MongoDB");

  await Item.deleteMany({});
  console.log("🧹 Cleared existing items");

  const inserted = await Item.insertMany(items);
  console.log(`🌱 Seeded ${inserted.length} items`);

  const counts = await Item.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  console.log("📦 Categories:", counts.map((c) => `${c._id} (${c.count})`).join(", "));

  console.log("🔍 Try: search 'bread', filter category 'Dairy & Eggs', or barcode 'BV-OJ-1L'");
  console.log("⚠️  Low-stock demo rows: PR-TOM-R5 (qty 8), BV-OJ-1L (qty 3), SN-CHO-100 (qty 0)");

  await mongoose.disconnect();
  console.log("✅ Done");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", (err as Error).message);
  process.exit(1);
});
