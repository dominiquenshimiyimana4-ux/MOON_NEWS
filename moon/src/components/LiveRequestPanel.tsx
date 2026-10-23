"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Radio, Send, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLiveRequests } from "@/lib/live/LiveRequestProvider";
import { useLanguage } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";

/**
 * "Go Live" request panel for readers on the Live page.
 *
 * Signed-out visitors are prompted to log in. A signed-in user can submit a
 * request (title, description, stream link) which an author or admin then
 * approves or rejects. Their latest request status is shown here so they always
 * know where they stand.
 */
export function LiveRequestPanel() {
  const { user, hydrated } = useAuth();
  const { latestFor, requestLive, cancel } = useLiveRequests();
  const { locale } = useLanguage();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [error, setError] = useState("");

  const t = (rw: string, en: string) => (locale === "rw" ? rw : en);

  const latest = user ? latestFor(user.id) : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) return setError(t("Andika umutwe w'isoko rya live.", "Enter a title for your live stream."));
    if (!/^https?:\/\//i.test(streamUrl.trim()))
      return setError(t("Shyiramo link ya stream itangira na http(s)://", "Enter a valid stream link starting with http(s)://"));
    setError("");
    requestLive(user, { title, description, streamUrl });
    setTitle("");
    setDescription("");
    setStreamUrl("");
    setOpen(false);
  }

  return (
    <section className="card mb-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/10 text-red-600">
            <Radio className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-serif text-base font-bold">{t("Ushaka gukora LIVE?", "Want to go live?")}</h2>
            <p className="text-xs text-[rgb(var(--text-muted))]">
              {t("Saba uruhushya — umwanditsi cyangwa umuyobozi azabyemeza.", "Request permission — an author or admin will approve it.")}
            </p>
          </div>
        </div>
        {user && !latest && !open && (
          <button type="button" onClick={() => setOpen(true)} className="btn-primary">
            <Radio className="h-4 w-4" /> {t("Saba LIVE", "Request to go live")}
          </button>
        )}
      </div>

      {/* Status / form body */}
      {!hydrated ? (
        <p className="px-5 py-4 text-sm text-[rgb(var(--text-muted))]">{t("Turimo gutangira…", "Loading…")}</p>
      ) : !user ? (
        <p className="px-5 py-4 text-sm text-[rgb(var(--text-muted))]">
          {t("Injira mu konti kugira ngo usabe gukora LIVE.", "Log in to request a live broadcast.")}
        </p>
      ) : latest && !open ? (
        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <StatusIcon status={latest.status} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{latest.title}</p>
              <p className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">
                {statusLabel(latest.status, t)} · {timeAgo(latest.createdAt, locale)}
              </p>
              {latest.status === "rejected" && latest.note && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
                  {t("Icyitonderwa:", "Note:")} {latest.note}
                </p>
              )}
              {latest.status === "approved" && (
                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  {t("Byemejwe! Isoko ryawe rizagaragara ku rupapuro rwa LIVE.", "Approved! Your stream can now appear on the Live page.")}
                </p>
              )}
            </div>
            {latest.status === "pending" && (
              <button
                type="button"
                onClick={() => cancel(latest.id)}
                className="btn-ghost !px-2 text-xs text-red-600"
              >
                {t("Kuraho", "Withdraw")}
              </button>
            )}
            {latest.status !== "pending" && (
              <button type="button" onClick={() => setOpen(true)} className="btn-outline !py-1 text-xs">
                {t("Saba ukundi", "Request again")}
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3 px-5 py-4">
          <div>
            <label className="label" htmlFor="live-title">{t("Umutwe", "Title")}</label>
            <input
              id="live-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("Urugero: Ikiganiro ku buzima", "e.g. Live talk on health")}
            />
          </div>
          <div>
            <label className="label" htmlFor="live-desc">{t("Ibisobanuro", "Description")}</label>
            <textarea
              id="live-desc"
              className="input min-h-20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Sobanura neza ibyo uzaba ukora.", "Briefly describe what you will broadcast.")}
            />
          </div>
          <div>
            <label className="label" htmlFor="live-url">{t("Link ya stream", "Stream link")}</label>
            <input
              id="live-url"
              className="input"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-outline">
              {t("Reka", "Cancel")}
            </button>
            <button type="submit" className="btn-primary">
              <Send className="h-4 w-4" /> {t("Ohereza ubusabe", "Submit request")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function statusLabel(status: string, t: (rw: string, en: string) => string): string {
  if (status === "approved") return t("Byemejwe", "Approved");
  if (status === "rejected") return t("Byanzwe", "Rejected");
  return t("Bitegereje kwemezwa", "Pending review");
}

function StatusIcon({ status }: { status: string }) {
  if (status === "approved") return <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />;
  if (status === "rejected") return <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />;
  return <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />;
}

export default LiveRequestPanel;
