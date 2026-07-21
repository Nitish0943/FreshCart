import { db } from "@/db";
import { carts, cartItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export class CartRepository {
  async findCartByUserId(userId: string) {
    const results = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    return results[0] || null;
  }

  async findCartBySessionToken(sessionToken: string) {
    const results = await db.select().from(carts).where(eq(carts.sessionToken, sessionToken)).limit(1);
    return results[0] || null;
  }

  async createCart(userId?: string | null, sessionToken?: string | null) {
    const values: any = {
      id: crypto.randomUUID(),
      userId: userId || null,
    };
    // Only set sessionToken if it's a real value (avoid UNIQUE constraint issues with null)
    if (sessionToken) {
      values.sessionToken = sessionToken;
    }
    const results = await db
      .insert(carts)
      .values(values)
      .returning();
    return results[0];
  }

  async findCartItems(cartId: string) {
    const results = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        productName: products.name,
        productPrice: products.price,
        productUnit: products.unit,
        productImageUrl: products.imageUrl,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));

    return results.map((row) => ({
      id: row.id,
      cartId: row.cartId,
      productId: row.productId,
      quantity: row.quantity,
      product: {
        name: row.productName,
        price: row.productPrice,
        unit: row.productUnit,
        imageUrl: row.productImageUrl,
      },
    }));
  }

  async findCartItem(cartId: string, productId: string) {
    const results = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
      .limit(1);
    return results[0] || null;
  }

  async addCartItem(cartId: string, productId: string, quantity: number) {
    const results = await db
      .insert(cartItems)
      .values({
        id: crypto.randomUUID(),
        cartId,
        productId,
        quantity,
      })
      .returning();
    return results[0];
  }

  async updateCartItem(id: string, quantity: number) {
    const results = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return results[0];
  }

  async deleteCartItem(id: string) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(cartId: string) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }
}
