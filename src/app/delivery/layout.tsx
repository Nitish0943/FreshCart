"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useRiderStatusMutation } from "@/hooks/use-rider-queries";
import { useLogoutMutation } from "@/hooks/use-auth-queries";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [isActive, setIsActive] = useState(false);

  const riderStatusMutation = useRiderStatusMutation();
  const logoutMutation = useLogoutMutation();

  const [mounted, setMounted] = useState(false);

  // Set mounted true on client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth Guard
  useEffect(() => {
    if (mounted && _hasHydrated && !user) {
      router.push("/login?redirect=" + encodeURIComponent(pathname));
    }
  }, [mounted, _hasHydrated, user, pathname, router]);

  useEffect(() => {
    if (mounted && user && user.role === "DELIVERY_BOY") {
      async function fetchRiderProfile() {
        try {
          const res = await fetch("/api/v1/delivery/dashboard");
          const data = await res.json();
          if (data.success && data.data.profile) {
            setIsActive(data.data.profile.status === "ACTIVE");
          }
        } catch (err) {
          console.error(err);
        }
      }
      fetchRiderProfile();
    }
  }, [mounted, user]);

  if (!mounted || !_hasHydrated || !user) return null;

  if (user.role !== "DELIVERY_BOY") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-destructive sm:text-4xl">403 - Forbidden</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the delivery management dashboard.
            </p>
          </div>
          <Link href="/">
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
              Return to Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const nextStatus = isActive ? "OFFLINE" : "ACTIVE";
    riderStatusMutation.mutate(nextStatus, {
      onSuccess: () => {
        setIsActive(!isActive);
      },
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Mobile-friendly Header */}
      <header className="sticky top-0 z-50 w-full border-b border-emerald-50 bg-card px-4 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          {/* Logo icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 4.643 4.5h9.714a1.125 1.125 0 0 1 1.12 1.243l-1.264 12a1.125 1.125 0 0 1-1.12 1.243m-9 0H9M10.5 6h7.5h-7.5Zm0 4.5h7.5h-7.5Zm0 4.5h4.5h-4.5Z" />
            </svg>
          </div>
          <span className="font-extrabold text-foreground text-sm sm:text-base">Rider Portal</span>
        </div>

        {/* Rider state toggles */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              isActive
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-muted border-transparent text-muted-foreground hover:bg-accent"
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
            <span>{isActive ? "Go Offline" : "Go Online"}</span>
          </button>

          <button onClick={handleLogout} className="text-xs font-bold text-muted-foreground hover:text-destructive px-2 py-1.5">
            Logout
          </button>
        </div>
      </header>

      {/* Main administrative body */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
