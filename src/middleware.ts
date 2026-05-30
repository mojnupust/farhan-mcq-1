import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route protection stub — replace with real auth (e.g., NextAuth) later
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/courses",
  "/messages",
  "/profile",
  "/subscriptions",
];

const ADMIN_PREFIXES = ["/admin"];

// ─── Security Headers ──────────────────────────────────────────────────────
const securityHeaders = {
  // Prevent MIME-type sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // DNS prefetch for performance
  "X-DNS-Prefetch-Control": "on",
  // Strict referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Enforce HTTPS (1 year)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // Disable browser features that aren't needed
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  // Prevent XSS attacks in older browsers
  "X-XSS-Protection": "1; mode=block",
  // Content Security Policy — strict but allows required resources
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://generativelanguage.googleapis.com",
    "frame-src 'self' https://www.youtube.com https://youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),
  // Prevent cross-origin information leakage
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "credentialless",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip processing for static assets early
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Apply all security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // In mock mode, allow all routes
  // When real auth is implemented, check session here
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected || isAdmin) {
    // TODO: Check auth session
    // const session = await getSession(request);
    // if (!session) return NextResponse.redirect(new URL("/login", request.url));
    // if (isAdmin && session.role !== "admin") return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
