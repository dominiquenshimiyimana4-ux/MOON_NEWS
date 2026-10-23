"use client";

import type { AnalyticsSnapshot, TrafficRange, VisitorStats, TrafficSeries } from "@/lib/types";
import { getToken } from "./api";

/**
 * Client for the visitor-analytics API.
 *
 * Ingestion (`track`) is public — the visitor tracker calls it. All reporting
 * endpoints require an admin token, so they send the bearer token the auth
 * service stored. Requests go to the app's own `/api/*` routes, which normalise
 * access to the analytics store on the server.
 */

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface TrackPayload {
  visitorToken: string;
  sessionId: string;
  page: string;
  source?: string;
  device?: "desktop" | "mobile" | "tablet";
  browser?: string;
  os?: string;
  kind?: "pageview" | "heartbeat";
}

export interface TrackResult {
  recorded: boolean;
  visitorId: string;
  sessionId: string;
  isNewVisitor: boolean;
  onlineNow: number;
}

export const analyticsService = {
  /** Public: record a visit or heartbeat. Never throws — analytics is best-effort. */
  async track(payload: TrackPayload): Promise<TrackResult | null> {
    try {
      const res = await fetch("/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      if (!res.ok) return null;
      return (await res.json()) as TrackResult;
    } catch {
      return null;
    }
  },

  /** Admin: full snapshot (stats + traffic + breakdowns). */
  async snapshot(range: TrafficRange = "7d"): Promise<AnalyticsSnapshot | null> {
    try {
      const res = await fetch(`/api/admin/analytics/visitors?range=${range}`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) return null;
      return (await res.json()) as AnalyticsSnapshot;
    } catch {
      return null;
    }
  },

  /** Admin: lightweight online count for polling. */
  async online(): Promise<{ onlineNow: number; windowSeconds: number; at: string } | null> {
    try {
      const res = await fetch("/api/admin/analytics/online", {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) return null;
      return (await res.json()) as { onlineNow: number; windowSeconds: number; at: string };
    } catch {
      return null;
    }
  },

  /** Admin: just the traffic series. */
  async daily(range: TrafficRange = "7d"): Promise<TrafficSeries | null> {
    try {
      const res = await fetch(`/api/admin/analytics/daily?range=${range}`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) return null;
      return (await res.json()) as TrafficSeries;
    } catch {
      return null;
    }
  },

  /** Admin: totals only (used by the dashboard summary cards). */
  async stats(): Promise<VisitorStats | null> {
    const snap = await this.snapshot("7d");
    return snap?.stats ?? null;
  },
};
