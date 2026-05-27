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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip processing for static assets and API routes early
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Add security and performance headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");

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
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
