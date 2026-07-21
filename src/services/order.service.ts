import { OrderRepository } from "@/repositories/order.repository";
import { CartRepository } from "@/repositories/cart.repository";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { products, orders, orderItems, cartItems, addresses } from "@/db/schema";
import { z } from "zod";

const orderRepository = new OrderRepository();
const cartRepository = new CartRepository();

export const placeOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(["COD", "CARD", "UPI"]).default("COD"),
  sessionToken: z.string().optional(),
});

export class OrderService {
  async getPrefillInfo(phone: string) {
    if (!phone) throw new Error("Phone number is required");
    return orderRepository.findPrefillInfo(phone);
  }

  async placeOrder(userId: string, data: any) {
    const parsed = placeOrderSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }

    const { addressId, paymentMethod } = parsed.data;

    // Resolve address
    const addressRecord = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, addressId))
      .limit(1);

    const selectedAddress = addressRecord[0];
    if (!selectedAddress || selectedAddress.userId !== userId || selectedAddress.deletedAt) {
      throw new Error("Invalid or deleted address selected");
    }

    // Get active cart
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) throw new Error("No cart found for this user");

    const activeCartItems = await cartRepository.findCartItems(cart.id);
    if (activeCartItems.length === 0) throw new Error("Your cart is empty");

    // Perform database transaction to ensure safety
    return db.transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsToCreate = [];

      for (const item of activeCartItems) {
        // 1. Lock and retrieve product details for transaction safety
        const productResults = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        const product = productResults[0];
        if (!product || product.deletedAt) {
          throw new Error(`Product not found or has been deleted.`);
        }

        // 2. Check stock
        if (product.stockQty < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQty}`);
        }

        // 3. Decrement stock
        await tx
          .update(products)
          .set({
            stockQty: sql`${products.stockQty} - ${item.quantity}`,
            updatedAt: sql`(CURRENT_TIMESTAMP)`,
          })
          .where(eq(products.id, item.productId));

        // 4. Calculate total (no / 100 as we use decimal ₹ directly)
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItemsToCreate.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }

      // 5. Create Order
      const newOrder = await tx.insert(orders).values({
        id: crypto.randomUUID(),
        userId,
        addressId,
        totalAmount,
        status: "RECEIVED",
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
        paymentMethod,
      }).returning();

      const createdOrder = newOrder[0];

      // 6. Create Order Items
      const itemsToInsert = orderItemsToCreate.map((item) => ({
        id: crypto.randomUUID(),
        orderId: createdOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      await tx.insert(orderItems).values(itemsToInsert);

      // 7. Clear Cart
      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

      return createdOrder;
    });
  }

  async getUserOrders(userId: string) {
    return orderRepository.findOrders({ userId });
  }

  async getOrderDetails(orderId: string) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) throw new Error("Order not found");
    return order;
  }

  async getAdminOrders(status?: string) {
    return orderRepository.findOrders({ status });
  }

  async updateStatus(orderId: string, status: any) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    // Standard state machine checks (can add validation for state transitions here if desired)
    return orderRepository.updateOrderStatus(orderId, status);
  }
}
