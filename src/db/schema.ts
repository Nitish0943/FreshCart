import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// ==========================================
// 1. USERS TABLE
// ==========================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["ADMIN", "CUSTOMER", "DELIVERY_BOY"] }).notNull().default("CUSTOMER"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone").unique(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: text("deleted_at"),
}, (table) => [
  uniqueIndex("users_email_idx").on(table.email),
  index("users_phone_idx").on(table.phone),
  index("users_role_idx").on(table.role),
]);

export const usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  carts: many(carts),
  orders: many(orders),
  sessions: many(sessions),
  deliveryBoyProfile: one(deliveryBoys, {
    fields: [users.id],
    references: [deliveryBoys.userId],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ==========================================
// 2. CATEGORIES TABLE
// ==========================================
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  isActive: integer("is_active").default(1).notNull(), // 1 = true, 0 = false
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: text("deleted_at"),
}, (table) => [
  uniqueIndex("categories_slug_idx").on(table.slug),
]);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ==========================================
// 3. PRODUCTS TABLE
// ==========================================
export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: real("price").notNull(), // stored as decimal (₹)
  sku: text("sku").notNull().unique(),
  stockQty: integer("stock_qty").default(0).notNull(),
  unit: text("unit").default("pcs").notNull(), // e.g. "kg", "pcs", "pack"
  imageUrl: text("image_url"),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: text("deleted_at"),
}, (table) => [
  uniqueIndex("products_slug_idx").on(table.slug),
  uniqueIndex("products_sku_idx").on(table.sku),
  index("products_category_idx").on(table.categoryId),
]);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

// ==========================================
// 4. ADDRESSES TABLE
// ==========================================
export const addresses = sqliteTable("addresses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // e.g. "Home", "Office"
  address: text("address").notNull(), // full address
  landmark: text("landmark"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  isDefault: integer("is_default").default(0).notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: text("deleted_at"),
}, (table) => [
  index("addresses_user_idx").on(table.userId),
]);

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

// ==========================================
// 5. CARTS TABLE
// ==========================================
export const carts = sqliteTable("carts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // nullable for guests
  sessionToken: text("session_token").unique(), // identifier for guest carts
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: text("deleted_at"),
}, (table) => [
  index("carts_user_idx").on(table.userId),
  uniqueIndex("carts_session_idx").on(table.sessionToken),
]);

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  cartItems: many(cartItems),
}));

// ==========================================
// 6. CART ITEMS TABLE (Junction)
// ==========================================
export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  cartId: text("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index("cart_items_cart_idx").on(table.cartId),
  index("cart_items_product_idx").on(table.productId),
]);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// ==========================================
// 7. ORDERS TABLE
// ==========================================
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  addressId: text("address_id").notNull().references(() => addresses.id, { onDelete: "restrict" }),
  totalAmount: real("total_amount").notNull(), // decimal (₹)
  status: text("status", { enum: ["RECEIVED", "PACKING", "READY", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] }).notNull().default("RECEIVED"),
  paymentStatus: text("payment_status", { enum: ["PENDING", "PAID", "FAILED"] }).notNull().default("PENDING"),
  paymentMethod: text("payment_method", { enum: ["COD", "CARD", "UPI"] }).notNull().default("COD"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: text("deleted_at"),
  batchId: text("batch_id").references(() => deliveryBatches.id, { onDelete: "set null" }),
}, (table) => [
  index("orders_user_idx").on(table.userId),
  index("orders_status_idx").on(table.status),
]);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  orderItems: many(orderItems),
  assignments: many(assignments),
  batch: one(deliveryBatches, {
    fields: [orders.batchId],
    references: [deliveryBatches.id],
  }),
}));

// ==========================================
// 8. ORDER ITEMS TABLE
// ==========================================
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(), // decimal (₹)
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index("order_items_order_idx").on(table.orderId),
  index("order_items_product_idx").on(table.productId),
]);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ==========================================
// 9. DELIVERY BOYS TABLE
// ==========================================
export const deliveryBoys = sqliteTable("delivery_boys", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  vehicleNumber: text("vehicle_number").notNull(),
  status: text("status", { enum: ["ACTIVE", "OFFLINE", "BUSY"] }).notNull().default("OFFLINE"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: text("deleted_at"),
}, (table) => [
  uniqueIndex("delivery_boys_user_idx").on(table.userId),
  index("delivery_boys_status_idx").on(table.status),
]);

export const deliveryBoysRelations = relations(deliveryBoys, ({ one, many }) => ({
  user: one(users, {
    fields: [deliveryBoys.userId],
    references: [users.id],
  }),
  assignments: many(assignments),
  batches: many(deliveryBatches),
}));

// ==========================================
// 10. ASSIGNMENTS TABLE
// ==========================================
export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  deliveryBoyId: text("delivery_boy_id").notNull().references(() => deliveryBoys.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["ASSIGNED", "ACCEPTED", "REJECTED", "COMPLETED", "FAILED"] }).notNull().default("ASSIGNED"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: text("deleted_at"),
}, (table) => [
  index("assignments_order_idx").on(table.orderId),
  index("assignments_delivery_boy_idx").on(table.deliveryBoyId),
  index("assignments_status_idx").on(table.status),
]);

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  order: one(orders, {
    fields: [assignments.orderId],
    references: [orders.id],
  }),
  deliveryBoy: one(deliveryBoys, {
    fields: [assignments.deliveryBoyId],
    references: [deliveryBoys.id],
  }),
}));

// ==========================================
// 10b. DELIVERY BATCHES TABLE
// ==========================================
export const deliveryBatches = sqliteTable("delivery_batches", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  driverId: text("driver_id").notNull().references(() => deliveryBoys.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["ASSIGNED", "DISPATCHED", "DELIVERED"] }).notNull().default("ASSIGNED"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  index("delivery_batches_driver_idx").on(table.driverId),
  index("delivery_batches_status_idx").on(table.status),
]);

export const deliveryBatchesRelations = relations(deliveryBatches, ({ one, many }) => ({
  driver: one(deliveryBoys, {
    fields: [deliveryBatches.driverId],
    references: [deliveryBoys.id],
  }),
  orders: many(orders),
}));

// ==========================================
// 11. SESSIONS TABLE
// ==========================================
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
  uniqueIndex("sessions_token_idx").on(table.token),
  index("sessions_user_idx").on(table.userId),
]);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
