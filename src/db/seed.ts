import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

const client = createClient({
  url: process.env.DATABASE_URL || "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function main() {
  console.log("Seeding database...");

  // Reset or check
  const existingUsers = await db.select().from(schema.users).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  // 1. Password hash
  const passwordHash = await bcrypt.hash("password123", 10);

  // 2. Insert Users
  console.log("Inserting users...");
  const adminId = crypto.randomUUID();
  const customerId = crypto.randomUUID();
  const deliveryBoyUserId = crypto.randomUUID();

  await db.insert(schema.users).values([
    {
      id: adminId,
      email: "admin@grocery.com",
      passwordHash,
      role: "ADMIN",
      firstName: "System",
      lastName: "Admin",
      phone: "1234567890",
    },
    {
      id: customerId,
      email: "customer@grocery.com",
      passwordHash,
      role: "CUSTOMER",
      firstName: "John",
      lastName: "Doe",
      phone: "9876543210",
    },
    {
      id: deliveryBoyUserId,
      email: "driver@grocery.com",
      passwordHash,
      role: "DELIVERY_BOY",
      firstName: "Fast",
      lastName: "Rider",
      phone: "5555555555",
    },
  ]);

  // 3. Insert Delivery Boy Profile
  console.log("Inserting delivery boy profile...");
  const deliveryBoyId = crypto.randomUUID();
  await db.insert(schema.deliveryBoys).values({
    id: deliveryBoyId,
    userId: deliveryBoyUserId,
    vehicleNumber: "AB-12-CD-3456",
    status: "ACTIVE",
  });

  // 4. Insert Address
  console.log("Inserting default customer address...");
  await db.insert(schema.addresses).values({
    id: crypto.randomUUID(),
    userId: customerId,
    label: "Home",
    address: "123 Main Street, Apt 4B",
    landmark: "Near Central Park",
    city: "New York",
    state: "NY",
    pincode: "10001",
    isDefault: 1,
  });

  // 5. Insert Categories
  console.log("Inserting categories...");
  const categoriesData = [
    { id: crypto.randomUUID(), name: "Fruits & Vegetables", slug: "fruits-and-vegetables" },
    { id: crypto.randomUUID(), name: "Dairy & Eggs", slug: "dairy-and-eggs" },
    { id: crypto.randomUUID(), name: "Bakery & Bread", slug: "bakery-and-bread" },
    { id: crypto.randomUUID(), name: "Beverages", slug: "beverages" },
    { id: crypto.randomUUID(), name: "Snacks", slug: "snacks" },
  ];

  await db.insert(schema.categories).values(categoriesData);

  // 6. Insert Products
  console.log("Inserting products...");
  const productsData = [
    // Fruits & Vegetables
    {
      id: crypto.randomUUID(),
      categoryId: categoriesData[0].id,
      name: "Organic Bananas",
      slug: "organic-bananas",
      description: "Fresh organic bananas, rich in potassium.",
      price: 199, // $1.99
      sku: "FRT-BAN-01",
      stockQty: 100,
      unit: "bunch",
    },
    {
      id: crypto.randomUUID(),
      categoryId: categoriesData[0].id,
      name: "Red Apples",
      slug: "red-apples",
      description: "Sweet and crunchy red apples.",
      price: 299, // $2.99
      sku: "FRT-APP-02",
      stockQty: 150,
      unit: "kg",
    },
    // Dairy & Eggs
    {
      id: crypto.randomUUID(),
      categoryId: categoriesData[1].id,
      name: "Fresh Whole Milk",
      slug: "fresh-whole-milk",
      description: "Pasteurized whole milk from local dairy farms.",
      price: 349, // $3.49
      sku: "DRY-MLK-01",
      stockQty: 50,
      unit: "gallon",
    },
    {
      id: crypto.randomUUID(),
      categoryId: categoriesData[1].id,
      name: "Free Range Eggs",
      slug: "free-range-eggs",
      description: "One dozen large free-range brown eggs.",
      price: 499, // $4.99
      sku: "DRY-EGG-02",
      stockQty: 80,
      unit: "dozen",
    },
    // Bakery & Bread
    {
      id: crypto.randomUUID(),
      categoryId: categoriesData[2].id,
      name: "Sourdough Bread",
      slug: "sourdough-bread",
      description: "Freshly baked artisanal sourdough bread.",
      price: 549, // $5.49
      sku: "BAK-SDR-01",
      stockQty: 30,
      unit: "loaf",
    },
  ];

  await db.insert(schema.products).values(productsData);

  console.log("Database seeded successfully!");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
