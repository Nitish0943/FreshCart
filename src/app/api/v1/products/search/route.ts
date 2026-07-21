import { NextResponse } from "next/server";
import { CatalogService } from "@/services/catalog.service";

const catalogService = new CatalogService();

// GET /api/v1/products/search?q={query} - Public
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  try {
    const list = await catalogService.getProducts({ search: q });
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
