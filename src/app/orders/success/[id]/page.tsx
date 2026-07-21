"use client";

import { use } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOrderQuery } from "@/hooks/use-order-queries";

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const { data: order = null, isLoading: loading } = useOrderQuery(orderId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-4 flex flex-col items-center">
          {/* Green Check Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-100/50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Order Confirmed!</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Thank you for shopping with FreshCart. Your grocery delivery order is being prepared.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-sm animate-pulse space-y-4">
            <div className="h-6 w-1/2 rounded bg-muted mx-auto" />
            <div className="h-12 rounded bg-muted" />
          </div>
        ) : !order ? (
          <div className="text-muted-foreground text-sm">Failed to retrieve order confirmation details.</div>
        ) : (
          <div className="rounded-3xl border border-emerald-50 bg-card p-6 shadow-sm space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-emerald-50 pb-4">
              <span className="text-xs font-semibold text-muted-foreground">Order ID</span>
              <span className="font-mono text-sm font-bold text-foreground truncate max-w-[200px]">{order.id}</span>
            </div>

            <div className="space-y-1.5 text-sm">
              <h3 className="font-bold text-foreground">Delivery Details</h3>
              <p className="text-muted-foreground"><span className="font-semibold text-foreground">Name:</span> {order.deliveryName}</p>
              <p className="text-muted-foreground"><span className="font-semibold text-foreground">Phone:</span> {order.deliveryPhone}</p>
              <p className="text-muted-foreground"><span className="font-semibold text-foreground">Address:</span> {order.deliveryAddress}</p>
            </div>

            <div className="border-t border-emerald-50 pt-4 flex justify-between items-center">
              <span className="text-sm font-bold text-muted-foreground">Total Paid</span>
              <span className="text-xl font-extrabold text-emerald-600">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/orders">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl border-emerald-100 hover:bg-emerald-50 font-semibold py-6 px-8">
              View Order History
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-6 px-8 shadow-md shadow-emerald-600/10">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
