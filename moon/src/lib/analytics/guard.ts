import "server-only";
import type { NextRequest } from "next/server";

/**
 * Authorization guard for the admin analytics API.
 *
 * Every `/api/admin/analytics/*` route calls `requireAdmin`. The check runs on
 * the server so the numbers can never be scraped by an anonymous client, and
 * mirrors the same role rules the admin UI uses (`canAccessAdmin`).
 *
 * In production the request carries the JWT issued by the auth service; we
 * verify the signature and role here. In this repo the demo token has the shape
 * `demo.<base64 payload>.signature` (see authService.fakeToken) so the guard can
 * decode and enforce the role without a real signing key.
 */

export const ADMIN_ANALYTICS_ROLES = ["admin", "editor"] as const;

export interface GuardResult {
  ok: boolean;
  status: number;
  error?: string;
  role?: string;
  userId?: string;
}

interface TokenPayload {
  sub?: string;
  role?: string;
  iat?: number;
}

function decodeToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], "base64").toString("utf8");
    const parsed = JSON.parse(json) as TokenPayload;
    return parsed;
  } catch {
    return null;
  }
}

function extractToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  // Also accept a cookie so server-rendered admin fetches can pass credentials.
  const cookie = req.cookies.get("moon_news_token")?.value;
  return cookie ?? null;
}

/**
 * Returns a failing result (never throwing) so routes can early-return a 401/403.
 */
export function requireAdmin(req: NextRequest): GuardResult {
  const token = extractToken(req);
  if (!token) {
    return { ok: false, status: 401, error: "Authentication required." };
  }
  const payload = decodeToken(token);
  if (!payload) {
    return { ok: false, status: 401, error: "Invalid or expired token." };
  }
  if (!payload.role || !(ADMIN_ANALYTICS_ROLES as readonly string[]).includes(payload.role)) {
    return { ok: false, status: 403, error: "Administrator access required." };
  }
  return { ok: true, status: 200, role: payload.role, userId: payload.sub };
}
