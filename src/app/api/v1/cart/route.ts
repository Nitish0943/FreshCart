import { NextResponse } from "next/server";
import { CartService } from "@/services/cart.service";

const cartService = new CartService();

// GET /api/v1/cart - Get or create cart for user or guest session
export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  const { searchParams } = new URL(request.url);
  const sessionToken = searchParams.get("sessionToken") || undefined;

  try {
    const cart = await cartService.getOrCreateCart(userId, sessionToken);
    return NextResponse.json({ success: true, data: cart });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// POST /api/v1/cart - Add item to cart
export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  try {
    const body = await request.json();
    const result = await cartService.addItem(userId, body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PATCH /api/v1/cart - Update item quantity or delete
export async function PATCH(request: Request) {
  const userId = request.headers.get("x-user-id");
  const { searchParams } = new URL(request.url);
  const sessionToken = searchParams.get("sessionToken") || undefined;

  try {
    const body = await request.json(); // expected payload: { cartItemId: string, quantity: number }
    const { cartItemId, quantity } = body;

    const result = await cartService.updateItemQty(userId, cartItemId, quantity, sessionToken);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
