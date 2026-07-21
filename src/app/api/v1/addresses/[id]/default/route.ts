import { NextResponse } from "next/server";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/v1/addresses/[id]/default - Set default address
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify ownership
    const existing = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .limit(1);

    if (!existing[0] || existing[0].deletedAt) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      // Clear default flag for all user's addresses
      await tx
        .update(addresses)
        .set({ isDefault: 0 })
        .where(eq(addresses.userId, userId));

      // Mark selected address default
      await tx
        .update(addresses)
        .set({ isDefault: 1 })
        .where(eq(addresses.id, id));
    });

    return NextResponse.json({ success: true, message: "Default address updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
