"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useCategoriesQuery, useProductsQuery } from "@/hooks/use-catalog-queries";
import { useAddToCartMutation } from "@/hooks/use-cart-queries";
import { useCartStore } from "@/store/cart-store";

// Tiny 1x1 blurred placeholder for instant perceived load
const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=";

const PRODUCTS_PER_PAGE = 10;

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeProducts, setActiveProducts] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: initialProducts = [], isLoading: productsLoading } = useProductsQuery();
  const addToCartMutation = useAddToCartMutation();
  const { items } = useCartStore();

  // Memoize cart calculations to avoid re-computing every render
  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (initialProducts) {
      setActiveProducts(initialProducts);
      setVisibleCount(PRODUCTS_PER_PAGE);
    }
  }, [initialProducts]);

  const handleSearchSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) {
      setActiveProducts(initialProducts);
      setVisibleCount(PRODUCTS_PER_PAGE);
      return;
    }
    try {
      const res = await fetch(`/api/v1/products/search?q=${search}`);
      const data = await res.json();
      if (data.success) {
        setActiveProducts(data.data);
        setVisibleCount(PRODUCTS_PER_PAGE);
      }
    } catch (err) {
      console.error(err);
    }
  }, [search, initialProducts]);

  const getCategoryImage = useCallback((name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("fruit") || nameLower.includes("vegetable")) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuA9OHjUe9KNX0H3lA6xlKm8YiYAuVfQCaJSQZR27ANSbnH2DqAvEM4DhLhX2jCU9csd66O0gblNvea_HzRzx-b4a4kBl9Av-QyIZcyDOcH7bpuS5PELPYnm_1Xtt6cR_7LZSw5kTwAoxpn4-RWQYZCH7tT3Bh3yfCr6IeJZ6U6OpmLqJZGmDp27VUVcxSCO_chjET5fqNJYC9fiNBLNsLUdEWk4J7NQDNmYpGOEGwKpc2KAXs5slYY";
    }
    if (nameLower.includes("dairy") || nameLower.includes("egg")) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuDz0eckXwv7qi3Vk_OMDsWbHV2ZU7tMjYX7P48fE1jNOmbxh_fve3UBkYAT40r2WvQ5vj7Px2C_4c2fNCEcf4MTKx0MrDxlJIQ4b66WovXnfHxDohM9qd5Eg-n_Zl4l9S0JcFPXKMJXOVQ8HziqcJw2IA-4i7jFCUAxVzxAReKJzp_QfVkYBV4pWlV2IXvertzO-2VYP9ijM0zZobHeUizoJZO9cdo9-TaYYq2RLvrowiySo-07rfg";
    }
    if (nameLower.includes("bakery") || nameLower.includes("bread")) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuCH2sXLh38zvKefPYKy3mMLK9NRKSyKG3wMAniPcUBoe6Ni-8uM22Qiy-h_w17NnEjQIuJtMvya5yXYDLOMhJbfsRiptjPZGNdaps3_2SmYtpC6kRjrH_hr26MREOM3LH62OhbjEwmX2IZnEWkkIH-nwWfJHfs3cFRAax6JbxgHTXWHxn-o0WZ0NH0P3fI_CgGyks6k-_zWCfZB0zMaCR1eBSKJpCu6ML88MgIu-J1v4wuL6hiywSY";
    }
    if (nameLower.includes("beverage")) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuC7ihS67cyvo4dFFeke3-L8EKnMrhI2_MmInYdZ0mnQuvTRRjn5--hmK8Zl-p2syLuo-VBKNuUgUgVJT3RsSSg1eMaTmZDo22rToT260WyXmUmMexol-1SIhhDj3tpX7YGO1xeiQdhpdLQ8UwKCKHjrtmnuSQy1PFPVfotzQxQfWP2g4xxf1ZPszxHqXs4ps2Fu2yTXo7nj2wKkii3RYieFq3S6eq2qFOtz6wB5ccaJOpR7sKH0zTs";
    }
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuAtYBy02AVqeAbSinUqAMZ_mI3oppQ4yt7M7_tcxvhYTGEd1g-ogyHoHX9MPoQ5vU4fCNzbnqrAj6fyUwxoLZQ_Pmi7x8xNWVojwKKKavWrK2opiTw2TMz0HZqiVBVBWIlpf_uCGAAnnJFst-OIm0RV1zc1RBfqp-Uoz_c9uwZwUBQTVfA9xPZFVIQ35Sb1T1zqDIce3dq3Qq_Uw7rjx7HusplRtyEIikc6mwA4_bBOTFN14-kQhM8";
  }, []);

  // Client-side pagination — only render visible products
  const visibleProducts = useMemo(
    () => activeProducts.slice(0, visibleCount),
    [activeProducts, visibleCount]
  );
  const hasMore = visibleCount < activeProducts.length;

  const loading = categoriesLoading || productsLoading;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-12">
        
        {/* Hero Section Banner */}
        <section className="relative w-full h-[360px] md:h-[400px] rounded-3xl overflow-hidden shadow-sm">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-yguR-CI3M2lAo66uWM7LI55-jwPS8zRhDwJyi4xPykbBTkG3QmvOOWdcwOfNYHFXW5nEpm1MSV9JUISVX_J97MjJFXMaZNJNpmOKHIJmiTfqOu63-w5MUmSa7hRIVJxpwdLyhIlgNQ4vHPARCEoFiGcj1LMV3Qrntl2ea3TL2Ts5UTxdAAKfF6Mbz8soHl6tlIWMtZByiMfcGyYIHkelf4tj5AP1YwMzr2C_2lzpyg6sz3edxMM"
            alt="Fresh organic produce"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 to-transparent flex items-center px-8 md:px-16">
            <div className="max-w-md space-y-4">
              <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md uppercase tracking-wider">
                Weekly Special
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                Fresh Organic Harvest <br /> Up to 40% Off
              </h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                Directly from the farm to your doorstep. Guaranteed freshness in every bite.
              </p>
              
              {/* Search Bar inside Hero */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm pt-2">
                <Input
                  type="text"
                  placeholder="Search fresh groceries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-xl border-none bg-white text-slate-800 focus-visible:ring-emerald-500 h-11"
                />
                <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 shadow-md shadow-emerald-600/20 h-11">
                  Search
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Shop by Category</h3>
            <Link href="/categories" className="text-xs font-bold text-emerald-600 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-full aspect-square bg-emerald-50/50 rounded-2xl border border-emerald-50/30 flex items-center justify-center transition-all group-hover:scale-[1.03] group-hover:shadow-md group-hover:border-emerald-100 overflow-hidden">
                    <div className="w-24 h-24 rounded-full overflow-hidden relative">
                      <Image
                        className="object-cover"
                        src={getCategoryImage(cat.name)}
                        alt={cat.name}
                        fill
                        sizes="96px"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                      />
                    </div>
                  </div>
                  <span className="font-bold text-xs text-muted-foreground group-hover:text-emerald-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured Products Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Trending Now</h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : activeProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-emerald-100 rounded-3xl bg-white p-6">
              No products found matching your search.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {visibleProducts.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-emerald-50/20 p-3 shadow-xs group flex flex-col hover:shadow-md hover:border-emerald-100/50 transition-all h-full"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50 mb-3">
                      {prod.imageUrl ? (
                        <Image
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          src={prod.imageUrl}
                          alt={prod.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL={BLUR_PLACEHOLDER}
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

              {/* Load More button for client-side pagination */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)}
                    variant="outline"
                    className="rounded-xl border-emerald-100 hover:bg-emerald-50 text-emerald-600 font-semibold px-8"
                  >
                    Load More Products ({activeProducts.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Bento Grid Promotions */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
          <div className="md:col-span-8 bg-emerald-900 text-white rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden group min-h-[220px]">
            <div className="relative z-10 max-w-sm space-y-3">
              <h3 className="text-xl md:text-2xl font-bold leading-tight">
                Special Weekend Brunch <br /> Essentials Box
              </h3>
              <p className="text-emerald-100/80 text-xs md:text-sm leading-relaxed">
                Everything you need for the perfect Sunday morning. Curated selection of eggs, bread, fruits, and juice.
              </p>
              <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors">
                Order Box
              </button>
            </div>
            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-30 group-hover:opacity-60 transition-opacity">
              <Image
                className="object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-9_-g8j0T_zOJp_Zc3xjYjbBxWp09ID5gFiT3NQhgp3AUqEZdO2C_4gsf3_f9NgsHlqALJqdzuaMdFJdySbnOnFnu1xgfsjWIiw2TyKZ9cQzco4fntjlH_2rIHtrgO6scfWbKhGPAYgFBIWXMgR9f0colFFpmx7cAFl5st-5TriwSQeJ1AtwYKSctuaqzRfqqUfQPkQj2g7eqrTueyCTZ1eIoDNkrSwTwHgwoVTujAenI3MsLySs"
                alt="Brunch Essentials"
                fill
                sizes="50vw"
                loading="lazy"
              />
            </div>
          </div>

          <div className="md:col-span-4 bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col items-center text-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l4.038 3.332a1.125 1.125 0 0 1 0 1.702l-4.038 3.332a1.125 1.125 0 0 1-1.485-1.702l2.39-1.97H9.75a6.75 6.75 0 0 0-6.75 6.75v.568" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-emerald-800">Eco-Friendly Delivery</h3>
            <p className="text-emerald-700/80 text-xs leading-relaxed">
              We use 100% recycled packaging and electric vehicles for your groceries.
            </p>
            <span className="text-emerald-700 font-bold text-xs border-b border-emerald-700 cursor-pointer pb-0.5 hover:text-emerald-600">
              Learn More
            </span>
          </div>
        </section>
      </main>

      {/* Floating Action Button for Cart Summary */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Link href="/cart">
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 hover:-translate-y-0.5 transition-all active:scale-95">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] opacity-75 uppercase tracking-wider font-bold">
                  {cartCount} {cartCount === 1 ? "Item" : "Items"}
                </p>
                <p className="font-extrabold text-sm">₹{cartTotal.toFixed(2)}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
