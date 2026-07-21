import { NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";

const orderService = new OrderService();

// GET /api/v1/orders/[id] - Retrieve single order details
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const order = await orderService.getOrderDetails(id);

    // Authorization checks
    if (role === "CUSTOMER" && order.userId !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden. Not your order." }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }
}
