"use client";

import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Globe,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react";
import type { VisitorActivity, VisitorFeed } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The admin's live visitor box.
 *
 * It answers "who is on Moon News right now?" using real recorded visits from
 * the analytics backend (`/api/admin/analytics/online`, polled every few
 * seconds by `useAnalytics`). A visit made by anyone on the public site shows up
 * here within one polling interval — nothing on this box is sample data.
 */
export function VisitorBox({
  feed,
  loading,
  onlineNow,
  onRefresh,
}: {
  feed: VisitorFeed | null;
  loading: boolean;
  onlineNow: number;
  /** Manual refresh; the box also polls on its own every few seconds. */
  onRefresh?: () => void;
}) {
  const visitorsToday = feed?.visitorsToday ?? 0;
  const pageViewsToday = feed?.pageViewsToday ?? 0;
  const newToday = feed?.newVisitorsToday ?? 0;
  const recent = feed?.recent ?? [];
  const online = feed ? onlineNow : 0;
  const viewsPerVisitor = visitorsToday > 0 ? (pageViewsToday / visitorsToday).toFixed(1) : "0.0";
  const countries = new Set(
    recent.map((v) => v.country).filter((c): c is string => Boolean(c))
  ).size;

  return (
    <section className="card mt-6 overflow-hidden" aria-label="Live visitors">
      {/* Header: what the admin sees at a glance, every day */}
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Visitors
          </h2>
          <p className="mt-0.5 text-sm text-[rgb(var(--text-muted))]">
            Live — updates automatically as people visit Moon News.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="btn-ghost h-9 w-9 rounded-lg !px-0"
              aria-label="Refresh visitors"
              title="Refresh now"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          )}
          <Link href="/admin/analytics" className="btn-outline text-sm">
            Full analytics <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Day counters */}
      <div className="grid grid-cols-2 divide-x divide-[rgb(var(--border))] border-b border-border sm:grid-cols-4">
        <Counter label="Online now" value={online} icon={<Wifi className="h-4 w-4" />} accent="#0d9488" live />
        <Counter label="Visitors today" value={visitorsToday} icon={<Users className="h-4 w-4" />} accent="#4c2fd0" />
        <Counter label="Page views today" value={pageViewsToday} icon={<Eye className="h-4 w-4" />} accent="#2563eb" />
        <Counter label="New today" value={newToday} icon={<UserPlus className="h-4 w-4" />} accent="#ca8a04" />
      </div>

      {/* Reading-depth strip: how much each visitor read, at a glance */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-border px-5 py-2.5 text-xs text-[rgb(var(--text-muted))]">
        <span>
          <strong className="font-semibold text-[rgb(var(--text))]">{viewsPerVisitor}</strong> views per visitor
        </span>
        <span>
          <strong className="font-semibold text-[rgb(var(--text))]">{newToday.toLocaleString("en-US")}</strong> new readers
        </span>
        <span className="inline-flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          {countries > 0
            ? `${countries} ${countries === 1 ? "country" : "countries"}`
            : "locations not shared"}
        </span>
        {feed && (
          <span className="ml-auto">
            updated {new Date(feed.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* Who has visited today */}
      <div className="flex items-center justify-between px-5 pb-1 pt-4">
        <h3 className="text-sm font-bold">Who visited today</h3>
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {recent.length > 0 ? `showing ${recent.length}` : ""}
        </span>
      </div>

      {recent.length === 0 ? (
        <div className="px-5 pb-6 pt-4 text-center">
          <p className="text-sm text-[rgb(var(--text-muted))]">
            {loading && !feed ? "Loading visitors…" : "No visitors recorded yet today."}
          </p>
          {!(loading && !feed) && (
            <p className="mx-auto mt-1 max-w-sm text-xs text-[rgb(var(--text-muted))]">
              When someone opens Moon News, their visit appears here automatically with the page
              they are viewing.
            </p>
          )}
        </div>
      ) : (
        <ul className="max-h-[420px] divide-y divide-[rgb(var(--border))] overflow-y-auto">
          {recent.map((v, i) => (
            <VisitorRow
              key={`${v.visitorId}-${v.lastVisit}`}
              visitor={v}
              index={i + 1}
              windowSeconds={feed?.windowSeconds ?? 120}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function Counter({
  label,
  value,
  icon,
  accent,
  live,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  live?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--text-muted))]">
        <span style={{ color: accent }}>{icon}</span>
        {label}
        {live && <span className="ml-auto rounded-full bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">LIVE</span>}
      </p>
      <p className="mt-1 font-serif text-2xl font-extrabold tabular-nums">{value.toLocaleString("en-US")}</p>
    </div>
  );
}

function VisitorRow({
  visitor,
  index,
  windowSeconds,
}: {
  visitor: VisitorActivity;
  index: number;
  windowSeconds: number;
}) {
  const where = [visitor.city, visitor.country].filter(Boolean).join(", ");
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      {/* Reader number — matches how the rows are counted in the heading */}
      <span className="w-5 shrink-0 text-right text-[11px] font-semibold tabular-nums text-[rgb(var(--text-muted))]">
        {index}
      </span>
      <DeviceIcon device={visitor.device} online={visitor.online} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-semibold">
          <span className="truncate">{visitor.page}</span>
          {visitor.isNew && (
            <span className="chip shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">new</span>
          )}
        </p>
        <p className="truncate text-xs text-[rgb(var(--text-muted))]">
          {visitor.browser} · {visitor.os}
          {where ? ` · ${where}` : ""} · from {visitor.source}
          {visitor.pageViews > 1 ? ` · ${visitor.pageViews} views` : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {visitor.online ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {relativeTime(visitor.lastVisit)}
          </span>
        ) : (
          <span className={cn("text-xs text-[rgb(var(--text-muted))]")}>{relativeTime(visitor.lastVisit)}</span>
        )}
        <p className="mt-0.5 text-[10px] text-[rgb(var(--text-muted))]">
          {visitor.online ? "on site now" : `left · online window ${windowSeconds / 60}m`}
        </p>
      </div>
    </li>
  );
}

function DeviceIcon({ device, online }: { device: VisitorActivity["device"]; online: boolean }) {
  const Icon = device === "mobile" ? Smartphone : device === "tablet" ? Tablet : Monitor;
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        online
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))]"
      )}
      aria-label={device}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

/** "just now" / "3m ago" — re-rendered each poll by the parent. */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
