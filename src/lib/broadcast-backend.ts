import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:3002"
).replace(/\/+$/, "");

function internalHeaders(): Record<string, string> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) throw new Error("INTERNAL_API_SECRET not configured");
  return {
    "Content-Type": "application/json",
    "x-internal-token": secret,
  };
}

function authHeaders(req: NextRequest): Record<string, string> {
  const auth = req.headers.get("authorization");
  return {
    "Content-Type": "application/json",
    ...(auth ? { Authorization: auth } : {}),
  };
}

export function getAdminUserIdFromRequest(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const payload = jwt.verify(header.slice(7), secret) as { userId?: string };
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

export async function createBroadcastLogOnBackend(
  req: NextRequest,
  body: Record<string, unknown>,
): Promise<{ id: string }> {
  const res = await fetch(`${API_ORIGIN}/api/v1/broadcasts`, {
    method: "POST",
    headers: authHeaders(req),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Broadcast log create failed: ${res.status} ${err.slice(0, 200)}`);
  }
  const json = (await res.json()) as { data: { id: string } };
  return json.data;
}

export async function updateBroadcastLogOnBackend(
  id: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${API_ORIGIN}/api/v1/broadcasts/${id}`, {
    method: "PATCH",
    headers: internalHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Broadcast log update failed: ${res.status} ${err.slice(0, 200)}`);
  }
}
