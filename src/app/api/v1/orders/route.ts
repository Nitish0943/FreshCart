import { NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";

const orderService = new OrderService();

// GET /api/v1/orders - Retrieve order history for Customer, or all orders for Admin
export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  try {
    if (role === "ADMIN") {
      const list = await orderService.getAdminOrders(status);
      return NextResponse.json({ success: true, data: list });
    } else {
      const list = await orderService.getUserOrders(userId);
      return NextResponse.json({ success: true, data: list });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/v1/orders - Place an order (Customer only)
export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "CUSTOMER") {
    return NextResponse.json({ success: false, error: "Forbidden. Customer role required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const order = await orderService.placeOrder(userId, body);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
