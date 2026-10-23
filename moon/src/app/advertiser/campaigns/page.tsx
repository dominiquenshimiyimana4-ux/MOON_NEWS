"use client";

import Link from "next/link";
import { Megaphone, PlusCircle } from "lucide-react";
import { useAdvertiser } from "@/lib/advertiser/AdvertiserProvider";
import { placementLabels, adTypeLabels } from "@/lib/data/advertising";
import { formatCount, formatRWF, timeAgo } from "@/lib/utils";
import { PageHeader, StatCard, StatusPill } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

/** Full list of the advertiser's own campaigns, with review status. */
export default function AdvertiserCampaignsPage() {
  const { hydrated, account, myAds } = useAdvertiser();

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  if (!account) {
    return (
      <div>
        <PageHeader title="My Campaigns" subtitle="Register your business first." />
        <Link href="/advertiser" className="btn-primary">Go to dashboard</Link>
      </div>
    );
  }

  const pending = myAds.filter((a) => a.status === "pending").length;
  const active = myAds.filter((a) => a.status === "active").length;
  const impressions = myAds.reduce((s, a) => s + a.impressions, 0);

  return (
    <div>
      <PageHeader
        title="My Campaigns"
        subtitle={`${myAds.length} campaigns · ${active} live · ${pending} awaiting review`}
        action={
          <Link href="/advertiser/create" className="btn-primary">
            <PlusCircle className="h-4 w-4" /> New campaign
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Live" value={active} icon={<Megaphone className="h-5 w-5" />} accent="#16a34a" />
        <StatCard label="Awaiting review" value={pending} icon={<Megaphone className="h-5 w-5" />} accent="#ca8a04" />
        <StatCard label="Total campaigns" value={myAds.length} icon={<Megaphone className="h-5 w-5" />} accent="#4c2fd0" />
        <StatCard label="Impressions" value={formatCount(impressions)} icon={<Megaphone className="h-5 w-5" />} accent="#2563eb" />
      </div>

      {myAds.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-8 w-8" />}
          title="No campaigns yet"
          description="Create your first campaign to start advertising."
          action={
            <Link href="/advertiser/create" className="btn-primary">
              <PlusCircle className="h-4 w-4" /> Create campaign
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {myAds.map((ad) => (
            <div key={ad.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-base font-bold">
                      {ad.headline || ad.advertiser}
                    </h3>
                    <StatusPill status={ad.status} />
                  </div>
                  <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                    {placementLabels[ad.placement]} · {adTypeLabels[ad.type]} ·{" "}
                    {new Date(ad.startDate).toLocaleDateString()} –{" "}
                    {new Date(ad.endDate).toLocaleDateString()}
                  </p>
                  {ad.targetUrl && (
                    <a
                      href={ad.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block truncate text-xs text-brand-600 hover:underline"
                    >
                      {ad.targetUrl}
                    </a>
                  )}
                  {ad.status === "ended" && ad.reviewNote && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
                      Not approved: {ad.reviewNote}
                    </p>
                  )}
                  {ad.submittedAt && (
                    <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                      Submitted {timeAgo(ad.submittedAt, "en")}
                      {ad.reviewedBy ? ` · reviewed by ${ad.reviewedBy}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex gap-5 text-right text-sm">
                  <Metric label="Impr." value={formatCount(ad.impressions)} />
                  <Metric label="Clicks" value={formatCount(ad.clicks)} />
                  <Metric
                    label="CTR"
                    value={ad.impressions > 0 ? `${((ad.clicks / ad.impressions) * 100).toFixed(2)}%` : "—"}
                  />
                  <Metric label="Spent" value={formatRWF(ad.spent)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="block">
      <span className="block text-xs text-[rgb(var(--text-muted))]">{label}</span>
      <span className="block font-semibold">{value}</span>
    </span>
  );
}
