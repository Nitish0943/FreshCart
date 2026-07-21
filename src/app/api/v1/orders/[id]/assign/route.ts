import { NextResponse } from "next/server";
import { DeliveryService } from "@/services/delivery.service";

const deliveryService = new DeliveryService();

// POST /api/v1/orders/[id]/assign - Assign order to delivery boy (Admin only)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = request.headers.get("x-user-role");

  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const { id: orderId } = await params;
    const body = await request.json(); // expected payload: { deliveryBoyId: string }
    const { deliveryBoyId } = body;

    const assignment = await deliveryService.assignOrder({
      orderId,
      deliveryBoyId,
    });

    return NextResponse.json({ success: true, data: assignment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
