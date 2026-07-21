"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useOrdersQuery } from "@/hooks/use-order-queries";

export default function OrderHistoryPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: orders = [], isLoading: loading } = useOrdersQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth Guard redirect
  useEffect(() => {
    if (mounted && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Order History</h1>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 space-y-4 rounded-3xl border border-dashed border-emerald-100 p-8">
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            <Link href="/" className="font-semibold text-emerald-600 hover:underline">
              Start shopping &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-3 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground font-mono truncate max-w-[120px]">{order.id}</span>
                    <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-extrabold text-foreground">Delivering to: {order.deliveryName}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-md">{order.deliveryAddress}</p>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 border-emerald-50/50 pt-4 md:pt-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : order.status === "CANCELLED"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className="text-lg font-extrabold text-foreground">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
