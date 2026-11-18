"use client";

import { useEffect, useState } from "react";
import { Loader2, Radio } from "lucide-react";
import type { Channel } from "@/lib/types";
import { channelService } from "@/lib/services/channelService";
import { PageHeader } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

/**
 * Public channel directory: every approved station with an active
 * subscription. Filter by radio or television.
 */
export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "radio" | "television">("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await channelService.listActive();
        if (alive) setChannels(list);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Could not load channels.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const visible = channels.filter((c) => filter === "all" || c.type === filter);

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Channels"
        subtitle="Radio and television stations broadcasting with Moon News."
        action={
          <div className="flex gap-2">
            {(["all", "radio", "television"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-colors",
                  filter === f
                    ? "bg-brand-600 text-white"
                    : "border border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[rgb(var(--text-muted))]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading channels…
        </div>
      ) : error ? (
        <div className="card border-red-300 p-6 text-sm text-red-700 dark:border-red-500/30 dark:text-red-300">{error}</div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Radio className="h-8 w-8" />}
          title="No channels yet"
          description="Approved stations with an active subscription will appear here. Are you a station? Register your channel from a station account."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <div key={c.id} className="card flex flex-col p-5">
              <div className="flex items-center gap-3">
                {c.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logo} alt={c.stationName} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xl dark:bg-brand-500/10">
                    {c.type === "radio" ? "📻" : "📺"}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{c.stationName}</h3>
                  <p className="text-xs text-[rgb(var(--text-muted))]">
                    {c.type === "radio" ? "Radio" : "Television"} · {c.location}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-3 flex-1 text-sm text-[rgb(var(--text-muted))]">{c.description}</p>
              <a
                href={c.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-4 text-sm"
              >
                {c.type === "radio" ? "Listen now" : "Watch now"} ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
