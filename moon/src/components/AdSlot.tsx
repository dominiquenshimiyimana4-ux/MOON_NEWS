"use client";

import { cn } from "@/lib/utils";

interface AdSlotProps {
  /** Ad slot identifier for reporting/delivery. */
  placement: string;
  /** Width in px. */
  width?: number;
  /** Height in px. */
  height?: number;
  /** Optional backup image URL shown when no ad is served. */
  fallbackImage?: string;
  /** Optional link URL for the fallback image. */
  fallbackUrl?: string;
}

/**
 * A single ad slot placeholder.
 *
 * In production this renders an AdSense / GPT / direct-sold ad. In this demo
 * it renders a clearly labeled placeholder box so the layout never shifts.
 * Ads are marked as advertisements for transparency and accessibility.
 */
export function AdSlot({
  placement,
  width = 300,
  height = 250,
  fallbackImage,
  fallbackUrl,
}: AdSlotProps) {
  return (
    <div
      aria-label={`Advertisement: ${placement}`}
      role="region"
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[rgb(var(--border))] bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))] text-xs font-medium",
        `w-[${width}px] h-[${height}px] sm:w-full sm:h-auto sm:max-w-[${width}px] sm:max-h-[${height}px]`
      )}
    >
      <span className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
        AD
      </span>

      {fallbackImage && fallbackUrl ? (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
          aria-label={`Sponsored: ${placement}`}
        >
          <img
            src={fallbackImage}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </a>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <svg className="w-8 h-8 text-[rgb(var(--text-muted))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M13 3h7v14h-7z" />
            <circle cx="8" cy="8" r="1" fill="currentColor" />
            <circle cx="14" cy="13" r="1" fill="currentColor" />
          </svg>
          <span className="text-[rgb(var(--text-muted))]">{placement}</span>
          <span className="text-[10px] opacity-60">Advertisement</span>
        </div>
      )}
    </div>
  );
}

/**
 * 728x90 top leaderboard banner. Renders full-width on desktop, 320x50 mobile.
 */
export function LeaderboardAd({ placement, width = 728, height = 90, ...rest }: AdSlotProps) {
  return (
    <div
      className="flex justify-center my-4"
      aria-label={`Leaderboard advertisement: ${placement}`}
    >
      <AdSlot placement={placement} width={width} height={height} {...rest} />
    </div>
  );
}

/**
 * 300x250 sidebar rectangle ad.
 */
export function SidebarAd({ placement, width = 300, height = 250, ...rest }: AdSlotProps) {
  return <AdSlot placement={placement} width={width} height={height} {...rest} />;
}

/**
 * In-article native ad slot. Flush left/right depending on layout, designed
 * to sit between paragraphs without blocking the main text.
 */
export function InArticleAd({ placement, width = 300, height = 250, ...rest }: AdSlotProps) {
  return (
    <div
      className="flex justify-center my-8 sm:my-12"
      aria-label={`In-article advertisement: ${placement}`}
    >
      <AdSlot placement={placement} width={width} height={height} {...rest} />
    </div>
  );
}

export default AdSlot;
