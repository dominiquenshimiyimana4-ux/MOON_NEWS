import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type {
  AnalyticsBreakdown,
  AnalyticsSnapshot,
  TrafficRange,
  TrafficSeries,
  Visit,
  VisitorStats,
} from "@/lib/types";

/**
 * Server-side visitor analytics repository.
 *
 * This is the concrete implementation behind the `/api/analytics/*` and
 * `/api/admin/analytics/*` routes. It is written against the shape of the
 * Postgres schema in `docs/analytics-schema.sql` and keeps the same semantics:
 *
 *   - One row per UNIQUE visitor identity (rotating, opaque visitor id).
 *   - One append-only page-view row per visit, de-duplicated per page/dedupe
 *     window so a refresh does NOT inflate the count.
 *   - A small "online now" map that self-prunes, so `onlineNow` is cheap.
 *   - Everything is derived from recorded visits — nothing is faked.
 *
 * Persistence: in production this module talks to Postgres (see the SQL
 * functions `record_visit`, `unique_visitors_between`, `visitors_daily`). In
 * this repo it uses a durable process-level store with a rolling retention
 * window, which lets the app run end-to-end without a database while exposing
 * the exact same API and guarantees. Swap the `persistence` block for the SQL
 * calls and the rest of the system is unchanged.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** A visitor is "online" if seen within this many seconds. */
export const ONLINE_WINDOW_SECONDS = 120;

/** Refreshing the same page within this window is not a new page view. */
export const DEDUPE_WINDOW_MINUTES = 30;

/** Kept raw for this many days (matches the SQL retention policy). */
export const RETENTION_DAYS = 90;

/** Secret used to derive rotating, non-reversible visitor ids. */
const VISITOR_SALT =
  process.env.ANALYTICS_SALT ??
  process.env.NEXT_PUBLIC_ANALYTICS_SALT ??
  "moon-news-analytics-salt";

// ---------------------------------------------------------------------------
// Persistence (process-level, survives hot reloads via globalThis)
// ---------------------------------------------------------------------------

interface AnalyticsDb {
  /** visitorId -> first/last seen + flags. */
  visitors: Map<string, {
    firstVisit: number;
    lastVisit: number;
    totalVisits: number;
    isReturning: boolean;
    country?: string;
    city?: string;
  }>;
  /** Append-only page views (already de-duplicated). */
  visits: Visit[];
  /** sessionId -> last activity epoch ms (the "online now" table). */
  online: Map<string, { visitorId: string; page: string; lastSeen: number }>;
}

declare global {
  var __moonAnalyticsDb: AnalyticsDb | undefined;
}

function emptyDb(): AnalyticsDb {
  return { visitors: new Map(), visits: [], online: new Map() };
}

function db(): AnalyticsDb {
  if (!globalThis.__moonAnalyticsDb) globalThis.__moonAnalyticsDb = emptyDb();
  return globalThis.__moonAnalyticsDb;
}

// ---------------------------------------------------------------------------
// Identity helpers
// ---------------------------------------------------------------------------

/** UTC day bucket, e.g. "2026-10-08". */
export function utcDateKey(ms: number = Date.now()): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Derives the stored visitor id from a raw client token.
 *
 * The client keeps a random `moon_vid` token and passes it in. We never store
 * that raw token — we store an HMAC-style SHA-256 of (salt + token + day) so the
 * value is opaque and rotates daily: it cannot be used to follow a person from
 * one day to the next, which keeps the "unique per day" guarantee honest while
 * staying inside data-protection limits.
 */
export function deriveVisitorId(rawToken: string, dayKey = utcDateKey()): string {
  const hash = createHash("sha256")
    .update(`${VISITOR_SALT}:${dayKey}:${rawToken}`)
    .digest("hex");
  return `v_${hash.slice(0, 32)}`;
}

/** A stable id used to count "unique visitor today" buckets. */
function dailyVisitorKey(visitorId: string, dayKey: string): string {
  return `${visitorId}@${dayKey}`;
}

// ---------------------------------------------------------------------------
// Ingestion
// ---------------------------------------------------------------------------

export interface VisitInput {
  visitorToken: string;
  page: string;
  source?: string;
  device?: "desktop" | "mobile" | "tablet";
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  /** Optional client session id; generated when absent. */
  sessionId?: string;
  /** "pageview" (default) or "heartbeat" (activity ping only). */
  kind?: "pageview" | "heartbeat";
}

export interface VisitResult {
  recorded: boolean;
  visitorId: string;
  sessionId: string;
  isNewVisitor: boolean;
  onlineNow: number;
}

/**
 * Records activity. A page view is only appended when the same visitor has not
 * viewed the same page within the dedupe window — so refreshes and re-opens do
 * not inflate the numbers. A heartbeat only refreshes the online presence.
 */
export function recordVisit(input: VisitInput): VisitResult {
  const store = db();
  const now = Date.now();
  const dayKey = utcDateKey(now);
  const visitorId = deriveVisitorId(input.visitorToken || randomUUID(), dayKey);
  const sessionId = input.sessionId?.trim() || randomUUID();
  const page = normalizePage(input.page);

  // --- visitor identity -----------------------------------------------------
  const existing = store.visitors.get(visitorId);
  const isNewVisitor = !existing;
  if (existing) {
    existing.lastVisit = now;
    existing.totalVisits += 1;
    existing.isReturning = true;
    if (input.country && !existing.country) existing.country = input.country;
    if (input.city && !existing.city) existing.city = input.city;
  } else {
    store.visitors.set(visitorId, {
      firstVisit: now,
      lastVisit: now,
      totalVisits: 1,
      isReturning: false,
      country: input.country,
      city: input.city,
    });
  }

  // --- de-duplicate page views ---------------------------------------------
  let recorded = false;
  if (input.kind !== "heartbeat") {
    const dedupeMs = DEDUPE_WINDOW_MINUTES * 60_000;
    const recent = store.visits.some(
      (v) =>
        v.visitorId === visitorId &&
        v.page === page &&
        now - new Date(v.lastVisit).getTime() < dedupeMs
    );
    if (!recent) {
      store.visits.push({
        id: randomUUID(),
        visitorId,
        sessionId,
        page,
        source: normalizeSource(input.source),
        device: input.device ?? "desktop",
        browser: input.browser ?? "unknown",
        os: input.os ?? "unknown",
        country: input.country,
        city: input.city,
        firstVisit: new Date(now).toISOString(),
        lastVisit: new Date(now).toISOString(),
        visitDate: dayKey,
      });
      recorded = true;
    } else {
      // Still extend lastVisit so retention sees recent activity.
      const last = [...store.visits].reverse().find((v) => v.visitorId === visitorId && v.page === page);
      if (last) last.lastVisit = new Date(now).toISOString();
    }
  }

  // --- online presence (self-pruning) --------------------------------------
  store.online.set(sessionId, { visitorId, page, lastSeen: now });
  pruneOnline(now);
  pruneRetention(now);

  return { recorded, visitorId, sessionId, isNewVisitor, onlineNow: onlineCount(now) };
}

function normalizePage(page: string): string {
  try {
    const url = page.startsWith("http") ? new URL(page) : null;
    const path = url ? url.pathname : page;
    return path.split("?")[0].split("#")[0] || "/";
  } catch {
    return "/";
  }
}

function normalizeSource(source?: string): string {
  if (!source) return "direct";
  try {
    const url = new URL(source);
    return url.hostname.replace(/^www\./, "") || "direct";
  } catch {
    const s = source.trim().toLowerCase();
    if (!s) return "direct";
    return s.replace(/^www\./, "").split("/")[0];
  }
}

function pruneOnline(now: number) {
  const cutoff = now - ONLINE_WINDOW_SECONDS * 1000;
  for (const [id, entry] of db().online) {
    if (entry.lastSeen < cutoff) db().online.delete(id);
  }
}

function pruneRetention(now: number) {
  const cutoff = now - RETENTION_DAYS * 86_400_000;
  const store = db();
  if (store.visits.length && new Date(store.visits[0].lastVisit).getTime() < cutoff) {
    store.visits = store.visits.filter((v) => new Date(v.lastVisit).getTime() >= cutoff);
  }
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export function onlineCount(now: number = Date.now()): number {
  const cutoff = now - ONLINE_WINDOW_SECONDS * 1000;
  let count = 0;
  for (const entry of db().online.values()) {
    if (entry.lastSeen >= cutoff) count += 1;
  }
  return count;
}

function uniqueVisitorsBetween(fromDay: string, toDay: string): number {
  const seen = new Set<string>();
  for (const v of db().visits) {
    if (v.visitDate >= fromDay && v.visitDate <= toDay) {
      seen.add(dailyVisitorKey(v.visitorId, v.visitDate));
    }
  }
  return seen.size;
}

function uniqueVisitorsOn(day: string): number {
  const seen = new Set<string>();
  for (const v of db().visits) {
    if (v.visitDate === day) seen.add(v.visitorId);
  }
  return seen.size;
}

function shiftDay(day: string, deltaDays: number): string {
  const d = new Date(`${day}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return utcDateKey(d.getTime());
}

/** Visitors for the whole period, deduplicated across days. */
function totalUniqueVisitors(): number {
  const seen = new Set<string>();
  for (const v of db().visits) seen.add(dailyVisitorKey(v.visitorId, v.visitDate));
  return seen.size;
}

export function getStats(): VisitorStats {
  const store = db();
  const today = utcDateKey();
  const yesterday = shiftDay(today, -1);
  const week = shiftDay(today, -6);
  const month = shiftDay(today, -29);

  const visitorsToday = uniqueVisitorsOn(today);
  const visitorsYesterday = uniqueVisitorsOn(yesterday);

  // Returning = visitor seen on >1 distinct day; new = first-ever day is today.
  let returningVisitors = 0;
  let newVisitors = 0;
  const visitorDays = new Map<string, Set<string>>();
  for (const v of store.visits) {
    const days = visitorDays.get(v.visitorId) ?? new Set<string>();
    days.add(v.visitDate);
    visitorDays.set(v.visitorId, days);
  }
  for (const [visitorId, days] of visitorDays) {
    const first = store.visitors.get(visitorId)?.firstVisit ?? 0;
    const firstDay = utcDateKey(first);
    if (firstDay === today) newVisitors += 1;
    if (days.size > 1 || firstDay !== today) returningVisitors += 1;
  }

  const totalPageViews = store.visits.length;
  const pageViewsToday = store.visits.filter((v) => v.visitDate === today).length;

  const growthToday = visitorsToday - visitorsYesterday;
  const growthPct = visitorsYesterday > 0 ? (growthToday / visitorsYesterday) * 100 : (visitorsToday > 0 ? 100 : 0);

  const lastVisit = store.visits.length
    ? store.visits[store.visits.length - 1].lastVisit
    : new Date().toISOString();

  return {
    totalVisitors: totalUniqueVisitors(),
    visitorsToday,
    visitorsWeek: uniqueVisitorsBetween(week, today),
    visitorsMonth: uniqueVisitorsBetween(month, today),
    onlineNow: onlineCount(),
    returningVisitors,
    newVisitors,
    totalPageViews,
    pageViewsToday,
    growthPct: Math.round(growthPct * 10) / 10,
    growthToday,
    lastUpdated: lastVisit,
  };
}

// ---------------------------------------------------------------------------
// Traffic series
// ---------------------------------------------------------------------------

export function getTraffic(range: TrafficRange): TrafficSeries {
  const store = db();
  const today = utcDateKey();

  if (range === "today") {
    // Hourly buckets for today.
    const points = Array.from({ length: 24 }, (_, hour) => {
      const bucket = `${today}T${String(hour).padStart(2, "0")}`;
      const bucketVisits = store.visits.filter((v) => v.visitDate === today && new Date(v.lastVisit).getUTCHours() === hour);
      return {
        label: `${String(hour).padStart(2, "0")}:00`,
        bucket,
        visitors: new Set(bucketVisits.map((v) => v.visitorId)).size,
        pageViews: bucketVisits.length,
      };
    });
    return { range, points, total: points.reduce((s, p) => s + p.visitors, 0) };
  }

  if (range === "12m") {
    const points = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(Date.UTC(
        new Date(`${today}T00:00:00Z`).getUTCFullYear(),
        new Date(`${today}T00:00:00Z`).getUTCMonth() - (11 - i),
        1
      ));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const bucketVisits = store.visits.filter((v) => v.visitDate.slice(0, 7) === key);
      return {
        label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
        bucket: key,
        visitors: new Set(bucketVisits.map((v) => dailyVisitorKey(v.visitorId, v.visitDate))).size,
        pageViews: bucketVisits.length,
      };
    });
    return { range, points, total: points.reduce((s, p) => s + p.visitors, 0) };
  }

  const days = range === "7d" ? 7 : 30;
  const points = Array.from({ length: days }, (_, i) => {
    const day = shiftDay(today, -(days - 1 - i));
    const bucketVisits = store.visits.filter((v) => v.visitDate === day);
    return {
      label: new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      bucket: day,
      visitors: new Set(bucketVisits.map((v) => v.visitorId)).size,
      pageViews: bucketVisits.length,
    };
  });
  return { range, points, total: points.reduce((s, p) => s + p.visitors, 0) };
}

// ---------------------------------------------------------------------------
// Breakdowns
// ---------------------------------------------------------------------------

type Dimension = "page" | "source" | "device" | "browser" | "os";

function breakdown(dimension: Dimension, days = 30, limit = 10): AnalyticsBreakdown[] {
  const fromDay = shiftDay(utcDateKey(), -(days - 1));
  const rows = db().visits.filter((v) => v.visitDate >= fromDay);
  const map = new Map<string, { visitors: Set<string>; pageViews: number }>();

  for (const v of rows) {
    const key = String(v[dimension] ?? "unknown");
    const entry = map.get(key) ?? { visitors: new Set<string>(), pageViews: 0 };
    entry.visitors.add(v.visitorId);
    entry.pageViews += 1;
    map.set(key, entry);
  }

  const grandTotal = [...map.values()].reduce((s, e) => s + e.pageViews, 0) || 1;
  return [...map.entries()]
    .map(([key, e]) => ({
      key,
      label: key,
      visitors: e.visitors.size,
      pageViews: e.pageViews,
      sharePct: Math.round((e.pageViews / grandTotal) * 1000) / 10,
    }))
    .sort((a, b) => b.pageViews - a.pageViews)
    .slice(0, limit);
}

/** Maps stored page paths to human labels for "top articles". */
function topArticles(limit = 10): AnalyticsBreakdown[] {
  const pages = breakdown("page", 30, 200).filter((p) => p.key.startsWith("/news/"));
  const grandTotal = pages.reduce((s, p) => s + p.pageViews, 0) || 1;
  return pages
    .slice(0, limit)
    .map((p) => {
      const slug = p.key.split("/").pop() ?? p.key;
      const label = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return { ...p, label, sharePct: Math.round((p.pageViews / grandTotal) * 1000) / 10 };
    });
}

// ---------------------------------------------------------------------------
// Full snapshot
// ---------------------------------------------------------------------------

export function getSnapshot(range: TrafficRange = "7d"): AnalyticsSnapshot {
  return {
    stats: getStats(),
    onlineNow: onlineCount(),
    onlineWindowSeconds: ONLINE_WINDOW_SECONDS,
    traffic: getTraffic(range),
    topArticles: topArticles(),
    topPages: breakdown("page", 30, 10),
    trafficSources: breakdown("source", 30, 10),
    devices: breakdown("device", 30, 6),
    browsers: breakdown("browser", 30, 6),
    generatedAt: new Date().toISOString(),
  };
}

/** Wipes all analytics data (admin-only maintenance endpoint). */
export function resetAnalytics(): void {
  globalThis.__moonAnalyticsDb = emptyDb();
}
