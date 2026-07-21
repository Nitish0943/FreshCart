"use client";

import { useOrdersQuery } from "@/hooks/use-order-queries";
import { useProductsQuery } from "@/hooks/use-catalog-queries";
import { useCustomersQuery } from "@/hooks/use-rider-queries";

export default function AdminDashboardPage() {
  const { data: orders = [], isLoading: ordersLoading } = useOrdersQuery();
  const { data: products = [], isLoading: productsLoading } = useProductsQuery();
  const { data: customers = [], isLoading: customersLoading } = useCustomersQuery();

  const loading = ordersLoading || productsLoading || customersLoading;

  const totalSales = orders
    .filter((o: any) => o.status === "DELIVERED")
    .reduce((acc: number, o: any) => acc + o.totalAmount, 0);

  const activeOrdersCount = orders.filter(
    (o: any) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  ).length;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Dashboard</h1>
        <p className="text-muted-foreground">Real-time store metrics, inventory, and order logs overview.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Sales Card */}
          <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs flex flex-col justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Total Sales (Delivered)</span>
            <div className="pt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-foreground">₹{totalSales.toFixed(2)}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Revenue</span>
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs flex flex-col justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Active Deliveries</span>
            <div className="pt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-foreground">{activeOrdersCount}</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
            </div>
          </div>

          {/* Catalog Products Card */}
          <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs flex flex-col justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Total Products</span>
            <div className="pt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-foreground">{products.length}</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Catalog</span>
            </div>
          </div>

          {/* Registered Customers Card */}
          <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs flex flex-col justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Registered Customers</span>
            <div className="pt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-foreground">{customers.length}</span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Clients</span>
            </div>
          </div>
        </div>
      )}

      {/* Orders pipeline dashboard charts placeholders/summaries */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 pt-6">
        <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-foreground text-lg">Order Status Distribution</h3>
          {loading ? (
            <div className="h-40 animate-pulse bg-muted rounded-2xl" />
          ) : orders.length === 0 ? (
            <p className="text-xs text-muted-foreground">No orders logged yet.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {["RECEIVED", "PACKING", "READY", "ASSIGNED", "DISPATCHED", "DELIVERED", "CANCELLED"].map((status) => {
                const count = orders.filter((o: any) => o.status === status).length;
                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                return (
                  <div key={status} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-muted-foreground">
                      <span>{status}</span>
                      <span className="text-foreground">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-emerald-50 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-foreground text-lg">Recent Order Logs</h3>
          {loading ? (
            <div className="h-40 animate-pulse bg-muted rounded-2xl" />
          ) : orders.length === 0 ? (
            <p className="text-xs text-muted-foreground">No orders logged yet.</p>
          ) : (
            <div className="divide-y divide-emerald-50 text-xs">
              {orders.slice(0, 5).map((o: any) => (
                <div key={o.id} className="flex justify-between py-3">
                  <div>
                    <span className="font-bold text-foreground font-mono">{o.id.substring(0, 8)}...</span>
                    <span className="text-muted-foreground block">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-bold text-foreground block">₹{o.totalAmount.toFixed(2)}</span>
                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
