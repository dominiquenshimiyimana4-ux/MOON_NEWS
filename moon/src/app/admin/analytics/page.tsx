"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Eye,
  Globe,
  Monitor,
  RefreshCw,
  Smartphone,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react";
import type { AnalyticsBreakdown, TrafficRange } from "@/lib/types";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import { PageHeader, StatCard, ChartCard } from "@/components/admin/StatCard";
import { AreaChart, RankedBars } from "@/components/admin/Charts";
import { cn } from "@/lib/utils";

const RANGES: { key: TrafficRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "12m", label: "Last 12 months" },
];

export default function AdminAnalyticsPage() {
  const { snapshot, range, setRange, loading, error, onlineNow, refresh } = useAnalytics("7d");

  const stats = snapshot?.stats;

  // Traffic series -> chart data (visitors). Page views shown as a second line
  // label inside the same chart card.
  const chartData = useMemo(
    () => (snapshot?.traffic.points ?? []).map((p) => ({ label: p.label, value: p.visitors })),
    [snapshot]
  );

  const growthPositive = (stats?.growthPct ?? 0) >= 0;

  return (
    <div>
      <PageHeader
        title="Visitor Analytics"
        subtitle="Real traffic, straight from the analytics backend — refreshed live."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              {onlineNow.toLocaleString("en-US")} online now
            </span>
            <button type="button" onClick={refresh} className="btn-outline" disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {error}
        </div>
      )}

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total visitors"
          value={stats ? stats.totalVisitors.toLocaleString("en-US") : "—"}
          icon={<Users className="h-5 w-5" />}
          delta={stats ? `+${stats.growthToday.toLocaleString("en-US")} today` : undefined}
          accent="#4c2fd0"
        />
        <StatCard
          label="Visitors today"
          value={stats ? stats.visitorsToday.toLocaleString("en-US") : "—"}
          icon={<Activity className="h-5 w-5" />}
          accent="#16a34a"
        />
        <StatCard
          label="Online now"
          value={onlineNow.toLocaleString("en-US")}
          icon={<Wifi className="h-5 w-5" />}
          accent="#0d9488"
        />
        <StatCard
          label="Page views today"
          value={stats ? stats.pageViewsToday.toLocaleString("en-US") : "—"}
          icon={<Eye className="h-5 w-5" />}
          accent="#2563eb"
        />
      </div>

      {/* Secondary stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="This week"
          value={stats ? stats.visitorsWeek.toLocaleString("en-US") : "—"}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="#5f46e8"
        />
        <StatCard
          label="This month"
          value={stats ? stats.visitorsMonth.toLocaleString("en-US") : "—"}
          icon={<Globe className="h-5 w-5" />}
          accent="#7c3aed"
        />
        <StatCard
          label="Returning visitors"
          value={stats ? stats.returningVisitors.toLocaleString("en-US") : "—"}
          icon={<UserCheck className="h-5 w-5" />}
          accent="#0d9488"
        />
        <StatCard
          label="New visitors"
          value={stats ? stats.newVisitors.toLocaleString("en-US") : "—"}
          icon={<UserPlus className="h-5 w-5" />}
          accent="#ca8a04"
        />
      </div>

      {/* Growth + chart */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-4 font-serif text-base font-bold">Visitor growth</h3>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                growthPositive
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
              )}
            >
              {growthPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
            </span>
            <div>
              <p className="font-serif text-3xl font-extrabold">
                {stats ? `${growthPositive ? "+" : ""}${stats.growthPct}%` : "—"}
              </p>
              <p className="text-sm text-[rgb(var(--text-muted))]">vs. yesterday</p>
            </div>
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[rgb(var(--text-muted))]">Today</dt>
              <dd className="font-semibold">{stats?.visitorsToday.toLocaleString("en-US") ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[rgb(var(--text-muted))]">Yesterday</dt>
              <dd className="font-semibold">
                {stats ? Math.max(0, stats.visitorsToday - stats.growthToday).toLocaleString("en-US") : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[rgb(var(--text-muted))]">Total page views</dt>
              <dd className="font-semibold">{stats?.totalPageViews.toLocaleString("en-US") ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <ChartCard title="Visitor traffic" className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={cn(
                  "chip border transition-colors",
                  range === r.key
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          {loading && !snapshot ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-[rgb(var(--text-muted))]">
              Loading traffic…
            </div>
          ) : (
            <AreaChart data={chartData} />
          )}
          <p className="mt-3 text-xs text-[rgb(var(--text-muted))]">
            Unique visitors per {range === "today" ? "hour" : range === "12m" ? "month" : "day"}.
          </p>
        </ChartCard>
      </div>

      {/* Breakdown grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BreakdownCard
          title="Top articles"
          icon={<Eye className="h-4 w-4" />}
          rows={snapshot?.topArticles ?? []}
          color="#4c2fd0"
          unit="views"
          hrefFor={(row) => `/news/${row.key.replace(/^\/news\//, "")}`}
        />
        <BreakdownCard
          title="Top pages"
          icon={<Activity className="h-4 w-4" />}
          rows={snapshot?.topPages ?? []}
          color="#2563eb"
          unit="views"
        />
        <BreakdownCard
          title="Traffic sources"
          icon={<Globe className="h-4 w-4" />}
          rows={snapshot?.trafficSources ?? []}
          color="#16a34a"
          unit="views"
        />
        <BreakdownCard
          title="Devices"
          icon={deviceIcon(snapshot?.devices ?? [])}
          rows={snapshot?.devices ?? []}
          color="#db2777"
          unit="views"
        />
      </div>

      <p className="mt-6 text-xs text-[rgb(var(--text-muted))]">
        Privacy-first analytics: visitors are counted with a rotating, opaque identifier — no IP
        addresses or personal data are stored. Unique visitors are de-duplicated per day, so
        refreshing a page never inflates the numbers.
        {snapshot && (
          <>
            {" "}
            Last updated{" "}
            {new Date(snapshot.generatedAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            .
          </>
        )}
      </p>
    </div>
  );
}

function BreakdownCard({
  title,
  icon,
  rows,
  color,
  unit,
  hrefFor,
}: {
  title: string;
  icon: React.ReactNode;
  rows: AnalyticsBreakdown[];
  color: string;
  unit: string;
  hrefFor?: (row: AnalyticsBreakdown) => string;
}) {
  if (rows.length === 0) {
    return (
      <div className="card p-5">
        <BreakdownHeader title={title} icon={icon} />
        <p className="py-6 text-center text-sm text-[rgb(var(--text-muted))]">No data yet.</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <BreakdownHeader title={title} icon={icon} />
      {hrefFor ? (
        <LinkedBars rows={rows} color={color} unit={unit} hrefFor={hrefFor} />
      ) : (
        <RankedBars
          data={rows.map((r) => ({ label: r.label, value: r.pageViews }))}
          color={color}
          unit={unit}
        />
      )}
    </div>
  );
}

function BreakdownHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 font-serif text-base font-bold">
        <span className="text-[rgb(var(--text-muted))]">{icon}</span>
        {title}
      </h3>
      <span className="text-xs text-[rgb(var(--text-muted))]">last 30 days</span>
    </div>
  );
}

/** Ranked bars where each row links to the underlying page (used for articles). */
function LinkedBars({
  rows,
  color,
  unit,
  hrefFor,
}: {
  rows: AnalyticsBreakdown[];
  color: string;
  unit: string;
  hrefFor: (row: AnalyticsBreakdown) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.pageViews));
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key}>
          <Link href={hrefFor(row)} className="group block">
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate group-hover:text-brand-600">{row.label}</span>
              <span className="shrink-0 font-semibold tabular-nums">
                {row.pageViews.toLocaleString("en-US")}
                <span className="ml-1 font-normal text-[rgb(var(--text-muted))]">{unit}</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--bg-subtle))]">
              <div
                className="h-full rounded-full"
                style={{ width: `${(row.pageViews / max) * 100}%`, backgroundColor: color }}
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Picks an icon that hints at the dominant device class. */
function deviceIcon(rows: AnalyticsBreakdown[]): React.ReactNode {
  const top = [...rows].sort((a, b) => b.pageViews - a.pageViews)[0]?.key;
  if (top === "mobile") return <Smartphone className="h-4 w-4" />;
  if (top === "tablet") return <Monitor className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}
