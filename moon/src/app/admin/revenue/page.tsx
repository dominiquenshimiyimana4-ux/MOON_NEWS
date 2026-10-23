"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Check,
  Clock,
  Eye,
  Megaphone,
  MousePointerClick,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { AdPayment } from "@/lib/types";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { adRevenueTrend, placementLabels } from "@/lib/data/advertising";
import { formatCount, formatRWF, timeAgo } from "@/lib/utils";
import { PageHeader, StatCard, ChartCard, StatusPill } from "@/components/admin/StatCard";
import { AreaChart, BarChart, DonutChart } from "@/components/admin/Charts";
import { EmptyState } from "@/components/EmptyState";

/**
 * Super Admin — advertising revenue.
 *
 * The platform-wide view: every campaign, all advertising revenue, payments
 * received vs. still pending, and total delivery (impressions and clicks) with
 * performance broken down by advertiser.
 */
export default function AdRevenuePage() {
  const { ads, payments, advertisers, hydrated, setPaymentStatus } = useAdmin();
  const [statusFilter, setStatusFilter] = useState<AdPayment["status"] | "all">("all");

  const money = useMemo(() => {
    const received = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const pending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
    const failed = payments.filter((p) => p.status === "failed").reduce((s, p) => s + p.amount, 0);
    const committed = ads.reduce((s, a) => s + a.budget, 0);
    return { received, pending, failed, committed, outstanding: Math.max(0, committed - received) };
  }, [payments, ads]);

  const delivery = useMemo(() => {
    const impressions = ads.reduce((s, a) => s + a.impressions, 0);
    const clicks = ads.reduce((s, a) => s + a.clicks, 0);
    return {
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  }, [ads]);

  const revenueTrend = useMemo(
    () => adRevenueTrend.map((r) => ({ label: r.month, value: r.advertising })),
    []
  );

  const performanceByAdvertiser = useMemo(() => {
    const map = new Map<string, { clicks: number; impressions: number }>();
    for (const a of ads) {
      const key = a.advertiser;
      const cur = map.get(key) ?? { clicks: 0, impressions: 0 };
      cur.clicks += a.clicks;
      cur.impressions += a.impressions;
      map.set(key, cur);
    }
    return [...map.entries()]
      .map(([label, v]) => ({ label: label.split(" ")[0], value: v.clicks }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [ads]);

  const byPlacement = useMemo(
    () =>
      (["homepage", "article", "sidebar", "newsletter", "category"] as const)
        .map((p) => ({
          label: placementLabels[p],
          value: ads.filter((a) => a.placement === p).reduce((s, a) => s + a.clicks, 0),
        }))
        .filter((d) => d.value > 0),
    [ads]
  );

  const filteredPayments = useMemo(
    () =>
      statusFilter === "all" ? payments : payments.filter((p) => p.status === statusFilter),
    [payments, statusFilter]
  );

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading revenue data…</div>;

  return (
    <div>
      <PageHeader
        title="Advertising Revenue"
        subtitle="Platform-wide revenue, payments and ad performance."
      />

      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue received" value={formatRWF(money.received)} icon={<Banknote className="h-5 w-5" />} accent="#16a34a" />
        <StatCard label="Pending payments" value={formatRWF(money.pending)} icon={<Clock className="h-5 w-5" />} accent="#ca8a04" />
        <StatCard label="Outstanding" value={formatRWF(money.outstanding)} icon={<Wallet className="h-5 w-5" />} accent="#dc2626" />
        <StatCard label="Total committed" value={formatRWF(money.committed)} icon={<Wallet className="h-5 w-5" />} accent="#4c2fd0" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Advertisers" value={advertisers.length} icon={<Megaphone className="h-5 w-5" />} accent="#9333ea" />
        <StatCard label="Campaigns" value={ads.length} icon={<Megaphone className="h-5 w-5" />} accent="#0d9488" />
        <StatCard label="Impressions" value={formatCount(delivery.impressions)} icon={<Eye className="h-5 w-5" />} accent="#2563eb" />
        <StatCard label="Clicks" value={formatCount(delivery.clicks)} icon={<MousePointerClick className="h-5 w-5" />} accent="#5f46e8" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Advertising revenue per month (RWF)">
          <AreaChart data={revenueTrend} color="#16a34a" />
        </ChartCard>
        <ChartCard title="Clicks by advertiser">
          {performanceByAdvertiser.length > 0 ? (
            <BarChart data={performanceByAdvertiser} color="#5f46e8" />
          ) : (
            <p className="text-sm text-[rgb(var(--text-muted))]">No delivery yet.</p>
          )}
        </ChartCard>
        <ChartCard title="Clicks by placement">
          {byPlacement.length > 0 ? (
            <DonutChart
              data={byPlacement.map((d, i) => ({
                ...d,
                color: ["#4c2fd0", "#5f46e8", "#0d9488", "#ca8a04", "#db2777"][i % 5],
              }))}
            />
          ) : (
            <p className="text-sm text-[rgb(var(--text-muted))]">No delivery yet.</p>
          )}
        </ChartCard>
        <ChartCard title="Payment collection">
          <BarChart
            data={[
              { label: "Received", value: money.received },
              { label: "Pending", value: money.pending },
              { label: "Failed", value: money.failed },
            ]}
            color="#16a34a"
          />
        </ChartCard>
      </div>

      {/* Payments table */}
      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-bold">Payments</h2>
          <div className="flex gap-2">
            {(["all", "paid", "pending", "failed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`chip border capitalize transition-colors ${statusFilter === s
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <EmptyState icon={<Wallet className="h-8 w-8" />} title="No payments" description="Payments from advertisers will appear here." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                  <th className="px-4 py-3 font-semibold">Advertiser</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[rgb(var(--bg-subtle))]">
                    <td className="px-4 py-3 font-medium">{p.advertiser}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))]">{p.reference}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))]">{p.method.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-right">{formatRWF(p.amount)}</td>
                    <td className="px-4 py-3 text-xs text-[rgb(var(--text-muted))]">{timeAgo(p.createdAt, "en")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`chip shrink-0 capitalize ${p.status === "paid"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : p.status === "pending"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                              : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                          }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status !== "paid" && (
                        <button
                          type="button"
                          onClick={() => setPaymentStatus(p.id, "paid")}
                          className="btn-ghost !px-2 text-xs text-emerald-600"
                        >
                          <Check className="h-3.5 w-3.5" /> Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign performance table */}
      <div className="mt-8">
        <h2 className="mb-3 font-serif text-lg font-bold">Campaign performance</h2>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                <th className="px-4 py-3 font-semibold">Advertiser</th>
                <th className="px-4 py-3 font-semibold">Placement</th>
                <th className="px-4 py-3 text-right font-semibold">Views</th>
                <th className="px-4 py-3 text-right font-semibold">Clicks</th>
                <th className="px-4 py-3 text-right font-semibold">CTR</th>
                <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {ads.map((a) => (
                <tr key={a.id} className="hover:bg-[rgb(var(--bg-subtle))]">
                  <td className="px-4 py-3 font-medium">{a.advertiser}</td>
                  <td className="px-4 py-3">
                    <span className="chip border-border">{placementLabels[a.placement]}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatCount(a.impressions)}</td>
                  <td className="px-4 py-3 text-right">{formatCount(a.clicks)}</td>
                  <td className="px-4 py-3 text-right">
                    {a.impressions > 0 ? `${((a.clicks / a.impressions) * 100).toFixed(2)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">{formatRWF(a.spent)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-[rgb(var(--text-muted))]">
        <TrendingUp className="h-3.5 w-3.5" />
        Revenue and payment data are stored locally for the demo. Connect your API to reconcile real payments.
      </p>
    </div>
  );
}
