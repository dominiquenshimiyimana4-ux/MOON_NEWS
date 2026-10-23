"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { VideoItem } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { pick } from "@/lib/utils";

export function VideoPlayerModal({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  const { locale, t } = useLanguage();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (video) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl">
        <div className="flex items-center justify-between bg-[rgb(var(--surface))] px-4 py-2.5">
          <h3 className="truncate font-serif text-base font-bold">{pick(video.title, locale)}</h3>
          <button type="button" onClick={onClose} className="btn-ghost h-8 w-8 rounded-full !px-0" aria-label={t("common.close")}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={video.videoUrl} controls autoPlay className="aspect-video w-full bg-black" />
        <p className="bg-[rgb(var(--surface))] px-4 py-3 text-sm text-[rgb(var(--text-muted))]">
          {pick(video.description, locale)}
        </p>
      </div>
    </div>
  );
}

export default VideoPlayerModal;
