"use client";

import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { useCategoriesQuery } from "@/hooks/use-catalog-queries";

export default function CategoriesPage() {
  const { data: categories = [], isLoading: loading } = useCategoriesQuery();

  const getCategoryImage = (name: string) => {
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
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        
        {/* Header */}
        <div className="space-y-1.5 border-b border-emerald-50/50 pb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            All Categories
          </h1>
          <p className="text-xs text-muted-foreground">
            Select a category below to discover fresh, farm-certified products.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="group flex flex-col items-center justify-center rounded-3xl border border-emerald-50/20 bg-white p-6 text-center shadow-xs transition-all hover:scale-[1.02] hover:shadow-md hover:border-emerald-100/50"
              >
                <div className="mb-4 aspect-square w-32 bg-emerald-50/30 rounded-2xl flex items-center justify-center overflow-hidden transition-all group-hover:scale-[1.03]">
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <img
                      className="object-cover w-full h-full"
                      src={getCategoryImage(cat.name)}
                      alt={cat.name}
                    />
                  </div>
                </div>
                <h3 className="font-extrabold text-slate-700 text-sm group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
