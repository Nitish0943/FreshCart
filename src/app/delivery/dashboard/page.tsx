"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRiderDashboardQuery, useRiderAssignmentMutation, useStartBatchMutation } from "@/hooks/use-rider-queries";

export default function DeliveryDashboardPage() {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: dashboardData, isLoading: loading } = useRiderDashboardQuery();
  const riderAssignmentMutation = useRiderAssignmentMutation();
  const startBatchMutation = useStartBatchMutation();

  const activeBatches = dashboardData?.activeBatches || [];
  const todayCount = dashboardData?.todayCompletedCount || 0;

  const handleAction = (assignmentId: string, status: "DELIVERED" | "CANCELLED") => {
    if (!confirm(`Are you sure you want to mark this order as ${status.toLowerCase()}?`)) return;
    riderAssignmentMutation.mutate({ assignmentId, status });
  };

  const handleStartBatch = (batchId: string) => {
    if (!confirm("Are you ready to dispatch this batch of orders? This will change status of all orders to out for delivery.")) return;
    startBatchMutation.mutate(batchId);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Active Batches</h2>
            <p className="text-xs text-muted-foreground">Batches assigned to you for delivery</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-emerald-600 block">{activeBatches.length}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Active Jobs</span>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Completed Today</h2>
            <p className="text-xs text-muted-foreground">Successfully delivered packages today</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-emerald-600 block">{todayCount}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Orders Done</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-bold text-foreground">Assigned Batches</h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse bg-muted rounded-3xl" />
            ))}
          </div>
        ) : activeBatches.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-emerald-100 p-6 text-sm text-muted-foreground bg-card">
            No active batches assigned. You are all caught up!
          </div>
        ) : (
          <div className="space-y-8">
            {activeBatches.map((batch: any) => {
              const isAssigned = batch.status === "ASSIGNED";
              return (
                <div key={batch.id} className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs space-y-6">
                  {/* Batch Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-50 pb-4 gap-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                        Batch: {batch.id.substring(0, 8)}...
                      </span>
                      <span className="text-xs text-muted-foreground block pt-1.5">
                        Created: {new Date(batch.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                        {batch.status}
                      </span>
                      {isAssigned && (
                        <Button
                          onClick={() => handleStartBatch(batch.id)}
                          disabled={startBatchMutation.isPending}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs"
                        >
                          Start Delivery Trip
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Orders inside Batch */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground">Orders in Batch ({batch.orders.length})</h3>
                    
                    {isAssigned ? (
                      <div className="rounded-2xl bg-emerald-50/10 border border-emerald-100/50 p-4 text-center">
                        <p className="text-xs text-muted-foreground font-semibold">
                          Click "Start Delivery Trip" to unlock the order details and complete deliveries.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {batch.orders.map((order: any) => {
                          const isExpanded = expandedOrderId === order.id;
                          const isDelivered = order.status === "DELIVERED";
                          const isCancelled = order.status === "CANCELLED";
                          const assignment = order.assignment;

                          return (
                            <div
                              key={order.id}
                              className={`rounded-2xl border p-4 transition-all ${
                                isDelivered
                                  ? "border-emerald-100 bg-emerald-50/5"
                                  : isCancelled
                                  ? "border-destructive/10 bg-destructive/5"
                                  : "border-emerald-50/50 bg-background/50 hover:bg-emerald-50/5"
                              }`}
                            >
                              <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              >
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold font-mono text-muted-foreground">ID: {order.id.substring(0, 8)}...</span>
                                  <h4 className="font-bold text-foreground text-sm">{order.deliveryName}</h4>
                                  <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-md">{order.deliveryAddress}</p>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  <span className="text-sm font-extrabold text-foreground">₹{order.totalAmount.toFixed(2)}</span>
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                    isDelivered
                                      ? "bg-emerald-100 text-emerald-800"
                                      : isCancelled
                                      ? "bg-destructive/10 text-destructive"
                                      : "bg-amber-100 text-amber-800"
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="border-t border-emerald-50/50 pt-4 mt-4 space-y-4 text-xs">
                                  <div className="space-y-1">
                                    <h5 className="font-bold text-foreground">Delivery Address</h5>
                                    <p className="text-muted-foreground leading-relaxed">{order.deliveryAddress}</p>
                                  </div>

                                  <div className="flex gap-2">
                                    <a href={`tel:${order.deliveryPhone}`} className="flex-1">
                                      <Button className="w-full rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-semibold gap-1.5 flex items-center justify-center text-xs">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.108-7.108c-.145-.44.02-.927.396-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                        </svg>
                                        <span>Call Customer ({order.deliveryPhone})</span>
                                      </Button>
                                    </a>
                                  </div>

                                  <div className="space-y-2 border-t border-emerald-50/50 pt-3">
                                    <h5 className="font-bold text-foreground">Items Checklist</h5>
                                    <div className="divide-y divide-emerald-50/50 text-[11px]">
                                      {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between py-1.5">
                                          <span className="text-muted-foreground">
                                            ID: {item.productId.substring(0, 8)}... <span className="font-bold text-foreground">x{item.quantity}</span>
                                          </span>
                                          <span className="font-semibold text-foreground">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Complete Toggles */}
                                  {!isDelivered && !isCancelled && assignment && (
                                    <div className="pt-3 border-t border-emerald-50/50 flex gap-3">
                                      <Button
                                        onClick={() => handleAction(assignment.id, "CANCELLED")}
                                        variant="outline"
                                        className="flex-1 rounded-xl border-destructive/20 hover:bg-destructive/10 text-destructive font-semibold py-4"
                                      >
                                        Cancel Order
                                      </Button>
                                      <Button
                                        onClick={() => handleAction(assignment.id, "DELIVERED")}
                                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4"
                                      >
                                        Confirm Delivered
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
