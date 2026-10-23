"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Radio, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLiveRequests } from "@/lib/live/LiveRequestProvider";
import { roleLabels } from "@/lib/services/authService";
import { timeAgo } from "@/lib/utils";
import { PageHeader, StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

/**
 * Review queue for "go live" requests.
 *
 * Authors and admins land here to approve or reject reader requests to
 * broadcast. Approving a request records the decision and lets the requester
 * surface their stream on the Live page; rejecting captures an optional note
 * that the requester sees on their dashboard.
 */
export default function AdminLiveRequestsPage() {
  const { user } = useAuth();
  const { requests, pending, approve, reject, hydrated } = useLiveRequests();
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const reviewer = user?.name ?? "Staff";

  return (
    <div>
      <PageHeader
        title="Live Requests"
        subtitle={`${pending.length} awaiting review · ${requests.length} total`}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending" value={pending.length} icon={<Radio className="h-5 w-5" />} accent="#dc2626" />
        <StatCard
          label="Approved"
          value={requests.filter((r) => r.status === "approved").length}
          icon={<Check className="h-5 w-5" />}
          accent="#16a34a"
        />
        <StatCard
          label="Rejected"
          value={requests.filter((r) => r.status === "rejected").length}
          icon={<X className="h-5 w-5" />}
          accent="#ca8a04"
        />
        <StatCard label="All requests" value={requests.length} icon={<Radio className="h-5 w-5" />} accent="#4c2fd0" />
      </div>

      {!hydrated ? (
        <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Radio className="h-8 w-8" />}
          title="No live requests yet"
          description="When a reader asks to go live, it will appear here for review."
        />
      ) : (
        <div className="card divide-y divide-[rgb(var(--border))] overflow-hidden">
          {requests.map((r) => (
            <div key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold">{r.title}</span>
                    <StatusPill status={r.status} />
                  </div>
                  <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{r.description || "—"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[rgb(var(--text-muted))]">
                    <span>
                      {r.userName} · {roleLabels[r.userRole]}
                    </span>
                    <span>· {timeAgo(r.createdAt, "en")}</span>
                    {r.reviewedBy && r.reviewedAt && (
                      <span>
                        · {r.status} by {r.reviewedBy} {timeAgo(r.reviewedAt, "en")}
                      </span>
                    )}
                  </div>
                  <a
                    href={r.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> {r.streamUrl}
                  </a>
                  {r.note && (
                    <p className="mt-2 rounded-lg bg-[rgb(var(--bg-subtle))] px-3 py-2 text-xs text-[rgb(var(--text-muted))]">
                      Note: {r.note}
                    </p>
                  )}
                </div>

                {r.status === "pending" && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => approve(r.id, reviewer)}
                      className="btn-ghost !px-2 text-xs text-emerald-600"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNoteFor(r.id);
                        setNote("");
                      }}
                      className="btn-ghost !px-2 text-xs text-red-600"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {noteFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNoteFor(null)} aria-hidden />
          <div className="card relative w-full max-w-sm p-6">
            <h3 className="font-serif text-lg font-bold">Reject request</h3>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
              Optionally tell the requester why. This note is shown on their dashboard.
            </p>
            <textarea
              className="input mt-4 min-h-20"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Please use a stable stream link."
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setNoteFor(null)} className="btn-outline">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  reject(noteFor, reviewer, note.trim() || undefined);
                  setNoteFor(null);
                }}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-[rgb(var(--text-muted))]">
        Requests are stored locally for the demo. Connect your API to persist them.{" "}
        <Link href="/live" className="font-semibold text-brand-600 hover:underline">
          View the Live page →
        </Link>
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  };
  return <span className={`chip shrink-0 ${map[status] ?? ""}`}>{status}</span>;
}
