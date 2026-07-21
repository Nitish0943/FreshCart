import { NextResponse } from "next/server";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// PATCH /api/v1/addresses/[id] - Edit an address
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { label, address, landmark, city, state, pincode, isDefault } = body;

    // Verify ownership
    const existing = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .limit(1);

    if (!existing[0] || existing[0].deletedAt) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    const result = await db.transaction(async (tx) => {
      if (isDefault) {
        // Clear defaults
        await tx
          .update(addresses)
          .set({ isDefault: 0 })
          .where(eq(addresses.userId, userId));
      }

      const [updated] = await tx
        .update(addresses)
        .set({
          label: label !== undefined ? label : undefined,
          address: address !== undefined ? address : undefined,
          landmark: landmark !== undefined ? landmark : undefined,
          city: city !== undefined ? city : undefined,
          state: state !== undefined ? state : undefined,
          pincode: pincode !== undefined ? pincode : undefined,
          isDefault: isDefault !== undefined ? (isDefault ? 1 : 0) : undefined,
          updatedAt: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(addresses.id, id))
        .returning();

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE /api/v1/addresses/[id] - Soft delete an address
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify ownership
    const existingRecord = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .limit(1);

    const existing = existingRecord[0];
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      // Soft delete
      await tx
        .update(addresses)
        .set({ deletedAt: sql`(CURRENT_TIMESTAMP)`, isDefault: 0 })
        .where(eq(addresses.id, id));

      // If it was the default address, set another remaining address as default
      if (existing.isDefault === 1) {
        const remaining = await tx
          .select()
          .from(addresses)
          .where(and(eq(addresses.userId, userId), sql`deleted_at IS NULL`))
          .limit(1);

        if (remaining[0]) {
          await tx
            .update(addresses)
            .set({ isDefault: 1 })
            .where(eq(addresses.id, remaining[0].id));
        }
      }
    });

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
