"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import type { VideoItem } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { formatCount, pick, timeAgo } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";

export function VideoCard({
  video,
  onPlay,
}: {
  video: VideoItem;
  onPlay?: (v: VideoItem) => void;
}) {
  const { locale } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => onPlay?.(video)}
      className="group card overflow-hidden text-left transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={pick(video.title, locale)}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-lg transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
          {video.duration}
        </span>
        <div className="absolute left-2 top-2">
          <CategoryBadge category={video.category} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-serif text-base font-bold leading-snug transition-colors group-hover:text-brand-600">
          {pick(video.title, locale)}
        </h3>
        <p className="mt-1.5 text-xs text-[rgb(var(--text-muted))]">
          {formatCount(video.views)} views · {timeAgo(video.publishedAt, locale)}
        </p>
      </div>
    </button>
  );
}

export default VideoCard;
