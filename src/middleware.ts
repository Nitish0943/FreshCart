import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { COOKIE_KEYS } from "@/constants";

// Define public API paths that do NOT require authentication
const PUBLIC_PATHS = [
  { path: "/api/v1/auth/login", method: "POST" },
  { path: "/api/v1/auth/register", method: "POST" },
  { path: "/api/v1/checkout/prefill", method: "GET" },
];

// Page routes that can be accessed without login
const PUBLIC_PAGES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // --- PAGE ROUTE AUTH GUARD ---
  if (!pathname.startsWith("/api/")) {
    // Allow public pages
    if (PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      return NextResponse.next();
    }

    // Check for auth token
    const token = request.cookies.get(COOKIE_KEYS.AUTH_TOKEN)?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token is valid
    const payload = await verifyJWT(token);
    if (!payload || !payload.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { user } = payload;

    // Role-based page access control
    if (pathname.startsWith("/admin")) {
      if (user.role !== "ADMIN") {
        // Redirect non-admin users to their appropriate area
        const redirectTo = user.role === "DELIVERY_BOY" ? "/delivery/dashboard" : "/";
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }

    if (pathname.startsWith("/delivery")) {
      if (user.role !== "DELIVERY_BOY") {
        // Redirect non-delivery users to their appropriate area
        const redirectTo = user.role === "ADMIN" ? "/admin/dashboard" : "/";
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }

    return NextResponse.next();
  }

  // --- API ROUTE AUTH (existing logic below) ---
  if (!pathname.startsWith("/api/v1/")) {
    return NextResponse.next();
  }

  // Check if path is public (exact match)
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => p.path === pathname && p.method === method
  );

  // Special rule: GET /api/v1/products and GET /api/v1/categories are public catalog views
  const isPublicGetCatalog =
    method === "GET" &&
    (pathname === "/api/v1/products" ||
      pathname.startsWith("/api/v1/products/") ||
      pathname === "/api/v1/categories" ||
      pathname.startsWith("/api/v1/categories/"));

  if (isPublicPath || isPublicGetCatalog) {
    return NextResponse.next();
  }

  // Extract token from cookies or Authorization header
  let token = request.cookies.get(COOKIE_KEYS.AUTH_TOKEN)?.value;
  const authHeader = request.headers.get("Authorization");
  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized. Token missing." }, { status: 401 });
  }

  // Verify token
  const payload = await verifyJWT(token);
  if (!payload || !payload.user) {
    return NextResponse.json({ success: false, error: "Unauthorized. Invalid token." }, { status: 401 });
  }

  const { user } = payload;

  // Role-Based Access Control (RBAC) Path restrictions
  if (pathname.startsWith("/api/v1/admin/") && user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden. Admin access required." }, { status: 403 });
  }

  if (pathname.startsWith("/api/v1/delivery/") && user.role !== "DELIVERY_BOY") {
    return NextResponse.json({ success: false, error: "Forbidden. Delivery Boy access required." }, { status: 403 });
  }

  // Inject user information headers to pass down to Route Handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-email", user.email);
  requestHeaders.set("x-user-role", user.role);
  if (user.firstName) requestHeaders.set("x-user-first-name", user.firstName);
  if (user.lastName) requestHeaders.set("x-user-last-name", user.lastName);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Match both page routes and API routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

