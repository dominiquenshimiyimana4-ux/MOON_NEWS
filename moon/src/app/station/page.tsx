"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Clock, CreditCard, Loader2, Radio, Settings, Tv } from "lucide-react";
import { useChannelDashboard } from "@/lib/hooks/useChannelDashboard";
import { channelService } from "@/lib/services/channelService";
import { ChannelForm, type ChannelFormValues } from "@/components/station/ChannelForm";
import { PageHeader, StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { formatRWF } from "@/lib/utils";

function statusChip(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
    case "pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
    default:
      return "bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))]";
  }
}

/**
 * Station dashboard: registration (if no channel yet), review status,
 * subscription summary and quick links.
 */
export default function StationDashboardPage() {
  const { loading, error, channel, payments, plans, refresh } = useChannelDashboard();
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave(values: ChannelFormValues) {
    setSaveError("");
    await channelService.saveChannel(values);
    setEditing(false);
    await refresh();
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription? Your channel stays listed until the period ends.")) return;
    try {
      await channelService.cancelSubscription();
      await refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not cancel the subscription.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your channel…
      </div>
    );
  }

  if (error && !channel) {
    return (
      <div>
        <PageHeader title="Station Dashboard" subtitle="Radio & television channels on Moon News." />
        <div className="card border-red-300 p-6 text-sm text-red-700 dark:border-red-500/30 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  // First run — no channel registered yet.
  if (!channel) {
    return (
      <div>
        <PageHeader
          title="Station Dashboard"
          subtitle="Put your radio or television station on Moon News."
        />
        <ChannelForm onSubmit={handleSave} submitLabel="Submit channel for review" />
      </div>
    );
  }

  const confirmed = payments.filter((p) => p.status === "confirmed");
  const paidTotal = confirmed.reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "pending");

  return (
    <div>
      <PageHeader
        title={channel.stationName}
        subtitle={`${channel.type === "radio" ? "📻 Radio" : "📺 Television"} station · ${channel.location}`}
        action={
          <Link href="/station/channel" className="btn-outline">
            <Settings className="h-4 w-4" /> Edit channel
          </Link>
        }
      />

      {/* Status banner */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-[rgb(var(--surface))] p-4">
        <span className={`chip capitalize ${statusChip(channel.status)}`}>{channel.status}</span>
        <span className={`chip capitalize ${statusChip(channel.subscription.status)}`}>
          subscription: {channel.subscription.status.replace("_", " ")}
        </span>
        {channel.status === "pending" && (
          <p className="text-sm text-[rgb(var(--text-muted))]">
            ⏳ An administrator is reviewing your channel. You can pick a plan once it's approved.
          </p>
        )}
        {channel.status === "rejected" && (
          <p className="text-sm text-red-600 dark:text-red-300">
            <AlertTriangle className="mr-1 inline h-4 w-4" />
            {channel.reviewNote || "Your channel was not approved."} Update your details to resubmit.
          </p>
        )}
        {channel.status === "approved" && channel.subscription.status === "none" && (
          <p className="text-sm text-[rgb(var(--text-muted))]">
            ✅ Approved! Choose a plan on{" "}
            <Link href="/station/plans" className="font-semibold text-brand-600 hover:underline">
              Plans & Billing
            </Link>{" "}
            to go live.
          </p>
        )}
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {saveError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Channel status"
          value={<span className="capitalize">{channel.status}</span>}
          icon={channel.type === "radio" ? <Radio className="h-5 w-5" /> : <Tv className="h-5 w-5" />}
          accent="#4c2fd0"
        />
        <StatCard
          label="Subscription"
          value={<span className="capitalize">{channel.subscription.status.replace("_", " ")}</span>}
          icon={<CreditCard className="h-5 w-5" />}
          accent="#16a34a"
          delta={channel.subscription.planName ?? undefined}
        />
        <StatCard
          label="Paid to date"
          value={formatRWF(paidTotal)}
          icon={<CreditCard className="h-5 w-5" />}
          accent="#0d9488"
        />
        <StatCard
          label="Pending payments"
          value={pending.length}
          icon={<Clock className="h-5 w-5" />}
          accent="#ca8a04"
        />
      </div>

      {/* Channel preview + review note */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-serif text-base font-bold">Your channel preview</h3>
          <div className="flex items-start gap-3">
            {channel.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={channel.logo} alt={channel.stationName} className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-2xl dark:bg-brand-500/10">
                {channel.type === "radio" ? "📻" : "📺"}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-semibold">{channel.stationName}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{channel.location}</p>
              <p className="mt-1 line-clamp-3 text-sm text-[rgb(var(--text-muted))]">{channel.description}</p>
              <a
                href={channel.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block truncate text-xs font-semibold text-brand-600 hover:underline"
              >
                {channel.streamUrl}
              </a>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-serif text-base font-bold">Recent payments</h3>
          {payments.length === 0 ? (
            <EmptyState icon={<CreditCard className="h-8 w-8" />} title="No payments yet" description="Subscribe to a plan to activate your channel." />
          ) : (
            <ul className="divide-y divide-[rgb(var(--border))]">
              {payments.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <span>
                    <span className="font-medium">{p.planName}</span>
                    <span className="block text-xs text-[rgb(var(--text-muted))]">{p.providerRef}</span>
                  </span>
                  <span className="text-right">
                    <span className="block">{formatRWF(p.amount)}</span>
                    <span className={`chip ${statusChip(p.status)}`}>{p.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/station/payments" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">
            Full payment history →
          </Link>
        </div>
      </div>

      {/* Inline editing when rejected or on request */}
      {(editing || channel.status === "rejected") && (
        <div className="mt-6">
          <ChannelForm initial={channel} onSubmit={handleSave} submitLabel="Save & resubmit for review" />
        </div>
      )}

      {/* Cancel subscription */}
      {channel.subscription.status === "active" && (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h3 className="font-serif text-base font-bold">Manage subscription</h3>
            <p className="text-sm text-[rgb(var(--text-muted))]">
              {channel.subscription.planName} · {channel.subscription.billingPeriod}
              {channel.subscription.renewsAt
                ? ` · renews ${new Date(channel.subscription.renewsAt).toLocaleDateString()}`
                : ""}
            </p>
          </div>
          <button type="button" className="btn-outline text-red-600" onClick={handleCancel}>
            Cancel subscription
          </button>
        </div>
      )}

      {plans.length > 0 && channel.status === "approved" && channel.subscription.status !== "active" && (
        <div className="mt-6 text-center">
          <Link href="/station/plans" className="btn-primary">
            <CreditCard className="h-4 w-4" /> Choose a plan to go live
          </Link>
        </div>
      )}
    </div>
  );
}
