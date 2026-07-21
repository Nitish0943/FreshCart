import { NextResponse } from "next/server";
import { CatalogService } from "@/services/catalog.service";

const catalogService = new CatalogService();

// PATCH /api/v1/categories/[id] - Admin Only
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = request.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const result = await catalogService.updateCategory(id, body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE /api/v1/categories/[id] - Admin Only
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = request.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const { id } = await params;
    await catalogService.deleteCategory(id);
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
