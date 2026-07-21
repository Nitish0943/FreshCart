import { NextResponse } from "next/server";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET /api/v1/addresses - Fetch all addresses for authenticated user
export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.userId, userId), sql`deleted_at IS NULL`));
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/v1/addresses - Create a new address
export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { label, address, landmark, city, state, pincode, isDefault } = body;

    if (!label || !address || !city || !state || !pincode) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const addressId = crypto.randomUUID();

    const result = await db.transaction(async (tx) => {
      // If setting as default, clear any other default address first
      if (isDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: 0 })
          .where(eq(addresses.userId, userId));
      }

      // Check if this is the first address, if so make it default
      const existing = await tx
        .select()
        .from(addresses)
        .where(and(eq(addresses.userId, userId), sql`deleted_at IS NULL`));

      const finalIsDefault = existing.length === 0 ? 1 : (isDefault ? 1 : 0);

      const [newAddress] = await tx
        .insert(addresses)
        .values({
          id: addressId,
          userId,
          label,
          address,
          landmark: landmark || null,
          city,
          state,
          pincode,
          isDefault: finalIsDefault,
        })
        .returning();

      return newAddress;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
