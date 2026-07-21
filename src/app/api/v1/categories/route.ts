import { NextResponse } from "next/server";
import { CatalogService } from "@/services/catalog.service";

const catalogService = new CatalogService();

// GET /api/v1/categories - Public
export async function GET() {
  try {
    const list = await catalogService.getCategories();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/v1/categories - Admin Only
export async function POST(request: Request) {
  const role = request.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await catalogService.createCategory(body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
