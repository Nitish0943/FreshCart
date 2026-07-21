import { NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";

const orderService = new OrderService();

// GET /api/v1/checkout/prefill?phone={phone} - Get previous delivery info for phone
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 });
  }

  try {
    const prefill = await orderService.getPrefillInfo(phone);
    return NextResponse.json({ success: true, data: prefill });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
