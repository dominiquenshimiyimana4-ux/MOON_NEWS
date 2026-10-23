"use client";

import Image from "next/image";
import type { LiveEvent } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { formatTime, pick } from "@/lib/utils";

export function LiveTimeline({ event }: { event: LiveEvent }) {
  const { locale } = useLanguage();
  return (
    <ol className="relative mt-8 border-l-2 border-red-500/30 pl-6">
      {event.updates.map((u, i) => (
        <li key={u.id} className="relative pb-8 last:pb-0">
          <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 dark:border-[rgb(var(--bg))]">
            {i === 0 && <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />}
          </span>
          <time className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
            {formatTime(u.time, locale)}
          </time>
          <h3 className="mt-1 font-serif text-lg font-bold">{pick(u.title, locale)}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[rgb(var(--text-muted))]">{pick(u.body, locale)}</p>
          {u.media && (
            <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl">
              <Image src={u.media} alt={pick(u.title, locale)} fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export default LiveTimeline;
