import { db } from "@/db";
import { deliveryBoys, assignments, orders, users, deliveryBatches } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export class DeliveryRepository {
  async findDeliveryBoyByUserId(userId: string) {
    const results = await db
      .select()
      .from(deliveryBoys)
      .where(and(eq(deliveryBoys.userId, userId), sql`deleted_at IS NULL`))
      .limit(1);
    return results[0] || null;
  }

  async findDeliveryBoyById(id: string) {
    const results = await db
      .select()
      .from(deliveryBoys)
      .where(and(eq(deliveryBoys.id, id), sql`deleted_at IS NULL`))
      .limit(1);
    return results[0] || null;
  }

  async findDeliveryBoys(status?: "ACTIVE" | "OFFLINE" | "BUSY") {
    if (status) {
      return db
        .select({
          id: deliveryBoys.id,
          userId: deliveryBoys.userId,
          vehicleNumber: deliveryBoys.vehicleNumber,
          status: deliveryBoys.status,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          email: users.email,
        })
        .from(deliveryBoys)
        .innerJoin(users, eq(deliveryBoys.userId, users.id))
        .where(and(eq(deliveryBoys.status, status), sql`delivery_boys.deleted_at IS NULL`));
    }
    return db
      .select({
        id: deliveryBoys.id,
        userId: deliveryBoys.userId,
        vehicleNumber: deliveryBoys.vehicleNumber,
        status: deliveryBoys.status,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        email: users.email,
      })
      .from(deliveryBoys)
      .innerJoin(users, eq(deliveryBoys.userId, users.id))
      .where(sql`delivery_boys.deleted_at IS NULL`);
  }

  async createDeliveryBoy(data: { id: string; userId: string; vehicleNumber: string; status: "ACTIVE" | "OFFLINE" | "BUSY" }) {
    const results = await db.insert(deliveryBoys).values(data).returning();
    return results[0];
  }

  async updateDeliveryBoyStatus(id: string, status: "ACTIVE" | "OFFLINE" | "BUSY") {
    const results = await db
      .update(deliveryBoys)
      .set({ status, updatedAt: sql`(CURRENT_TIMESTAMP)` })
      .where(eq(deliveryBoys.id, id))
      .returning();
    return results[0];
  }

  async createAssignment(data: { id: string; orderId: string; deliveryBoyId: string; status: "ASSIGNED" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "FAILED" }) {
    return db.transaction(async (tx) => {
      // 1. Create Assignment log
      const [newAssignment] = await tx.insert(assignments).values(data).returning();
      
      // 2. Set order status to ASSIGNED and assign rider
      await tx
        .update(orders)
        .set({ status: "ASSIGNED", updatedAt: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(orders.id, data.orderId));

      return newAssignment;
    });
  }

  async findAssignmentById(id: string) {
    const results = await db.select().from(assignments).where(eq(assignments.id, id)).limit(1);
    return results[0] || null;
  }

  async findAssignmentsForRider(deliveryBoyId: string, status?: any) {
    let query = db.select().from(assignments).where(eq(assignments.deliveryBoyId, deliveryBoyId));
    if (status) {
      query = db
        .select()
        .from(assignments)
        .where(and(eq(assignments.deliveryBoyId, deliveryBoyId), eq(assignments.status, status))) as any;
    }
    return query;
  }

  async updateAssignmentStatus(id: string, assignmentStatus: "ASSIGNED" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "FAILED", notes?: string) {
    return db.transaction(async (tx) => {
      const [updatedAssignment] = await tx
        .update(assignments)
        .set({ status: assignmentStatus, notes: notes || null, updatedAt: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(assignments.id, id))
        .returning();

      // Reflect changes to Order and Rider based on assignment status
      if (assignmentStatus === "ACCEPTED") {
        await tx
          .update(orders)
          .set({ status: "OUT_FOR_DELIVERY", updatedAt: sql`(CURRENT_TIMESTAMP)` }) // OUT_FOR_DELIVERY is the new name for DISPATCHED
          .where(eq(orders.id, updatedAssignment.orderId));
      } else if (assignmentStatus === "COMPLETED") {
        await tx
          .update(orders)
          .set({ status: "DELIVERED", updatedAt: sql`(CURRENT_TIMESTAMP)` })
          .where(eq(orders.id, updatedAssignment.orderId));

        // Note: For batch delivery, rider only becomes active when all batch orders are completed. We check this in the service layer.
      } else if (assignmentStatus === "REJECTED" || assignmentStatus === "FAILED") {
        await tx
          .update(orders)
          .set({ status: assignmentStatus === "REJECTED" ? "READY" : "CANCELLED", updatedAt: sql`(CURRENT_TIMESTAMP)` })
          .where(eq(orders.id, updatedAssignment.orderId));
      }

      return updatedAssignment;
    });
  }

  // --- BATCH DELIVERY METHODS ---
  async createBatch(data: { id: string; driverId: string; status: "ASSIGNED" | "DISPATCHED" | "DELIVERED" }) {
    const results = await db.insert(deliveryBatches).values(data).returning();
    return results[0];
  }

  async findActiveBatchesForRider(driverId: string) {
    return db
      .select()
      .from(deliveryBatches)
      .where(and(eq(deliveryBatches.driverId, driverId), sql`status != 'DELIVERED'`));
  }

  async findAssignmentByOrderAndRider(orderId: string, deliveryBoyId: string) {
    const results = await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.orderId, orderId), eq(assignments.deliveryBoyId, deliveryBoyId)))
      .limit(1);
    return results[0] || null;
  }

  async updateBatchStatus(batchId: string, status: "ASSIGNED" | "DISPATCHED" | "DELIVERED") {
    const results = await db
      .update(deliveryBatches)
      .set({ status, updatedAt: sql`(CURRENT_TIMESTAMP)` })
      .where(eq(deliveryBatches.id, batchId))
      .returning();
    return results[0];
  }

  async findBatchById(id: string) {
    const results = await db.select().from(deliveryBatches).where(eq(deliveryBatches.id, id)).limit(1);
    return results[0] || null;
  }

  async findAllBatches() {
    return db.select().from(deliveryBatches);
  }
}
