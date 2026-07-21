import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { COOKIE_KEYS } from "@/constants";
import { cookies } from "next/headers";

const authService = new AuthService();

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_KEYS.AUTH_TOKEN)?.value;
    
    await authService.logout(token);
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
