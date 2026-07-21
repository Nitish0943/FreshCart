import { NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";

const orderService = new OrderService();

// PATCH /api/v1/orders/[id]/status - Update order status (Admin / Delivery Boy)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "ADMIN" && role !== "DELIVERY_BOY") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin or Delivery role required." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json(); // expected payload: { status: OrderStatus }
    const { status } = body;

    // Validate status values
    const allowedStatuses = ["RECEIVED", "PACKING", "READY", "ASSIGNED", "DISPATCHED", "DELIVERED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    const updated = await orderService.updateStatus(id, status);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
