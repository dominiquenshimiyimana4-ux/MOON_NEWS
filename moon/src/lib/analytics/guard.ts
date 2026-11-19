import "server-only";
import type { NextRequest } from "next/server";

export const ADMIN_ANALYTICS_ROLES = ["admin", "editor"] as const;

export interface GuardResult {
  ok: boolean;
  status: number;
  error?: string;
  role?: string;
  userId?: string;
}

export async function requireAdmin(req: NextRequest): Promise<GuardResult> {
  const backendUrl = process.env.BACKEND_API_URL?.trim().replace(/\/+$/, "");
  if (!backendUrl) return { ok: false, status: 503, error: "Authentication service unavailable." };

  const cookie = req.headers.get("cookie");
  if (!cookie) return { ok: false, status: 401, error: "Authentication required." };

  try {
    const response = await fetch(`${backendUrl}/api/users/profile`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, status: response.status, error: "Authentication required." };
    const payload = await response.json() as { id?: string; role?: string };
    if (!payload.role || !(ADMIN_ANALYTICS_ROLES as readonly string[]).includes(payload.role)) {
      return { ok: false, status: 403, error: "Administrator access required." };
    }
    return { ok: true, status: 200, role: payload.role, userId: payload.id };
  } catch {
    return { ok: false, status: 503, error: "Authentication service unavailable." };
  }
}