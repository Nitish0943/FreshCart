import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authService.login(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    let message = error.message;
    try {
      message = JSON.parse(error.message);
    } catch {
      // Not a JSON message
    }
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
