import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ─── CORS for scraper routes ──────────────────────────────────────────────────

function scraperCorsHeaders(origin: string | null) {
  // Allow any Chrome extension or localhost
  const allow =
    origin?.startsWith("chrome-extension://") ||
    origin?.startsWith("http://localhost")
      ? origin
      : "*";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // ── 0. /api/scraper/* — CORS only (auth handled in-route via X-API-Key) ────
  if (pathname.startsWith("/api/scraper")) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: scraperCorsHeaders(origin),
      });
    }

    const response = NextResponse.next();
    Object.entries(scraperCorsHeaders(origin)).forEach(([k, v]) =>
      response.headers.set(k, v),
    );
    return response;
  }

  // ── JWT token for all other protected routes ───────────────────────────────
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
  });

  console.log("🔑 Middleware token:", JSON.stringify(token, null, 2));
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
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/profile?error=forbidden", req.url));
    }
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
  //    /api/email/ (bulk mailer) requires session auth.
  //    /api/scraper/ uses its own X-API-Key — excluded above.
  if (
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/api/email/")
  ) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── 6. Standard security headers ─────────────────────────────────────────
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/authpage/:path*",
    "/login/:path*",
    "/api/user/:path*",
    "/api/email/:path*",
    "/api/scraper/:path*", // ← CORS passthrough, no session auth
    "/api/admin/:path*",
  ],
};