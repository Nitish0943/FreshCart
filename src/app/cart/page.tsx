"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import Link from "next/link";

import { useCart, useUpdateCartQtyMutation } from "@/hooks/use-cart-queries";

export default function CartPage() {
  useCart();
  const { items } = useCartStore();
  const updateQtyMutation = useUpdateCartQtyMutation();

  const handleUpdateQty = (cartItemId: string, quantity: number) => {
    updateQtyMutation.mutate({ cartItemId, quantity });
  };

  const handleClearCart = async () => {
    for (const item of items) {
      try {
        await updateQtyMutation.mutateAsync({ cartItemId: item.id, quantity: 0 });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-4 rounded-3xl border border-dashed border-emerald-100 p-8">
            <p className="text-muted-foreground">Your shopping cart is empty.</p>
            <Link href="/">
              <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/10">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="divide-y divide-emerald-50 border-y border-emerald-50">
              {items.map((item) => (
                <div key={item.productId} className="flex flex-col sm:flex-row py-4 sm:py-6 sm:items-center gap-4">
                  {/* Product info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs overflow-hidden relative shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        "No Image"
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                      <span className="text-xs text-muted-foreground uppercase">{item.unit} &bull; ₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Controls + price */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-20 sm:pl-0">
                    {/* Quantity selectors */}
                    <div className="flex items-center rounded-xl border border-emerald-100 bg-card p-1">
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-emerald-50 text-foreground font-bold"
                      >
                        &minus;
                      </button>
                      <span className="w-10 text-center font-bold text-foreground text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-emerald-50 text-foreground font-bold"
                      >
                        &#43;
                      </button>
                    </div>

                    {/* Price and delete button */}
                    <div className="text-right flex flex-col items-end">
                      <span className="font-extrabold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => handleUpdateQty(item.id, 0)}
                        className="text-xs font-semibold text-destructive hover:underline pt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="flex flex-col space-y-4 rounded-3xl bg-card border border-emerald-50 p-6 shadow-sm">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                 <span className="font-bold text-foreground text-base">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-emerald-50 pt-4">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex items-center justify-between text-base font-extrabold text-foreground border-t border-emerald-50 pt-4">
                <span>Total Amount</span>
                 <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
                <Button onClick={handleClearCart} variant="outline" className="rounded-xl border-emerald-100 hover:bg-emerald-50 text-muted-foreground hover:text-foreground w-full sm:w-auto">
                  Clear Cart
                </Button>
                <Link href="/checkout" className="w-full sm:w-auto">
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 shadow-md shadow-emerald-600/10 w-full">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
