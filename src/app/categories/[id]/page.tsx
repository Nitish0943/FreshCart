"use client";

import { use, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCategoriesQuery, useProductsQuery } from "@/hooks/use-catalog-queries";
import { useAddToCartMutation } from "@/hooks/use-cart-queries";

export default function CategoryProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: categoryId } = use(params);
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: products = [], isLoading: productsLoading } = useProductsQuery(categoryId);
  const addToCartMutation = useAddToCartMutation();

  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);

  const category = categories.find((c: any) => c.id === categoryId) || null;
  const loading = categoriesLoading || productsLoading;

  // Filter products based on sidebar filters
  const filteredProducts = products.filter((prod: any) => {
    if (inStockOnly && prod.stockQty <= 0) return false;
    if (prod.price > maxPrice) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-emerald-50/50 shadow-xs space-y-6">
            <div className="border-b border-slate-50 pb-4">
              <h3 className="text-lg font-bold text-foreground">Filters</h3>
            </div>

            {/* Categories filter list */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Categories
              </p>
              <div className="space-y-2">
                {categories.map((cat: any) => {
                  const isCurrent = cat.id === categoryId;
                  return (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.id}`}
                      className={`flex items-center justify-between text-xs font-semibold py-1.5 px-2 rounded-xl transition-all ${
                        isCurrent
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-muted-foreground hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isCurrent && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Price range filter */}
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Max Price: <span className="text-emerald-600 font-extrabold">₹{maxPrice}</span>
              </p>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>₹0</span>
                <span>₹1000+</span>
              </div>
            </div>

            {/* Availability filter */}
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Availability
              </p>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-semibold text-muted-foreground">In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Ad/Promo Card */}
          <div className="rounded-3xl overflow-hidden relative group h-48 shadow-xs border border-emerald-50/50">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCB5VaRuWZ2Wo6wZmDuGzdFdXC0Gj15owTFfMJ6R27hvGxT8A2DiHga2h8HrVdHxCBD7fzwAk9nHYCcJM2Fl7jkcJ644rVvGpVP4HTLvbhYseDIn7qTwkWkpVJ8jARMP1wjloHtqjZU3CjQkVDwG0AV_G_sjFKew_6mPrazCJkfNUfATVOxs9p6maH0ZfR2hdgA1-_gwIEVmzXu9JjNPyFe_70bCjMdp5NnInzCn_Ox0U1kAg-_8-w')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent flex flex-col justify-end p-4">
              <p className="text-white font-extrabold text-sm">Fresh Deals</p>
              <p className="text-emerald-100/80 text-[11px] font-medium leading-relaxed">
                Up to 30% off on Organic items
              </p>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="flex-1 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-50/50 pb-5">
            <div>
              <Link href="/categories" className="text-xs font-bold text-emerald-600 hover:underline block mb-1">
                ← Back to categories
              </Link>
              <h2 className="text-2xl font-bold text-slate-800">
                {category ? category.name : "Products"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredProducts.length} items found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-emerald-100 rounded-3xl bg-white p-8">
              No products found matching the filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((prod: any) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-emerald-50/20 p-3 shadow-xs group flex flex-col hover:shadow-md hover:border-emerald-100/50 transition-all h-full"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50 mb-3">
                    {prod.imageUrl ? (
                      <img
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={prod.imageUrl}
                        alt={prod.name}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col px-1 pb-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                      {prod.unit}
                    </span>
                    <Link
                      href={`/products/${prod.id}`}
                      className="font-bold text-slate-800 text-sm mb-1 hover:text-emerald-600 line-clamp-1"
                    >
                      {prod.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                      {prod.description}
                    </p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="font-extrabold text-emerald-600 text-base">
                        ₹{prod.price.toFixed(2)}
                      </span>
                      <Button
                        onClick={() =>
                          addToCartMutation.mutate({
                            productId: prod.id,
                            quantity: 1,
                          })
                        }
                        className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors p-0 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
