"use client";

import { use } from "react";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useProductQuery } from "@/hooks/use-catalog-queries";
import { useAddToCartMutation } from "@/hooks/use-cart-queries";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = use(params);
  const [quantity, setQuantity] = useState(1);
  const { data: product = null, isLoading: loading } = useProductQuery(productId);
  const addToCartMutation = useAddToCartMutation();

  const handleQtyChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <Link href="/" className="text-sm font-semibold text-emerald-600 hover:underline">
          &larr; Back to shopping
        </Link>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 animate-pulse">
            <div className="aspect-square rounded-3xl bg-muted" />
            <div className="space-y-6">
              <div className="h-10 w-2/3 rounded-lg bg-muted" />
              <div className="h-6 w-1/3 rounded-lg bg-muted" />
              <div className="h-24 rounded-lg bg-muted" />
              <div className="h-12 w-1/2 rounded-lg bg-muted" />
            </div>
          </div>
        ) : !product ? (
          <div className="text-center py-12 text-muted-foreground">
            Product details not found or item has been discontinued.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Left Product Image */}
            <div className="aspect-square w-full rounded-3xl bg-muted flex items-center justify-center overflow-hidden border border-emerald-50 relative">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-muted-foreground font-bold">No Image Available</span>
              )}
            </div>

            {/* Right Product Details Info */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {product.unit}
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{product.name}</h1>
                <p className="text-2xl font-extrabold text-emerald-600">₹{product.price.toFixed(2)}</p>
              </div>

              <div className="border-t border-emerald-50 pt-6 space-y-2">
                <h3 className="font-bold text-foreground">Description</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{product.description || "No description provided."}</p>
              </div>

              <div className="border-t border-emerald-50 pt-6 space-y-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center rounded-xl border border-emerald-100 bg-card p-1">
                    <button
                      onClick={() => handleQtyChange(quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-emerald-50 text-foreground font-bold transition-colors"
                    >
                      &minus;
                    </button>
                    <span className="w-12 text-center font-extrabold text-foreground">{quantity}</span>
                    <button
                      onClick={() => handleQtyChange(quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-emerald-50 text-foreground font-bold transition-colors"
                    >
                      &#43;
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Available stock: <span className="font-bold text-foreground">{product.stockQty}</span>
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stockQty <= 0}
                  className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-6 px-12 shadow-lg shadow-emerald-600/10"
                >
                  {product.stockQty <= 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
