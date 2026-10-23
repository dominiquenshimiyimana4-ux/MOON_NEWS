"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import type { PhotoGallery } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { pick, timeAgo } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";

export function GalleryCard({ gallery, onOpen }: { gallery: PhotoGallery; onOpen: (g: PhotoGallery) => void }) {
  const { locale } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => onOpen(gallery)}
      className="group card relative aspect-[4/3] overflow-hidden text-left"
    >
      <Image
        src={gallery.cover}
        alt={pick(gallery.title, locale)}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute left-3 top-3 flex items-center gap-2">
        <CategoryBadge category={gallery.category} />
        <span className="chip bg-black/60 text-white">
          <Images className="h-3 w-3" /> {gallery.photos.length}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="line-clamp-2 font-serif text-lg font-bold text-white">{pick(gallery.title, locale)}</h3>
        <p className="mt-1 text-xs text-white/75">{timeAgo(gallery.publishedAt, locale)}</p>
      </div>
    </button>
  );
}

export function GalleryViewer({
  gallery,
  onClose,
}: {
  gallery: PhotoGallery | null;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [gallery]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!gallery) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % gallery.photos.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + gallery.photos.length) % gallery.photos.length);
    }
    document.addEventListener("keydown", onKey);
    if (gallery) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [gallery, onClose]);

  if (!gallery) return null;
  const photo = gallery.photos[index];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-full w-full max-w-4xl flex-col">
        <div className="mb-2 flex items-center justify-between text-white">
          <span className="font-serif text-lg font-bold">{pick(gallery.title, locale)}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">{index + 1} / {gallery.photos.length}</span>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden rounded-xl bg-black">
          <Image src={photo.url} alt={pick(photo.caption, locale)} fill sizes="100vw" className="object-contain" priority />
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + gallery.photos.length) % gallery.photos.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % gallery.photos.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        <p className="mt-3 text-center text-sm text-white/85">{pick(photo.caption, locale)}</p>
      </div>
    </div>
  );
}
