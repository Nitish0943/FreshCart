import { NextResponse } from "next/server";
import { DeliveryService } from "@/services/delivery.service";

const deliveryService = new DeliveryService();

// GET /api/v1/delivery/dashboard - Retrieve active assignments (Delivery Boy only)
export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "DELIVERY_BOY") {
    return NextResponse.json({ success: false, error: "Forbidden. Delivery Boy role required." }, { status: 403 });
  }

  try {
    const dashboardData = await deliveryService.getRiderDashboard(userId);
    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
