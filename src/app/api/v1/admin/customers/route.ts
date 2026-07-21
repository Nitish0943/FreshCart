import { NextResponse } from "next/server";
import { UserRepository } from "@/repositories/user.repository";
import { db } from "@/db";
import { addresses, orders } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

const userRepository = new UserRepository();

// GET /api/v1/admin/customers - List customer accounts with rich metrics (Admin only)
export async function GET(request: Request) {
  const role = request.headers.get("x-user-role");

  if (role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const list = await userRepository.getAllCustomers();
    const enrichedList = [];

    for (const user of list) {
      // Find default address
      const defaultAddr = await db
        .select()
        .from(addresses)
        .where(and(eq(addresses.userId, user.id), eq(addresses.isDefault, 1), sql`deleted_at IS NULL`))
        .limit(1);

      // Find all active addresses
      const allAddrs = await db
        .select()
        .from(addresses)
        .where(and(eq(addresses.userId, user.id), sql`deleted_at IS NULL`));

      // Find user orders
      const userOrders = await db
        .select()
        .from(orders)
        .where(and(eq(orders.userId, user.id), sql`orders.deleted_at IS NULL`))
        .orderBy(desc(orders.createdAt));

      const totalOrders = userOrders.length;
      const lastOrder = userOrders[0] || null;
      
      // Calculate spend on delivered orders
      const totalSpend = userOrders
        .filter((o) => o.status === "DELIVERED")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      enrichedList.push({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        defaultAddress: defaultAddr[0] 
          ? `${defaultAddr[0].address}${defaultAddr[0].landmark ? `, ${defaultAddr[0].landmark}` : ""}, ${defaultAddr[0].city}, ${defaultAddr[0].state}`
          : "No address set",
        pincode: defaultAddr[0]?.pincode || "—",
        addresses: allAddrs,
        totalOrders,
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
        totalSpend,
        orders: userOrders,
      });
    }

    return NextResponse.json({ success: true, data: enrichedList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
