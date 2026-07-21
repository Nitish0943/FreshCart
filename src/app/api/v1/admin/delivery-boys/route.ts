import { NextResponse } from "next/server";
import { DeliveryService } from "@/services/delivery.service";

const deliveryService = new DeliveryService();

// GET /api/v1/admin/delivery-boys - List delivery boys (Admin only)
export async function GET(request: Request) {
  const role = request.headers.get("x-user-role");

  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as any;

  try {
    const list = await deliveryService.getDeliveryBoys(status);
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/v1/admin/delivery-boys - Create delivery boy profile (Admin only)
export async function POST(request: Request) {
  const role = request.headers.get("x-user-role");

  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json(); // expected payload: { userId: string, vehicleNumber: string, status?: string }
    const result = await deliveryService.registerDeliveryBoy(body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
