import { NextResponse } from "next/server";
import { DeliveryService } from "@/services/delivery.service";

const deliveryService = new DeliveryService();

// POST /api/v1/delivery/batches/[id]/start - Start/dispatch batch (Delivery Boy only)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "DELIVERY_BOY") {
    return NextResponse.json({ success: false, error: "Forbidden. Delivery Boy role required." }, { status: 403 });
  }

  try {
    const { id: batchId } = await params;
    await deliveryService.startBatch(userId, batchId);
    return NextResponse.json({ success: true, message: "Batch started successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
