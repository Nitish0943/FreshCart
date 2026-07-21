import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");
  const role = request.headers.get("x-user-role");
  const firstName = request.headers.get("x-user-first-name");
  const lastName = request.headers.get("x-user-last-name");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: userId,
      email,
      role,
      firstName: firstName || null,
      lastName: lastName || null,
    },
  });
}
