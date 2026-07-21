import { DeliveryRepository } from "@/repositories/delivery.repository";
import { OrderRepository } from "@/repositories/order.repository";
import { UserRepository } from "@/repositories/user.repository";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { deliveryBatches, orders, assignments } from "@/db/schema";

const deliveryRepository = new DeliveryRepository();
const orderRepository = new OrderRepository();
const userRepository = new UserRepository();

export const deliveryBoySchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  vehicleNumber: z.string().min(1),
  status: z.enum(["ACTIVE", "OFFLINE", "BUSY"]).default("OFFLINE"),
  createNewUser: z.boolean().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  vehicleType: z.string().optional(), // for frontend forms Compatibility
});

export const assignmentSchema = z.object({
  orderId: z.string().uuid(),
  deliveryBoyId: z.string().uuid(),
});

export class DeliveryService {
  async registerDeliveryBoy(data: any) {
    const parsed = deliveryBoySchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }

    let userId = parsed.data.userId;

    if (parsed.data.createNewUser) {
      const { email, password, firstName, lastName, phone } = parsed.data;
      if (!email || !password) {
        throw new Error("Email and password are required to create a delivery user account");
      }

      // Check if email already exists
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        throw new Error("Email is already registered");
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await userRepository.create({
        id: crypto.randomUUID(),
        email,
        passwordHash,
        role: "DELIVERY_BOY",
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
      });
      userId = newUser.id;
    }

    if (!userId) {
      throw new Error("User ID is required to link profile");
    }

    // Check user role is DELIVERY_BOY
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "DELIVERY_BOY") {
      throw new Error("Target user role is not DELIVERY_BOY");
    }

    const exists = await deliveryRepository.findDeliveryBoyByUserId(userId);
    if (exists) throw new Error("Delivery boy profile already registered for this user");

    return deliveryRepository.createDeliveryBoy({
      id: crypto.randomUUID(),
      userId,
      vehicleNumber: parsed.data.vehicleNumber,
      status: parsed.data.status || "OFFLINE",
    });
  }

  async getDeliveryBoyProfile(userId: string) {
    const profile = await deliveryRepository.findDeliveryBoyByUserId(userId);
    if (!profile) throw new Error("Delivery boy profile not found");
    return profile;
  }

  async getDeliveryBoys(status?: "ACTIVE" | "OFFLINE" | "BUSY") {
    return deliveryRepository.findDeliveryBoys(status);
  }

  async updateRiderStatus(userId: string, status: "ACTIVE" | "OFFLINE" | "BUSY") {
    const profile = await deliveryRepository.findDeliveryBoyByUserId(userId);
    if (!profile) throw new Error("Delivery boy profile not found");

    return deliveryRepository.updateDeliveryBoyStatus(profile.id, status);
  }

  async assignOrder(data: any) {
    const parsed = assignmentSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }

    const { orderId, deliveryBoyId } = parsed.data;

    // Check order
    const order = await orderRepository.findOrderById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "READY") {
      throw new Error(`Order must be in READY state. Current state: ${order.status}`);
    }

    // Check rider
    const rider = await deliveryRepository.findDeliveryBoyById(deliveryBoyId);
    if (!rider) throw new Error("Delivery boy not found");
    if (rider.status !== "ACTIVE") {
      throw new Error(`Delivery boy is not available. Status: ${rider.status}`);
    }

    return deliveryRepository.createAssignment({
      id: crypto.randomUUID(),
      orderId,
      deliveryBoyId,
      status: "ASSIGNED",
    });
  }

  async getRiderDashboard(userId: string) {
    const rider = await deliveryRepository.findDeliveryBoyByUserId(userId);
    if (!rider) throw new Error("Delivery boy profile not found");

    // Fetch active batches for the rider
    const activeBatches = await deliveryRepository.findActiveBatchesForRider(rider.id);
    const enrichedBatches = [];

    for (const batch of activeBatches) {
      const ordersInBatch = await orderRepository.findOrdersByBatchId(batch.id);
      const ordersWithAssignments = [];
      for (const o of ordersInBatch) {
        const fullOrder = await orderRepository.findOrderById(o.id);
        const assignment = await deliveryRepository.findAssignmentByOrderAndRider(o.id, rider.id);
        ordersWithAssignments.push({
          ...(fullOrder || o),
          assignment,
        });
      }
      enrichedBatches.push({
        ...batch,
        orders: ordersWithAssignments,
      });
    }

    // Compute today's completed count from assignments
    const allAssignments = await deliveryRepository.findAssignmentsForRider(rider.id);
    let todayCompletedCount = 0;
    const todayStr = new Date().toDateString();
    for (const assignment of allAssignments) {
      if (assignment.status === "COMPLETED") {
        const updatedDate = new Date(assignment.updatedAt).toDateString();
        if (updatedDate === todayStr) {
          todayCompletedCount++;
        }
      }
    }

    return {
      profile: rider,
      activeBatches: enrichedBatches,
      todayCompletedCount,
    };
  }

  async updateAssignment(userId: string, assignmentId: string, status: "ACCEPTED" | "REJECTED" | "COMPLETED" | "FAILED", notes?: string) {
    const rider = await deliveryRepository.findDeliveryBoyByUserId(userId);
    if (!rider) throw new Error("Delivery boy profile not found");

    const assignment = await deliveryRepository.findAssignmentById(assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.deliveryBoyId !== rider.id) {
      throw new Error("You are not authorized to update this assignment");
    }

    const result = await deliveryRepository.updateAssignmentStatus(assignmentId, status, notes);

    // If individual order is finished, check if all orders in the same batch are finished
    const order = await orderRepository.findOrderById(assignment.orderId);
    if (order && order.batchId) {
      const batchOrders = await orderRepository.findOrdersByBatchId(order.batchId);
      const allFinished = batchOrders.every(
        (o: any) => o.status === "DELIVERED" || o.status === "CANCELLED"
      );

      if (allFinished) {
        // Complete the batch
        await deliveryRepository.updateBatchStatus(order.batchId, "DELIVERED");
      }
    }

    return result;
  }

  // --- BATCH SERVICE ACTIONS ---
  async getBatches() {
    return deliveryRepository.findAllBatches();
  }

  async createBatch(driverId: string, orderIds: string[]) {
    const driver = await deliveryRepository.findDeliveryBoyById(driverId);
    if (!driver) throw new Error("Driver not found");

    // Only block if OFFLINE
    if (driver.status === "OFFLINE") {
      throw new Error("Driver is offline and cannot receive assignments");
    }

    for (const orderId of orderIds) {
      const order = await orderRepository.findOrderById(orderId);
      if (!order) throw new Error(`Order ${orderId} not found`);
      if (order.status !== "READY") {
        throw new Error(`Order ${orderId} must be in READY state. Current: ${order.status}`);
      }
    }

    return db.transaction(async (tx) => {
      const batchId = crypto.randomUUID();

      // 1. Create delivery batch
      const [batch] = await tx
        .insert(deliveryBatches)
        .values({
          id: batchId,
          driverId,
          status: "ASSIGNED",
        })
        .returning();

      // 2. Link orders and create assignments
      for (const orderId of orderIds) {
        await tx
          .update(orders)
          .set({ batchId, status: "ASSIGNED", updatedAt: sql`(CURRENT_TIMESTAMP)` })
          .where(eq(orders.id, orderId));

        await tx.insert(assignments).values({
          id: crypto.randomUUID(),
          orderId,
          deliveryBoyId: driverId,
          status: "ASSIGNED",
        });
      }

      return batch;
    });
  }

  async startBatch(userId: string, batchId: string) {
    const rider = await deliveryRepository.findDeliveryBoyByUserId(userId);
    if (!rider) throw new Error("Delivery boy profile not found");

    const batch = await deliveryRepository.findBatchById(batchId);
    if (!batch) throw new Error("Batch not found");
    if (batch.driverId !== rider.id) throw new Error("Unauthorized");

    // Set batch OUT_FOR_DELIVERY (DISPATCHED)
    await deliveryRepository.updateBatchStatus(batchId, "DISPATCHED");

    // Set all orders to OUT_FOR_DELIVERY and assignments to ACCEPTED
    const batchOrders = await orderRepository.findOrdersByBatchId(batchId);
    return db.transaction(async (tx) => {
      for (const order of batchOrders) {
        await tx
          .update(orders)
          .set({ status: "OUT_FOR_DELIVERY", updatedAt: sql`(CURRENT_TIMESTAMP)` })
          .where(eq(orders.id, order.id));

        const assignment = await deliveryRepository.findAssignmentByOrderAndRider(order.id, rider.id);
        if (assignment) {
          await tx
            .update(assignments)
            .set({ status: "ACCEPTED", updatedAt: sql`(CURRENT_TIMESTAMP)` })
            .where(eq(assignments.id, assignment.id));
        }
      }
    });
  }

  async linkOrderToBatch(batchId: string, orderId: string) {
    const batch = await deliveryRepository.findBatchById(batchId);
    if (!batch) throw new Error("Batch not found");
    if (batch.status === "DELIVERED") {
      throw new Error("Cannot link to a completed batch");
    }

    const order = await orderRepository.findOrderById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "READY") {
      throw new Error(`Order must be in READY state. Current: ${order.status}`);
    }

    return db.transaction(async (tx) => {
      // 1. Update order
      await tx
        .update(orders)
        .set({
          batchId: batch.id,
          status: "ASSIGNED",
          updatedAt: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(orders.id, orderId));

      // 2. Create assignment
      await tx
        .insert(assignments)
        .values({
          id: crypto.randomUUID(),
          orderId,
          deliveryBoyId: batch.driverId,
          status: "ASSIGNED",
        });

      return { success: true };
    });
  }
}

