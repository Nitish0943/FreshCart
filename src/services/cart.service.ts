import { CartRepository } from "@/repositories/cart.repository";
import { CatalogRepository } from "@/repositories/catalog.repository";
import { z } from "zod";

const cartRepository = new CartRepository();
const catalogRepository = new CatalogRepository();

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  sessionToken: z.string().optional(), // for guest users
});

export class CartService {
  async getOrCreateCart(userId?: string | null, sessionToken?: string | null) {
    if (!userId && !sessionToken) {
      throw new Error("Either userId or sessionToken is required to identify a cart");
    }

    let cart = null;
    if (userId) {
      cart = await cartRepository.findCartByUserId(userId);
    } else if (sessionToken) {
      cart = await cartRepository.findCartBySessionToken(sessionToken);
    }

    if (!cart) {
      // For authenticated users, don't store sessionToken (avoids UNIQUE constraint conflicts)
      if (userId) {
        cart = await cartRepository.createCart(userId, null);
      } else {
        cart = await cartRepository.createCart(null, sessionToken);
      }
    }

    const items = await cartRepository.findCartItems(cart.id);
    return {
      ...cart,
      items,
    };
  }

  async addItem(userId: string | null, data: any) {
    const parsed = cartItemSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }

    const { productId, quantity, sessionToken } = parsed.data;

    // Check product and stock
    const product = await catalogRepository.findProductById(productId);
    if (!product) throw new Error("Product not found");
    if (product.stockQty < quantity) {
      throw new Error(`Insufficient stock. Only ${product.stockQty} items left.`);
    }

    const cart = await this.getOrCreateCart(userId, sessionToken);

    // Check if item already in cart
    const existingItem = await cartRepository.findCartItem(cart.id, productId);
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.stockQty < newQty) {
        throw new Error(`Cannot add more. Insufficient stock (max: ${product.stockQty}).`);
      }
      return cartRepository.updateCartItem(existingItem.id, newQty);
    }

    return cartRepository.addCartItem(cart.id, productId, quantity);
  }

  async updateItemQty(userId: string | null, cartItemId: string, quantity: number, sessionToken?: string) {
    if (quantity <= 0) {
      return cartRepository.deleteCartItem(cartItemId);
    }

    // Check stock
    const cart = await this.getOrCreateCart(userId, sessionToken);
    const items = await cartRepository.findCartItems(cart.id);
    const targetItem = items.find((item) => item.id === cartItemId);
    if (!targetItem) throw new Error("Cart item not found in your cart");

    const product = await catalogRepository.findProductById(targetItem.productId);
    if (!product) throw new Error("Product not found");
    if (product.stockQty < quantity) {
      throw new Error(`Insufficient stock. Only ${product.stockQty} items left.`);
    }

    return cartRepository.updateCartItem(cartItemId, quantity);
  }

  async removeItem(userId: string | null, cartItemId: string, sessionToken?: string) {
    const cart = await this.getOrCreateCart(userId, sessionToken);
    const items = await cartRepository.findCartItems(cart.id);
    const targetItem = items.find((item) => item.id === cartItemId);
    if (!targetItem) throw new Error("Cart item not found in your cart");

    await cartRepository.deleteCartItem(cartItemId);
  }
}
