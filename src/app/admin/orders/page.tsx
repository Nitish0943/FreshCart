"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOrdersQuery, useUpdateOrderStatusMutation, useAssignRiderMutation } from "@/hooks/use-order-queries";
import { useRidersQuery } from "@/hooks/use-rider-queries";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export default function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [batchRiderId, setBatchRiderId] = useState("");

  // New states for batching
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [assignmentType, setAssignmentType] = useState<"LINK" | "CREATE">("LINK");

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: loading } = useOrdersQuery(filterStatus);
  const { data: riders = [] } = useRidersQuery("ACTIVE");
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const assignRiderMutation = useAssignRiderMutation();

  // Query batches for batch linking
  const { data: batchesRes, refetch: refetchBatches } = useQuery({
    queryKey: ["delivery-batches"],
    queryFn: () =>
      fetch("/api/v1/admin/delivery-batches", {
        headers: { "x-user-role": "ADMIN" },
      }).then((res) => res.json()),
  });
  const batches = batchesRes?.success ? batchesRes.data : [];
  const activeBatches = batches.filter((b: any) => b.status === "ASSIGNED");

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
          }
        },
      }
    );
  };

  const handleLinkToBatch = async () => {
    const orderId = selectedOrder?.id;
    if (!orderId || !selectedBatchId) return;

    try {
      const res = await fetch("/api/v1/admin/delivery-batches", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN",
        },
        body: JSON.stringify({ batchId: selectedBatchId, orderId }),
      });
      const result = await res.json();
      if (result.success) {
        setSelectedBatchId("");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["delivery-batches"] });
        alert("Order linked to batch successfully!");
        loadOrderDetails(orderId);
      } else {
        alert("Failed to link order: " + result.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleAssignRiderAndCreateBatch = async () => {
    const orderId = selectedOrder?.id;
    if (!orderId || !selectedRiderId) return;

    try {
      const res = await fetch("/api/v1/admin/delivery-batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN",
        },
        body: JSON.stringify({
          driverId: selectedRiderId,
          orderIds: [orderId],
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSelectedRiderId("");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["riders"] });
        queryClient.invalidateQueries({ queryKey: ["delivery-batches"] });
        alert("Batch created and driver assigned successfully!");
        loadOrderDetails(orderId);
      } else {
        alert("Failed to assign driver: " + result.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateBatch = async () => {
    if (!batchRiderId || selectedOrderIds.length === 0) return;
    try {
      const res = await fetch("/api/v1/admin/delivery-batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN",
        },
        body: JSON.stringify({
          driverId: batchRiderId,
          orderIds: selectedOrderIds,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSelectedOrderIds([]);
        setBatchRiderId("");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["riders"] });
        alert("Batch created and assigned successfully!");
      } else {
        alert("Failed to create batch: " + result.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statuses = ["RECEIVED", "PACKING", "READY", "ASSIGNED", "DISPATCHED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Orders</h1>
          <p className="text-muted-foreground">Manage active orders, prepare packaging, and assign delivery riders.</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-muted-foreground">Filter status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-emerald-100 bg-card px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-emerald-100 p-8 text-muted-foreground">
          No orders logged under this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Orders list */}
          <div className="lg:col-span-2 space-y-4">
            {orders.map((o: any) => (
              <div
                key={o.id}
                onClick={() => loadOrderDetails(o.id)}
                className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-6 bg-card shadow-xs hover:shadow-md cursor-pointer transition-all ${
                  selectedOrder?.id === o.id ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-emerald-50"
                }`}
              >
                <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    {o.status === "READY" && (
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(o.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrderIds([...selectedOrderIds, o.id]);
                          } else {
                            setSelectedOrderIds(selectedOrderIds.filter((id) => id !== o.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    )}
                    <span className="font-mono font-bold text-foreground text-sm">{o.id.substring(0, 8)}...</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground">{o.deliveryName} ({o.deliveryPhone})</h3>
                    <p className="text-xs text-muted-foreground max-w-sm truncate break-all">{o.deliveryAddress}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <span className="font-extrabold text-foreground block">₹{o.totalAmount.toFixed(2)}</span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        o.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700"
                          : o.status === "CANCELLED"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details & Operations panel */}
          <div className="space-y-6">
            {selectedOrderIds.length > 0 ? (
              <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-sm space-y-6">
                <div className="border-b border-emerald-50 pb-4 space-y-1">
                  <h2 className="text-xl font-bold text-foreground">Batch Assignment</h2>
                  <p className="text-xs text-muted-foreground font-semibold">
                    Assigning <strong className="text-emerald-600">{selectedOrderIds.length}</strong> selected orders to a driver as a single delivery batch.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">Select Available Driver</label>
                  {riders.length === 0 ? (
                    <p className="text-xs text-destructive font-semibold">
                      No active riders available online right now.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={batchRiderId}
                        onChange={(e) => setBatchRiderId(e.target.value)}
                        className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Select Rider...</option>
                        {riders.map((r: any) => (
                          <option key={r.id} value={r.id}>
                            {r.firstName || "Rider"} {r.lastName || ""} ({r.vehicleNumber})
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={handleCreateBatch}
                        disabled={!batchRiderId}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      >
                        Assign Batch
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setSelectedOrderIds([])}
                  className="w-full rounded-xl border-emerald-100 text-xs hover:bg-emerald-50 text-muted-foreground hover:text-foreground"
                >
                  Clear Selection Checklist
                </Button>
              </div>
            ) : selectedOrder ? (
              <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-sm space-y-6">
                <div className="border-b border-emerald-50 pb-4 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground font-mono">{selectedOrder.id}</span>
                  <h2 className="text-xl font-bold text-foreground">Order Operations</h2>
                </div>

                {/* Status selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">Update Order Status</label>
                  {["RECEIVED", "PACKING", "READY"].includes(selectedOrder.status) ? (
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {["RECEIVED", "PACKING", "READY"].map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <select
                        disabled
                        value={selectedOrder.status}
                        className="w-full rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                      >
                        <option value={selectedOrder.status}>{selectedOrder.status}</option>
                      </select>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        ℹ️ Logistics managed by assigned driver.
                      </span>
                    </div>
                  )}
                </div>

                {/* Batch Assignment Options — Link to Batch or Create New Batch */}
                {selectedOrder.status === "READY" && (
                  <div className="space-y-3 border-t border-emerald-50 pt-4">
                    <label className="text-xs font-bold text-foreground block">Delivery Assignment</label>

                    {/* Toggle between Link and Create */}
                    <div className="flex rounded-xl border border-emerald-100 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setAssignmentType("LINK")}
                        className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                          assignmentType === "LINK"
                            ? "bg-emerald-600 text-white"
                            : "bg-background text-muted-foreground hover:bg-emerald-50"
                        }`}
                      >
                        Link to Batch
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignmentType("CREATE")}
                        className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                          assignmentType === "CREATE"
                            ? "bg-emerald-600 text-white"
                            : "bg-background text-muted-foreground hover:bg-emerald-50"
                        }`}
                      >
                        Create New Batch
                      </button>
                    </div>

                    {assignmentType === "LINK" ? (
                      <div className="space-y-2">
                        {activeBatches.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No active batches available. Create a new batch instead.</p>
                        ) : (
                          <>
                            <select
                              value={selectedBatchId}
                              onChange={(e) => setSelectedBatchId(e.target.value)}
                              className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="">Select Batch...</option>
                              {activeBatches.map((b: any) => (
                                <option key={b.id} value={b.id}>
                                  Batch #{b.id.substring(0, 8)} — {b.status} ({b.orderCount || "?"} orders)
                                </option>
                              ))}
                            </select>
                            <Button
                              onClick={handleLinkToBatch}
                              disabled={!selectedBatchId}
                              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                            >
                              Link to Batch
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {riders.length === 0 ? (
                          <p className="text-xs text-destructive font-semibold">No active riders available online.</p>
                        ) : (
                          <>
                            <select
                              value={selectedRiderId}
                              onChange={(e) => setSelectedRiderId(e.target.value)}
                              className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="">Select Rider...</option>
                              {riders.map((r: any) => (
                                <option key={r.id} value={r.id}>
                                  {r.firstName || "Rider"} {r.lastName || ""} ({r.vehicleNumber})
                                </option>
                              ))}
                            </select>
                            <Button
                              onClick={handleAssignRiderAndCreateBatch}
                              disabled={!selectedRiderId}
                              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                            >
                              Create Batch & Assign Driver
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div className="border-t border-emerald-50 pt-4 space-y-3">
                  <h3 className="text-xs font-bold text-foreground">Items in Order</h3>
                  <div className="divide-y divide-emerald-50/50 text-xs">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-3">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground text-sm block">
                            {item.productName || "Unknown Product"} <span className="text-muted-foreground font-normal">×{item.quantity}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            ID: {item.productId.substring(0, 8)}...
                          </span>
                        </div>
                        <span className="font-bold text-foreground text-sm">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-emerald-100 bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
                Select an order from the list to view items and dispatch/logistics settings.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
