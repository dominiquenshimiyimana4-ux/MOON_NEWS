"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Megaphone, X } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { placementLabels, adTypeLabels } from "@/lib/data/advertising";
import { formatRWF, timeAgo } from "@/lib/utils";
import { PageHeader, StatCard, StatusPill } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

/**
 * Editor Dashboard — advertising review.
 *
 * Editors review every campaign an advertiser submits: they can see the
 * creative, the placement, the schedule and the budget, then approve it (which
 * makes it live on the site) or reject it with a note the advertiser will see.
 */
export default function AdReviewPage() {
  const { ads, hydrated, approveAd, rejectAd } = useAdmin();
  const { user } = useAuth();
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const reviewer = user?.name ?? "Editor";
  const pending = ads.filter((a) => a.status === "pending");
  const approved = ads.filter((a) => a.status === "active");
  const rejected = ads.filter((a) => a.status === "ended" && a.reviewNote);
  const reviewed = ads.filter((a) => a.reviewedAt);

  return (
    <div>
      <PageHeader
        title="Ad Review"
        subtitle={`${pending.length} awaiting review · ${ads.length} campaigns total`}
        action={
          <Link href="/admin/advertising" className="btn-outline">
            Advertiser overview
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Awaiting review" value={pending.length} icon={<Megaphone className="h-5 w-5" />} accent="#ca8a04" />
        <StatCard label="Live campaigns" value={approved.length} icon={<Check className="h-5 w-5" />} accent="#16a34a" />
        <StatCard label="Rejected" value={rejected.length} icon={<X className="h-5 w-5" />} accent="#dc2626" />
        <StatCard label="Reviewed" value={reviewed.length} icon={<Megaphone className="h-5 w-5" />} accent="#4c2fd0" />
      </div>

      <h2 className="mb-3 font-serif text-lg font-bold">Queue</h2>
      {!hydrated ? (
        <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>
      ) : pending.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-8 w-8" />}
          title="Nothing to review"
          description="New campaigns submitted by advertisers will appear here."
        />
      ) : (
        <div className="space-y-3">
          {pending.map((ad) => (
            <div key={ad.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-base font-bold">{ad.headline || ad.advertiser}</h3>
                    <StatusPill status={ad.status} />
                  </div>
                  <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
                    {ad.advertiser} · {placementLabels[ad.placement]} · {adTypeLabels[ad.type]}
                  </p>
                  <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                    {new Date(ad.startDate).toLocaleDateString()} –{" "}
                    {new Date(ad.endDate).toLocaleDateString()} · Budget {formatRWF(ad.budget)}
                  </p>
                  {ad.submittedAt && (
                    <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                      Submitted {timeAgo(ad.submittedAt, "en")}
                    </p>
                  )}
                  {ad.targetUrl && (
                    <a
                      href={ad.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> {ad.targetUrl}
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => approveAd(ad.id, reviewer)}
                    className="btn-primary"
                  >
                    <Check className="h-4 w-4" /> Approve &amp; publish
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteFor(ad.id);
                      setNote("");
                    }}
                    className="btn-ghost text-red-600"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {noteFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNoteFor(null)} aria-hidden />
          <div className="card relative w-full max-w-sm p-6">
            <h3 className="font-serif text-lg font-bold">Reject campaign</h3>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
              Optionally tell the advertiser why. This note is shown on their dashboard.
            </p>
            <textarea
              className="input mt-4 min-h-20"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. The destination link does not resolve."
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setNoteFor(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  rejectAd(noteFor, reviewer, note.trim() || undefined);
                  setNoteFor(null);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recently decided */}
      {reviewed.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-serif text-lg font-bold">Recently reviewed</h2>
          <div className="card divide-y divide-[rgb(var(--border))] overflow-hidden">
            {reviewed.map((ad) => (
              <div key={ad.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{ad.headline || ad.advertiser}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">
                    {ad.reviewedBy} · {ad.reviewedAt ? timeAgo(ad.reviewedAt, "en") : ""}
                    {ad.reviewNote ? ` · ${ad.reviewNote}` : ""}
                  </p>
                </div>
                <StatusPill status={ad.status} />
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-4 text-xs text-[rgb(var(--text-muted))]">
        Approving publishes the campaign immediately; rejecting notifies the advertiser.
      </p>
    </div>
  );
}
