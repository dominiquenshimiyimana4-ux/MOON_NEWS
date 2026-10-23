"use client";

import { useEffect, useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";
import type { CategorySlug, VideoItem } from "@/lib/types";
import { categories } from "@/lib/data/categories";
import { contentService } from "@/lib/services/newsService";
import { useLanguage } from "@/lib/i18n";
import { cn, pick } from "@/lib/utils";
import { VideoCard } from "./VideoCard";
import { VideoPlayerModal } from "./VideoPlayerModal";

export function VideoBrowser() {
  const { locale } = useLanguage();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [active, setActive] = useState<VideoItem | null>(null);
  const [filter, setFilter] = useState<CategorySlug | "all">("all");

  useEffect(() => {
    contentService.videos().then(setVideos);
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? videos : videos.filter((v) => v.category === filter)),
    [videos, filter]
  );

  const popular = [...videos].sort((a, b) => b.views - a.views).slice(0, 3);
  const featured = videos[0];

  return (
    <div className="container-page py-8">
      {/* Brand header */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-ink-950 to-brand-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <PlayCircle className="h-4 w-4" /> Moon News TV
          </span>
          <h1 className="mt-3 font-serif text-3xl font-extrabold sm:text-4xl">
            {locale === "rw" ? "Amakuru mu mashusho" : "Video News"}
          </h1>
          <p className="mt-1 max-w-md text-sm text-white/80">
            {locale === "rw"
              ? "Reba amashusho y'amakuru, ibiganiro n'ibindi bikorwa."
              : "Watch news reports, interviews and features from the Moon News video team."}
          </p>
        </div>
      </div>

      {/* Featured player */}
      {featured && (
        <div className="mb-10">
          <VideoCard video={featured} onPlay={setActive} />
        </div>
      )}

      {/* Category filter */}
      <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          {locale === "rw" ? "Byose" : "All"}
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.slug} active={filter === c.slug} onClick={() => setFilter(c.slug)}>
            {pick(c.name, locale)}
          </FilterChip>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-serif text-xl font-extrabold">
            {locale === "rw" ? "Amashusho agezweho" : "Latest videos"}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {filtered.map((v) => (
              <VideoCard key={v.id} video={v} onPlay={setActive} />
            ))}
          </div>
        </div>
        <aside>
          <h2 className="mb-4 font-serif text-xl font-extrabold">
            {locale === "rw" ? "Bikunzwe" : "Popular videos"}
          </h2>
          <div className="space-y-4">
            {popular.map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActive(v)}
                className="group flex w-full gap-3 text-left"
              >
                <span className="font-serif text-2xl font-extrabold text-[rgb(var(--border))] group-hover:text-brand-500">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 block text-sm font-semibold group-hover:text-brand-600">
                    {pick(v.title, locale)}
                  </span>
                  <span className="text-xs text-[rgb(var(--text-muted))]">{v.duration}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <VideoPlayerModal video={active} onClose={() => setActive(null)} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
      )}
    >
      {children}
    </button>
  );
}

export default VideoBrowser;
