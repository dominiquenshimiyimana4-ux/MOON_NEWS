"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, RefreshCw, Radio } from "lucide-react";
import type { LiveEvent } from "@/lib/types";
import { contentService } from "@/lib/services/newsService";
import { useLanguage } from "@/lib/i18n";
import { pick } from "@/lib/utils";
import { LiveTimeline } from "./LiveTimeline";
import { LiveRequestPanel } from "./LiveRequestPanel";

/** How often to poll for new live updates, in milliseconds. */
const REFRESH_INTERVAL = 30000;

export function LiveBrowser() {
  const { locale } = useLanguage();
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [selected, setSelected] = useState<LiveEvent | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Track the id the user picked so a background refresh never switches their view.
  const selectedIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const list = await contentService.live();
      setEvents(list);
      setSelected((current) => {
        if (selectedIdRef.current) {
          return list.find((e) => e.id === selectedIdRef.current) ?? list[0] ?? null;
        }
        return list[0] ?? current ?? null;
      });
      setUpdatedAt(new Date());
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial load + periodic polling, and an immediate refresh when the reader
  // returns to the tab so they always see the latest developments without a
  // manual page reload.
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) void load();
    };
    run();
    const id = window.setInterval(run, REFRESH_INTERVAL);
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const event = selected;

  const selectEvent = (e: LiveEvent) => {
    selectedIdRef.current = e.id;
    setSelected(e);
  };

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE
        </span>
        <h1 className="mt-3 font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">
          {locale === "rw" ? "Amakuru agezweho ako kanya" : "Live Coverage"}
        </h1>
      </div>

      <LiveRequestPanel />

      {/* Event selector */}
      {events.length > 1 && (
        <div className="scrollbar-hide mb-6 flex gap-3 overflow-x-auto pb-2">
          {events.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => selectEvent(e)}
              className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                event?.id === e.id
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
              }`}
            >
              {pick(e.title, locale)}
            </button>
          ))}
        </div>
      )}

      {event ? (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {event.streamUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
                <video
                  src={event.streamUrl}
                  controls
                  playsInline
                  poster={event.cover}
                  className="h-full w-full bg-black object-contain"
                />
                <span className="chip pointer-events-none absolute left-4 top-4 bg-red-600 text-white">
                  <Radio className="h-3 w-3 animate-pulse" /> LIVE
                </span>
              </div>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <Image
                  src={event.cover}
                  alt={pick(event.title, locale)}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
            )}
            <div className="mt-4">
              <span className="chip bg-red-600 text-white">
                <Radio className="h-3 w-3 animate-pulse" /> LIVE
              </span>
              <h2 className="mt-2 font-serif text-2xl font-extrabold">{pick(event.title, locale)}</h2>
            </div>
            <p className="mt-4 text-[rgb(var(--text-muted))]">{pick(event.summary, locale)}</p>
            {event.streamUrl && (
              <a
                href={event.streamUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-outline mt-4 inline-flex"
              >
                <ExternalLink className="h-4 w-4" />
                {locale === "rw" ? "Fungura isoko rya LIVE" : "Open live stream"}
              </a>
            )}
            <LiveTimeline event={event} />
          </div>
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-[rgb(var(--bg-subtle))] p-4 text-sm text-[rgb(var(--text-muted))]">
              <div className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-600" />
                <p>
                  {locale === "rw"
                    ? "Iyi nkuru iravugururwa ako kanya — nta gukanda refresh ukeneye."
                    : "This coverage updates in real time — no need to refresh."}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-[rgb(var(--text-muted))]">
                  {updatedAt
                    ? `${locale === "rw" ? "Byavuguruwe" : "Updated"} ${updatedAt.toLocaleTimeString(
                        locale === "rw" ? "rw-RW" : "en-US",
                        { hour: "2-digit", minute: "2-digit", second: "2-digit" }
                      )}`
                    : locale === "rw"
                      ? "Turimo kubona amakuru…"
                      : "Loading latest…"}
                </span>
                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={refreshing}
                  className="btn-ghost h-7 gap-1 !px-2 text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  {locale === "rw" ? "Vugurura" : "Refresh"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <p className="text-sm text-[rgb(var(--text-muted))]">
          {locale === "rw" ? "Nta mukino urimo ubu." : "No live events right now."}
        </p>
      )}
    </div>
  );
}

export default LiveBrowser;
