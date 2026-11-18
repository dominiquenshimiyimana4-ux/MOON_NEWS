"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Radio, ShieldAlert, Tv, X } from "lucide-react";
import type { Channel } from "@/lib/types";
import { api } from "@/lib/services/api";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

function chip(status: Channel["status"]) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  }
}

/**
 * Administrator channel review queue: approve or reject station submissions.
 * A note is required when rejecting so the station knows what to fix.
 */
export default function AdminChannelsPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Channel | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setChannels(await api.get<Channel[]>("/api/channels/admin/all"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the review queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(channel: Channel, decision: "approved" | "rejected", reviewNote?: string) {
    setBusyId(channel.id);
    setError("");
    try {
      await api.patch(`/api/channels/${channel.id}/review`, { decision, note: reviewNote });
      setRejecting(null);
      setNote("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review action failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="mb-4 h-10 w-10 text-red-600" />
        <h1 className="font-serif text-xl font-bold">Administrator access required</h1>
        <Link href="/login" className="btn-primary mt-4">Go to login</Link>
      </div>
    );
  }

  const pending = channels.filter((c) => c.status === "pending");
  const decided = channels.filter((c) => c.status !== "pending");

  return (
    <div>
      <PageHeader
        title="Channel Review"
        subtitle="Approve radio and television stations before they can subscribe and go live."
        action={
          <button type="button" className="btn-outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Refresh
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <h2 className="mb-3 font-serif text-lg font-bold">
        Pending review {pending.length > 0 && <span className="text-sm font-medium text-[rgb(var(--text-muted))]">({pending.length})</span>}
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading channels…
        </div>
      ) : pending.length === 0 ? (
        <EmptyState icon={<Radio className="h-8 w-8" />} title="Queue is clear" description="No channels waiting for review." />
      ) : (
        <div className="space-y-3">
          {pending.map((c) => (
            <div key={c.id} className="card flex flex-wrap items-start gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl dark:bg-brand-500/10">
                {c.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logo} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : c.type === "radio" ? (
                  "📻"
                ) : (
                  "📺"
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{c.stationName}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">
                  {c.type === "radio" ? "Radio" : "Television"} · {c.location} · submitted{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{c.description}</p>
                <a href={c.streamUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block truncate text-xs font-semibold text-brand-600 hover:underline">
                  {c.streamUrl}
                </a>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={busyId === c.id}
                  onClick={() => decide(c, "approved")}
                >
                  {busyId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve
                </button>
                <button
                  type="button"
                  className="btn-outline text-red-600"
                  disabled={busyId === c.id}
                  onClick={() => setRejecting(c)}
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-serif text-lg font-bold">Reviewed</h2>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                  <th className="px-4 py-3 font-semibold">Station</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Subscription</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {decided.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium">{c.stationName}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))]">
                      {c.type === "radio" ? <Radio className="inline h-4 w-4" /> : <Tv className="inline h-4 w-4" />} {c.type}
                    </td>
                    <td className="px-4 py-3 capitalize text-[rgb(var(--text-muted))]">
                      {c.subscription.status.replace("_", " ")}
                      {c.subscription.planName ? ` · ${c.subscription.planName}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip capitalize ${chip(c.status)}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Rejection note modal */}
      {rejecting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejecting(null)} aria-hidden />
          <div className="card relative w-full max-w-md p-6">
            <h3 className="font-serif text-lg font-bold">Reject {rejecting.stationName}</h3>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
              Tell the station why so they can fix it and resubmit.
            </p>
            <textarea
              className="input mt-4 min-h-[90px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. The streaming link does not work — please test it and resubmit."
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setRejecting(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!note.trim() || busyId === rejecting.id}
                onClick={() => decide(rejecting, "rejected", note)}
              >
                {busyId === rejecting.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Reject channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
