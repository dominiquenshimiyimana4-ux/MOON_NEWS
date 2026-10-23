"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Megaphone,
  MousePointerClick,
  PlusCircle,
  Target,
  Wallet,
} from "lucide-react";
import { useAdvertiser } from "@/lib/advertiser/AdvertiserProvider";
import { placementLabels } from "@/lib/data/advertising";
import { formatCount, formatRWF } from "@/lib/utils";
import { PageHeader, StatCard, ChartCard } from "@/components/admin/StatCard";
import { BarChart } from "@/components/admin/Charts";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/admin/StatCard";
import { BusinessRegistration } from "@/components/advertiser/BusinessRegistration";

/**
 * Advertiser Dashboard.
 *
 * The signed-in advertiser registers their business (once), creates campaigns
 * that are submitted for editorial review, and tracks the performance of their
 * own campaigns only — impressions, clicks, CTR, spend and remaining budget.
 */
export default function AdvertiserDashboardPage() {
  const { hydrated, account, myAds, myPayments } = useAdvertiser();

  const totals = useMemo(() => {
    const active = myAds.filter((a) => a.status === "active").length;
    const pending = myAds.filter((a) => a.status === "pending").length;
    const budget = myAds.reduce((s, a) => s + a.budget, 0);
    const spent = myAds.reduce((s, a) => s + a.spent, 0);
    const impressions = myAds.reduce((s, a) => s + a.impressions, 0);
    const clicks = myAds.reduce((s, a) => s + a.clicks, 0);
    return {
      active,
      pending,
      budget,
      spent,
      remaining: Math.max(0, budget - spent),
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  }, [myAds]);

  const paidTotal = myPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const dueTotal = myPayments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const performanceByCampaign = useMemo(
    () =>
      myAds.slice(0, 6).map((a) => ({
        label: a.headline?.slice(0, 12) || a.advertiser.split(" ")[0],
        value: a.clicks,
      })),
    [myAds]
  );

  if (!hydrated) {
    return <div className="text-sm text-[rgb(var(--text-muted))]">Loading your dashboard…</div>;
  }

  // First-run: no business account yet — register before anything else.
  if (!account) {
    return (
      <div>
        <PageHeader
          title="Advertiser Dashboard"
          subtitle="Register your business to start advertising on Moon News."
        />
        <BusinessRegistration />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={account.businessName}
        subtitle="Create campaigns, track performance and manage payments."
        action={
          <Link href="/advertiser/create" className="btn-primary">
            <PlusCircle className="h-4 w-4" /> New campaign
          </Link>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active campaigns" value={totals.active} icon={<Target className="h-5 w-5" />} accent="#16a34a" />
        <StatCard
          label="Awaiting approval"
          value={totals.pending}
          icon={<Megaphone className="h-5 w-5" />}
          accent="#ca8a04"
        />
        <StatCard label="Impressions" value={formatCount(totals.impressions)} icon={<Eye className="h-5 w-5" />} accent="#2563eb" />
        <StatCard label="Clicks" value={formatCount(totals.clicks)} icon={<MousePointerClick className="h-5 w-5" />} accent="#5f46e8" />
        <StatCard label="Avg. CTR" value={`${totals.ctr.toFixed(2)}%`} icon={<MousePointerClick className="h-5 w-5" />} accent="#db2777" />
        <StatCard label="Total budget" value={formatRWF(totals.budget)} icon={<Wallet className="h-5 w-5" />} accent="#4c2fd0" />
        <StatCard label="Spent" value={formatRWF(totals.spent)} icon={<Wallet className="h-5 w-5" />} delta={`${formatRWF(totals.remaining)} left`} accent="#0d9488" />
        <StatCard label="Campaigns" value={myAds.length} icon={<Megaphone className="h-5 w-5" />} accent="#9333ea" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Clicks by campaign">
          {performanceByCampaign.length > 0 ? (
            <BarChart data={performanceByCampaign} color="#5f46e8" />
          ) : (
            <p className="text-sm text-[rgb(var(--text-muted))]">Create a campaign to see performance.</p>
          )}
        </ChartCard>
        <ChartCard title="Billing summary">
          <div className="space-y-3 text-sm">
            <Row label="Paid to date" value={formatRWF(paidTotal)} accent="#16a34a" />
            <Row label="Pending payment" value={formatRWF(dueTotal)} accent="#ca8a04" />
            <Row label="Total budget committed" value={formatRWF(totals.budget)} accent="#4c2fd0" />
            <Link href="/advertiser/payments" className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-brand-600 hover:underline">
              View payment history <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </ChartCard>
      </div>

      {/* My campaigns */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">My campaigns</h2>
          <Link href="/advertiser/campaigns" className="text-sm font-semibold text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {myAds.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="h-8 w-8" />}
            title="No campaigns yet"
            description="Create your first campaign — it will be reviewed by our editors before it goes live."
            action={
              <Link href="/advertiser/create" className="btn-primary">
                <PlusCircle className="h-4 w-4" /> Create campaign
              </Link>
            }
          />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                  <th className="px-4 py-3 font-semibold">Campaign</th>
                  <th className="px-4 py-3 font-semibold">Placement</th>
                  <th className="px-4 py-3 text-right font-semibold">Impr.</th>
                  <th className="px-4 py-3 text-right font-semibold">Clicks</th>
                  <th className="px-4 py-3 text-right font-semibold">CTR</th>
                  <th className="px-4 py-3 text-right font-semibold">Spent</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {myAds.slice(0, 8).map((ad) => (
                  <tr key={ad.id} className="hover:bg-[rgb(var(--bg-subtle))]">
                    <td className="px-4 py-3 font-medium">{ad.headline || ad.advertiser}</td>
                    <td className="px-4 py-3">
                      <span className="chip border-border">{placementLabels[ad.placement]}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCount(ad.impressions)}</td>
                    <td className="px-4 py-3 text-right">{formatCount(ad.clicks)}</td>
                    <td className="px-4 py-3 text-right">
                      {ad.impressions > 0 ? `${((ad.clicks / ad.impressions) * 100).toFixed(2)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">{formatRWF(ad.spent)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={ad.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-[rgb(var(--text-muted))]">
        Campaigns are stored locally for the demo. Connect your API to persist them.
      </p>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[rgb(var(--text-muted))]">{label}</span>
      <span className="font-semibold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}
