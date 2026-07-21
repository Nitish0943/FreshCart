import { NextResponse } from "next/server";
import { CatalogService } from "@/services/catalog.service";

const catalogService = new CatalogService();

// GET /api/v1/products - Public (optional categoryId filtering)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const list = await catalogService.getProducts({ categoryId, search });
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/v1/products - Admin Only
export async function POST(request: Request) {
  const role = request.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await catalogService.createProduct(body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
