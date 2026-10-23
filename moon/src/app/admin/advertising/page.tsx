"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  MousePointerClick,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Target,
  Trash2,
  Wallet,
} from "lucide-react";
import type { Advertisement, MonetizationStatus } from "@/lib/types";
import { useAdmin, type AdDraft } from "@/lib/admin/AdminProvider";
import {
  adRevenueTrend,
  adTypeLabels,
  placementLabels,
} from "@/lib/data/advertising";
import { formatCount, formatRWF } from "@/lib/utils";
import { PageHeader, StatCard, ChartCard } from "@/components/admin/StatCard";
import { AreaChart, BarChart, DonutChart } from "@/components/admin/Charts";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";

const PLACEMENTS: Advertisement["placement"][] = [
  "homepage",
  "article",
  "sidebar",
  "newsletter",
  "category",
];
const AD_TYPES: Advertisement["type"][] = ["banner", "video", "native"];
const STATUSES: MonetizationStatus[] = ["active", "paused", "scheduled", "draft", "ended", "pending"];

const statusChip: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  scheduled: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  ended: "bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))]",
  pending: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
};

const placementColors: Record<Advertisement["placement"], string> = {
  homepage: "#4c2fd0",
  article: "#5f46e8",
  sidebar: "#0d9488",
  newsletter: "#ca8a04",
  category: "#db2777",
};

function ctr(ad: Advertisement): number {
  return ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
}

export default function AdvertiserDashboardPage() {
  const { ads, hydrated, createAd, updateAd, deleteAd, setAdStatus } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MonetizationStatus | "all">("all");
  const [editing, setEditing] = useState<Advertisement | "new" | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ads.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (query && !a.advertiser.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [ads, query, status]);

  const totals = useMemo(() => {
    const active = ads.filter((a) => a.status === "active").length;
    const budget = ads.reduce((s, a) => s + a.budget, 0);
    const spent = ads.reduce((s, a) => s + a.spent, 0);
    const impressions = ads.reduce((s, a) => s + a.impressions, 0);
    const clicks = ads.reduce((s, a) => s + a.clicks, 0);
    return {
      active,
      budget,
      spent,
      remaining: Math.max(0, budget - spent),
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  }, [ads]);

  const byPlacement = useMemo(() => {
    const counts = PLACEMENTS.map((p) => ({
      label: placementLabels[p],
      value: ads.filter((a) => a.placement === p).length,
      color: placementColors[p],
    })).filter((d) => d.value > 0);
    return counts.length > 0 ? counts : [{ label: "No campaigns", value: 1, color: "#cbd5e1" }];
  }, [ads]);

  const spendByCampaign = useMemo(
    () =>
      ads
        .slice()
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 6)
        .map((a) => ({ label: a.advertiser.split(" ")[0], value: a.spent })),
    [ads]
  );

  const revenueTrend = useMemo(
    () => adRevenueTrend.map((r) => ({ label: r.month, value: r.advertising })),
    []
  );

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading dashboard…</div>;

  return (
    <div>
      <PageHeader
        title="Advertiser Dashboard"
        subtitle="Track campaign delivery, spend and performance across placements."
        action={
          <button type="button" onClick={() => setEditing("new")} className="btn-primary">
            <Plus className="h-4 w-4" /> New campaign
          </button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active campaigns" value={totals.active} icon={<Target className="h-5 w-5" />} accent="#16a34a" />
        <StatCard label="Total budget" value={formatRWF(totals.budget)} icon={<Wallet className="h-5 w-5" />} accent="#4c2fd0" />
        <StatCard label="Spent" value={formatRWF(totals.spent)} icon={<Wallet className="h-5 w-5" />} delta={`${formatRWF(totals.remaining)} remaining`} accent="#ca8a04" />
        <StatCard label="Impressions" value={formatCount(totals.impressions)} icon={<Eye className="h-5 w-5" />} accent="#2563eb" />
        <StatCard label="Clicks" value={formatCount(totals.clicks)} icon={<MousePointerClick className="h-5 w-5" />} accent="#5f46e8" />
        <StatCard label="Avg. CTR" value={`${totals.ctr.toFixed(2)}%`} icon={<MousePointerClick className="h-5 w-5" />} accent="#db2777" />
        <StatCard label="Campaigns" value={ads.length} icon={<CalendarDays className="h-5 w-5" />} accent="#0d9488" />
        <StatCard label="Placements used" value={new Set(ads.map((a) => a.placement)).size} icon={<Target className="h-5 w-5" />} accent="#9333ea" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Ad revenue per month">
          <AreaChart data={revenueTrend} />
        </ChartCard>
        <ChartCard title="Spend by campaign (RWF)">
          {spendByCampaign.length > 0 ? (
            <BarChart data={spendByCampaign} color="#5f46e8" />
          ) : (
            <p className="text-sm text-[rgb(var(--text-muted))]">No campaigns yet.</p>
          )}
        </ChartCard>
        <ChartCard title="Campaigns by placement">
          <DonutChart data={byPlacement} />
        </ChartCard>
        <ChartCard title="Budget vs spend (RWF)">
          <BarChart
            data={[
              { label: "Budget", value: totals.budget },
              { label: "Spent", value: totals.spent },
              { label: "Remaining", value: totals.remaining },
            ]}
            color="#ca8a04"
          />
        </ChartCard>
      </div>

      {/* Filters */}
      <div className="mb-5 mt-6 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search advertisers…"
            className="input !pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as MonetizationStatus | "all")} className="input">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Campaign table */}
      {filtered.length === 0 ? (
        <EmptyState title="No campaigns found" description="Try adjusting your filters or create a new campaign." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                <th className="px-4 py-3 font-semibold">Advertiser</th>
                <th className="px-4 py-3 font-semibold">Placement</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Schedule</th>
                <th className="px-4 py-3 text-right font-semibold">Budget</th>
                <th className="px-4 py-3 text-right font-semibold">Spent</th>
                <th className="px-4 py-3 text-right font-semibold">Impr.</th>
                <th className="px-4 py-3 text-right font-semibold">CTR</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {filtered.map((ad) => (
                <tr key={ad.id} className="hover:bg-[rgb(var(--bg-subtle))]">
                  <td className="px-4 py-3 font-medium">{ad.advertiser}</td>
                  <td className="px-4 py-3">
                    <span className="chip border-border">{placementLabels[ad.placement]}</span>
                  </td>
                  <td className="px-4 py-3 text-[rgb(var(--text-muted))]">{adTypeLabels[ad.type]}</td>
                  <td className="px-4 py-3 text-xs text-[rgb(var(--text-muted))]">
                    {new Date(ad.startDate).toLocaleDateString()} – {new Date(ad.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">{formatRWF(ad.budget)}</td>
                  <td className="px-4 py-3 text-right">{formatRWF(ad.spent)}</td>
                  <td className="px-4 py-3 text-right">{formatCount(ad.impressions)}</td>
                  <td className="px-4 py-3 text-right">{ctr(ad).toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <span className={`chip shrink-0 capitalize ${statusChip[ad.status] ?? statusChip.draft}`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {ad.status === "active" ? (
                        <IconBtn label="Pause" onClick={() => setAdStatus(ad.id, "paused")}>
                          <Pause className="h-4 w-4" />
                        </IconBtn>
                      ) : (
                        <IconBtn label="Activate" onClick={() => setAdStatus(ad.id, "active")}>
                          <Play className="h-4 w-4" />
                        </IconBtn>
                      )}
                      <IconBtn label="Edit" onClick={() => setEditing(ad)}>
                        <Pencil className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn label="Delete" danger onClick={() => setConfirmId(ad.id)}>
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <AdFormModal
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            if (editing === "new") createAd(draft);
            else updateAd(editing.id, draft);
            setEditing(null);
          }}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete campaign?"
          message="This will permanently remove the campaign and its performance history."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            deleteAd(confirmId);
            setConfirmId(null);
          }}
        />
      )}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`btn-ghost h-8 w-8 rounded-lg !px-0 ${danger ? "text-red-600" : ""}`}
    >
      {children}
    </button>
  );
}

function AdFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Advertisement;
  onClose: () => void;
  onSave: (draft: AdDraft) => void;
}) {
  const [form, setForm] = useState({
    advertiser: initial?.advertiser ?? "",
    placement: initial?.placement ?? ("homepage" as Advertisement["placement"]),
    type: initial?.type ?? ("banner" as Advertisement["type"]),
    startDate: (initial?.startDate ?? new Date().toISOString()).slice(0, 10),
    endDate: (initial?.endDate ?? new Date().toISOString()).slice(0, 10),
    budget: initial?.budget ?? 0,
    spent: initial?.spent ?? 0,
    status: initial?.status ?? ("draft" as MonetizationStatus),
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.advertiser.trim()) return;
    onSave({
      advertiser: form.advertiser.trim(),
      placement: form.placement,
      type: form.type,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      budget: Number(form.budget) || 0,
      spent: Number(form.spent) || 0,
      status: form.status,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <form onSubmit={submit} className="card relative w-full max-w-lg p-6">
        <h3 className="font-serif text-lg font-bold">
          {initial ? "Edit campaign" : "New campaign"}
        </h3>
        <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
          Configure the advertiser, placement and budget for this campaign.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Advertiser</span>
            <input
              value={form.advertiser}
              onChange={(e) => update("advertiser", e.target.value)}
              placeholder="e.g. Bank of Kigali"
              className="input"
              required
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium">Placement</span>
            <select
              value={form.placement}
              onChange={(e) => update("placement", e.target.value as Advertisement["placement"])}
              className="input"
            >
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>{placementLabels[p]}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium">Type</span>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value as Advertisement["type"])}
              className="input"
            >
              {AD_TYPES.map((t) => (
                <option key={t} value={t}>{adTypeLabels[t]}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium">Start date</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="input"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium">End date</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="input"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium">Budget (RWF)</span>
            <input
              type="number"
              min={0}
              value={form.budget}
              onChange={(e) => update("budget", Number(e.target.value))}
              className="input"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium">Spent (RWF)</span>
            <input
              type="number"
              min={0}
              value={form.spent}
              onChange={(e) => update("spent", Number(e.target.value))}
              className="input"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Status</span>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value as MonetizationStatus)}
              className="input capitalize"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button type="submit" className="btn-primary">{initial ? "Save changes" : "Create campaign"}</button>
        </div>
      </form>
    </div>
  );
}
