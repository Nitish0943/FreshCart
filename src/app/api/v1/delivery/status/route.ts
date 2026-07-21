import { NextResponse } from "next/server";
import { DeliveryService } from "@/services/delivery.service";

const deliveryService = new DeliveryService();

// PATCH /api/v1/delivery/status - Toggle active status (Delivery Boy only)
export async function PATCH(request: Request) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "DELIVERY_BOY") {
    return NextResponse.json({ success: false, error: "Forbidden. Delivery Boy role required." }, { status: 403 });
  }

  try {
    const body = await request.json(); // expected payload: { status: "ACTIVE" | "OFFLINE" | "BUSY" }
    const { status } = body;

    if (status !== "ACTIVE" && status !== "OFFLINE" && status !== "BUSY") {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    const updated = await deliveryService.updateRiderStatus(userId, status);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
