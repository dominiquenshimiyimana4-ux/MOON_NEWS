"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, Tv } from "lucide-react";
import type { Channel } from "@/lib/types";
import { channelService } from "@/lib/services/channelService";

export function HomepageChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    let active = true;
    channelService
      .listActive()
      .then((items) => {
        if (active) setChannels(items.slice(0, 4));
      })
      .catch(() => {
        if (active) setChannels([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (channels.length === 0) return null;

  return (
    <section aria-labelledby="homepage-channels-heading" className="card rounded-2xl border-border p-5 sm:p-6">
      <div className="mb-4 flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Listen & watch live</p>
          <h2 id="homepage-channels-heading" className="mt-1 font-serif text-2xl font-bold">Radio & TV</h2>
        </div>
        <Link href="/channels" className="text-sm font-semibold text-brand-600 hover:underline">
          All channels →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((channel) => (
          <article key={channel.id} className="rounded-xl border-border bg-[rgb(var(--bg-subtle))] p-4">
            <div className="flex items-center gap-3">
              {channel.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={channel.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                  {channel.type === "radio" ? <Radio className="h-5 w-5" /> : <Tv className="h-5 w-5" />}
                </span>
              )}
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{channel.stationName}</h3>
                <p className="text-xs capitalize text-[rgb(var(--text-muted))]">{channel.type} · {channel.location}</p>
              </div>
            </div>
            <a
              href={channel.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 w-full text-sm"
            >
              {channel.type === "radio" ? (
                <>
                  <Radio className="h-4 w-4" /> Listen now
                </>
              ) : (
                <>
                  <Tv className="h-4 w-4" /> Watch TV
                </>
              )}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
