"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useAdvertiser } from "@/lib/advertiser/AdvertiserProvider";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { placementLabels, adTypeLabels } from "@/lib/data/advertising";
import { formatRWF } from "@/lib/utils";
import { PageHeader } from "@/components/admin/StatCard";

const PLACEMENTS = ["homepage", "article", "sidebar", "newsletter", "category"] as const;
const AD_TYPES = ["banner", "video", "native"] as const;

/** Suggested daily reach by placement, used to show an indicative price. */
const PLACEMENT_RATE: Record<(typeof PLACEMENTS)[number], number> = {
  homepage: 150_000,
  article: 90_000,
  sidebar: 45_000,
  newsletter: 70_000,
  category: 60_000,
};

export default function CreateCampaignPage() {
  const router = useRouter();
  const { account, hydrated } = useAdvertiser();
  const { submitAdForReview } = useAdmin();

  const [form, setForm] = useState({
    headline: "",
    targetUrl: "",
    placement: "homepage" as (typeof PLACEMENTS)[number],
    type: "banner" as (typeof AD_TYPES)[number],
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    budget: 500_000,
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    if (!form.headline.trim()) return setError("Add a headline for your ad.");
    if (!/^https?:\/\//i.test(form.targetUrl.trim()))
      return setError("Enter a valid destination link starting with http(s)://");
    if (!form.budget || form.budget < 10_000)
      return setError("Budget must be at least 10,000 RWF.");
    setError("");

    submitAdForReview({
      advertiser: account.businessName,
      advertiserId: account.id,
      placement: form.placement,
      type: form.type,
      headline: form.headline.trim(),
      targetUrl: form.targetUrl.trim(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      budget: Number(form.budget),
    });
    setDone(true);
  }

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  if (!account) {
    return (
      <div>
        <PageHeader title="Create Campaign" subtitle="Register your business first." />
        <Link href="/advertiser" className="btn-primary">
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <PageHeader title="Campaign submitted" subtitle="Your campaign is now awaiting editorial review." />
        <div className="card max-w-xl p-6">
          <p className="text-sm text-[rgb(var(--text-muted))]">
            Our editors review every campaign before it goes live. You can track its status under
            <strong> My Campaigns</strong>.
          </p>
          <div className="mt-5 flex gap-2">
            <Link href="/advertiser/campaigns" className="btn-primary">
              View my campaigns
            </Link>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setDone(false);
                setForm((f) => ({ ...f, headline: "", targetUrl: "" }));
              }}
            >
              Create another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const estimatedImpressions = Math.round((Number(form.budget) || 0) / PLACEMENT_RATE[form.placement] * 10_000);

  return (
    <div>
      <PageHeader
        title="Create Campaign"
        subtitle="Design your ad, choose where it appears and how long it runs."
        action={
          <Link href="/advertiser" className="btn-outline">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-4 p-5 lg:col-span-2">
          <label>
            <span className="mb-1 block text-sm font-medium">Headline</span>
            <input
              className="input"
              value={form.headline}
              onChange={(e) => update("headline", e.target.value)}
              placeholder="e.g. Great coffee, roasted in Kigali."
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium">Destination link</span>
            <input
              className="input"
              value={form.targetUrl}
              onChange={(e) => update("targetUrl", e.target.value)}
              placeholder="https://yourbusiness.rw/promo"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-medium">Placement</span>
              <select
                className="input"
                value={form.placement}
                onChange={(e) => update("placement", e.target.value as (typeof PLACEMENTS)[number])}
              >
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>
                    {placementLabels[p]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium">Ad format</span>
              <select
                className="input"
                value={form.type}
                onChange={(e) => update("type", e.target.value as (typeof AD_TYPES)[number])}
              >
                {AD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {adTypeLabels[t]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium">Start date</span>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium">End date</span>
              <input
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </label>
          </div>

          <label>
            <span className="mb-1 block text-sm font-medium">Budget (RWF)</span>
            <input
              type="number"
              min={10_000}
              step={10_000}
              className="input"
              value={form.budget}
              onChange={(e) => update("budget", Number(e.target.value))}
            />
          </label>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="font-serif text-base font-bold">Campaign summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[rgb(var(--text-muted))]">Placement</dt>
                <dd className="font-semibold">{placementLabels[form.placement]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[rgb(var(--text-muted))]">Format</dt>
                <dd className="font-semibold">{adTypeLabels[form.type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[rgb(var(--text-muted))]">Duration</dt>
                <dd className="font-semibold">
                  {Math.max(
                    1,
                    Math.round(
                      (+new Date(form.endDate) - +new Date(form.startDate)) / 86400000
                    )
                  )}{" "}
                  days
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[rgb(var(--text-muted))]">Budget</dt>
                <dd className="font-semibold">{formatRWF(Number(form.budget) || 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[rgb(var(--text-muted))]">Est. impressions</dt>
                <dd className="font-semibold">{estimatedImpressions.toLocaleString("en-US")}</dd>
              </div>
            </dl>
            <button type="submit" className="btn-primary mt-5 w-full">
              <Send className="h-4 w-4" /> Submit for review
            </button>
            <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">
              Editors approve campaigns before they go live.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
