import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface JwtPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

/**
 * Backend যে HS256 JWT ইস্যু করে (shared JWT_SECRET), সেটাই verify করে এবং
 * role === "ADMIN" বাধ্যতামূলক করে। null মানে আগানো যাবে; NextResponse মানে
 * সাথে সাথে সেটা return করে দাও।
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("[admin-guard] JWT_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  try {
    const payload = jwt.verify(header.slice(7), secret) as JwtPayload;
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}