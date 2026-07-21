import { NextResponse } from "next/server";
import { DeliveryService } from "@/services/delivery.service";

const deliveryService = new DeliveryService();

// GET /api/v1/admin/delivery-batches - List all batches (Admin only)
export async function GET(request: Request) {
  const role = request.headers.get("x-user-role");

  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const list = await deliveryService.getBatches();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/v1/admin/delivery-batches - Create a batch (Admin only)
export async function POST(request: Request) {
  const role = request.headers.get("x-user-role");

  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { driverId, orderIds } = body; // expect { driverId: string, orderIds: string[] }

    if (!driverId || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, error: "driverId and orderIds are required" }, { status: 400 });
    }

    const batch = await deliveryService.createBatch(driverId, orderIds);
    return NextResponse.json({ success: true, data: batch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PATCH /api/v1/admin/delivery-batches - Link order to existing batch (Admin only)
export async function PATCH(request: Request) {
  const role = request.headers.get("x-user-role");

  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { batchId, orderId } = body;

    if (!batchId || !orderId) {
      return NextResponse.json({ success: false, error: "batchId and orderId are required" }, { status: 400 });
    }

    const result = await deliveryService.linkOrderToBatch(batchId, orderId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
