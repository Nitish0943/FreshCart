import { db } from "@/db";
import { orders, orderItems, users, addresses, products } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export class OrderRepository {
  async createOrder(orderData: any, items: { productId: string; quantity: number; unitPrice: number }[]) {
    return db.transaction(async (tx) => {
      // 1. Insert order
      const [newOrder] = await tx.insert(orders).values(orderData).returning();

      // 2. Insert items
      const itemsToInsert = items.map((item) => ({
        id: crypto.randomUUID(),
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      await tx.insert(orderItems).values(itemsToInsert);

      return newOrder;
    });
  }

  async findOrders(filters: { userId?: string; status?: string } = {}) {
    let whereClause = sql`orders.deleted_at IS NULL`;

    if (filters.userId && filters.status) {
      whereClause = and(eq(orders.userId, filters.userId), eq(orders.status, filters.status as any), sql`orders.deleted_at IS NULL`) as any;
    } else if (filters.userId) {
      whereClause = and(eq(orders.userId, filters.userId), sql`orders.deleted_at IS NULL`) as any;
    } else if (filters.status) {
      whereClause = and(eq(orders.status, filters.status as any), sql`orders.deleted_at IS NULL`) as any;
    }

    const results = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        addressId: orders.addressId,
        totalAmount: orders.totalAmount,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        batchId: orders.batchId,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        address: addresses.address,
        landmark: addresses.landmark,
        city: addresses.city,
        state: addresses.state,
        pincode: addresses.pincode,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(addresses, eq(orders.addressId, addresses.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt));

    return results.map((o) => ({
      ...o,
      deliveryName: `${o.firstName || ""} ${o.lastName || ""}`.trim() || "Customer",
      deliveryPhone: o.phone || "—",
      deliveryAddress: `${o.address}${o.landmark ? `, ${o.landmark}` : ""}, ${o.city}, ${o.state} - ${o.pincode}`,
    }));
  }

  async findOrderById(id: string) {
    const orderResults = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        addressId: orders.addressId,
        totalAmount: orders.totalAmount,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        batchId: orders.batchId,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        address: addresses.address,
        landmark: addresses.landmark,
        city: addresses.city,
        state: addresses.state,
        pincode: addresses.pincode,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(addresses, eq(orders.addressId, addresses.id))
      .where(and(eq(orders.id, id), sql`orders.deleted_at IS NULL`))
      .limit(1);

    const orderResult = orderResults[0];
    if (!orderResult) return null;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        productName: products.name,
        productImage: products.imageUrl,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...orderResult,
      deliveryName: `${orderResult.firstName || ""} ${orderResult.lastName || ""}`.trim() || "Customer",
      deliveryPhone: orderResult.phone || "—",
      deliveryAddress: `${orderResult.address}${orderResult.landmark ? `, ${orderResult.landmark}` : ""}, ${orderResult.city}, ${orderResult.state} - ${orderResult.pincode}`,
      items,
    };
  }

  async findPrefillInfo(phone: string) {
    const results = await db
      .select({
        deliveryName: users.firstName, // mapped to user details
        deliveryPhone: users.phone,
        deliveryAddress: addresses.address,
        addressId: orders.addressId,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(addresses, eq(orders.addressId, addresses.id))
      .where(and(eq(users.phone, phone), eq(orders.status, "DELIVERED")))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    return results[0] || null;
  }

  async updateOrderStatus(id: string, status: any) {
    const results = await db
      .update(orders)
      .set({ status, updatedAt: sql`(CURRENT_TIMESTAMP)` })
      .where(eq(orders.id, id))
      .returning();
    return results[0];
  }

  // --- BATCH HELPERS ---
  async findOrdersByBatchId(batchId: string) {
    return db
      .select()
      .from(orders)
      .where(and(eq(orders.batchId, batchId), sql`deleted_at IS NULL`));
  }
}
