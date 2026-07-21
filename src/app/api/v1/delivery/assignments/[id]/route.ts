import { NextResponse } from "next/server";
import { DeliveryService } from "@/services/delivery.service";

const deliveryService = new DeliveryService();

// PATCH /api/v1/delivery/assignments/[id] - Accept/complete order assignment (Delivery Boy only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "DELIVERY_BOY") {
    return NextResponse.json({ success: false, error: "Forbidden. Delivery Boy role required." }, { status: 403 });
  }

  try {
    const { id: assignmentId } = await params;
    const body = await request.json(); // expected: { status: "ACCEPTED" | "REJECTED" | "COMPLETED" | "FAILED", notes?: string }
    const { status, notes } = body;

    const allowedStatuses = ["ACCEPTED", "REJECTED", "COMPLETED", "FAILED"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    const updated = await deliveryService.updateAssignment(userId, assignmentId, status, notes);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
