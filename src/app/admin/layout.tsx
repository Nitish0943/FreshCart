"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!mounted || !_hasHydrated || !user) return null;

  if (user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-destructive sm:text-4xl">403 - Forbidden</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the administrative dashboard.
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

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
      </svg>
    )},
    { name: "Orders", href: "/admin/orders", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    )},
    { name: "Products", href: "/admin/products", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5 12 12m0 0-8.25-4.5M12 12v9m8.25-13.5L12 3m0 0-8.25 4.5M21 12c0 1.664-3.5 3-7.5 3s-7.5-1.336-7.5-3m15 0c0-1.664-3.5-3-7.5-3s-7.5 1.336-7.5 3m15 0v5.25c0 1.664-3.5 3-7.5 3s-7.5-1.336-7.5-3V12" />
      </svg>
    )},
    { name: "Categories", href: "/admin/categories", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l6.499 6.499c.404.404.935.613 1.474.613.54 0 1.07-.21 1.474-.613l6.499-6.499c.422-.422.659-1 .659-1.591V5.25A2.25 2.25 0 0 0 18.75 3h-4.318a2.25 2.25 0 0 0-1.591.659L6.613 9.886a.75.75 0 0 1-1.06-1.06l6.228-6.227A2.25 2.25 0 0 0 9.568 3Z" />
      </svg>
    )},
    { name: "Delivery Boys", href: "/admin/delivery-boys", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 4.643 4.5h9.714a1.125 1.125 0 0 1 1.12 1.243l-1.264 12a1.125 1.125 0 0 1-1.12 1.243m-9 0H9M10.5 6h7.5h-7.5Zm0 4.5h7.5h-7.5Zm0 4.5h4.5h-4.5Z" />
      </svg>
    )},
    { name: "Customers", href: "/admin/customers", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    )},
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar navigation */}
      <aside className="w-64 border-r border-emerald-50 bg-card p-6 flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-8">
          <Link href="/" className="flex items-center space-x-2 font-extrabold text-2xl text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6 text-emerald-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span>FreshCart Admin</span>
          </Link>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-emerald-50">
          <Link href="/">
            <Button variant="outline" className="w-full rounded-xl border-emerald-100 hover:bg-emerald-50 text-xs font-semibold">
              Return to Store
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-emerald-50 p-6 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 font-extrabold text-xl text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 text-emerald-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span>FreshCart</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-emerald-50">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" className="w-full rounded-xl border-emerald-100 hover:bg-emerald-50 text-xs font-semibold">
              Return to Store
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main administrative body */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-emerald-50 bg-card px-4 sm:px-6 flex items-center justify-between shrink-0">
          {/* Mobile hamburger + logo */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-muted-foreground hover:text-emerald-600 hover:bg-slate-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="font-extrabold text-emerald-600 text-lg">Admin</span>
          </div>

          {/* Spacer for desktop (pushes greeting right) */}
          <div className="hidden md:block" />

          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-foreground">
              Hello, {user.firstName || "Admin"}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
