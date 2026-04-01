import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ─── Route protection map ─────────────────────────────────────────────────────
//
//  /profile/*   → any logged-in user
//  /admin/*       → role === "admin" only
//  /authpage/*    → redirect to dashboard if already logged in
//  /api/admin/*   → role === "admin" only (API level guard)
//  /api/user/*    → any logged-in user
//  /api/email/*   → any logged-in user
//
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get JWT token from cookie (works with NextAuth JWT strategy)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const isAdmin = token?.role === "admin";

  // ── 1. Already logged in → redirect away from auth pages ─────────────────
  if (pathname.startsWith("/authpage") || pathname.startsWith("/login")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    return NextResponse.next();
  }

  // ── 2. Admin-only pages ───────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/authpage", req.url));
    }
    // if (!isAdmin) {
    //   // Logged in but not admin → send to dashboard with error
    //   return NextResponse.redirect(new URL("/profile?error=forbidden", req.url));
    // }
    return NextResponse.next();
  }

  // ── 3. Protected user pages ───────────────────────────────────────────────
  if (pathname.startsWith("/profile")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/authpage", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── 4. Admin-only API routes ──────────────────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // ── 5. Protected API routes ───────────────────────────────────────────────
  if (
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/api/email")
  ) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// ─── Matcher: which paths this middleware runs on ─────────────────────────────
// Skips: _next/static, _next/image, favicon, public files
// Includes: all pages + all api routes we care about

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/authpage/:path*",
    "/login/:path*",
    "/api/user/:path*",
    "/api/email/:path*",
    "/api/admin/:path*",
  ],
};