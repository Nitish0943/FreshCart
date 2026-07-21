"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

import { useCart } from "@/hooks/use-cart-queries";
import { useLogoutMutation } from "@/hooks/use-auth-queries";

export function Navbar() {
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  useCart(); // hydrate state
  const cartItems = useCartStore((state) => state.items);
  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 font-extrabold text-2xl text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6 text-emerald-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <span>FreshCart</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-8 text-sm font-semibold text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-emerald-600">Shop</Link>
          <Link href="/categories" className="transition-colors hover:text-emerald-600">Categories</Link>
          {user && user.role === "CUSTOMER" && <Link href="/orders" className="transition-colors hover:text-emerald-600">My Orders</Link>}
          {user && user.role === "ADMIN" && <Link href="/admin/dashboard" className="transition-colors hover:text-emerald-600 text-emerald-600 font-bold">Admin Dashboard</Link>}
          {user && user.role === "DELIVERY_BOY" && <Link href="/delivery/dashboard" className="transition-colors hover:text-emerald-600 text-emerald-600 font-bold">Delivery Dashboard</Link>}
        </nav>

        {/* Actions (Cart & Auth) */}
        <div className="flex items-center space-x-2">
          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 text-muted-foreground transition-colors hover:text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-md shadow-emerald-500/20">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* User Section (Desktop Only) */}
          <div className="hidden md:block">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50 flex items-center justify-center font-extrabold text-sm hover:bg-emerald-100 focus:outline-none transition-all shadow-xs"
                >
                  {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-100"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-colors"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" className="rounded-xl border-emerald-100 hover:bg-emerald-50">Sign In</Button>
                </Link>
                <Link href="/register" className="hidden sm:inline-block">
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Button (Mobile/Tablet Only) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-emerald-600 hover:bg-slate-50 focus:outline-none md:hidden transition-colors"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-lg z-50 md:hidden p-4 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3 font-semibold text-sm text-slate-600">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-emerald-600 py-1"
            >
              Shop
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-emerald-600 py-1"
            >
              Categories
            </Link>
            {user && user.role === "CUSTOMER" && (
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-600 py-1"
              >
                My Orders
              </Link>
            )}
            {user && user.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-emerald-600 py-1 font-bold"
              >
                Admin Dashboard
              </Link>
            )}
            {user && user.role === "DELIVERY_BOY" && (
              <Link
                href="/delivery/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-emerald-600 py-1 font-bold"
              >
                Delivery Dashboard
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t border-slate-50">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50 flex items-center justify-center font-extrabold text-sm">
                    {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full rounded-xl border-emerald-100 hover:bg-emerald-50 text-xs font-bold py-2">
                      My Profile
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/15 text-xs font-bold py-2"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full rounded-xl border-emerald-100 hover:bg-emerald-50 text-xs font-bold py-2">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 shadow-md shadow-emerald-600/10">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
