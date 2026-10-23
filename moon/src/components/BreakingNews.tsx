"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Article } from "@/lib/types";
import { newsService } from "@/lib/services/newsService";
import { useLanguage } from "@/lib/i18n";
import { articlePath, pick } from "@/lib/utils";

export function BreakingNews() {
  const [items, setItems] = useState<Article[]>([]);
  const { locale, t } = useLanguage();

  useEffect(() => {
    newsService.getBreaking().then(setItems);
  }, []);

  if (items.length === 0) return null;

  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="relative flex items-stretch overflow-hidden border-b border-border bg-red-600 text-white">
      <div className="z-10 flex shrink-0 items-center gap-2 bg-red-700 px-3 py-2 text-xs font-extrabold uppercase tracking-wide sm:px-4">
        <AlertTriangle className="h-4 w-4" />
        <span className="hidden sm:inline">{t("section.breaking")}</span>
        <span className="sm:hidden">Breaking</span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-8 py-2 pl-6 hover:[animation-play-state:paused]">
          {loop.map((a, i) => (
            <Link
              key={`${a.id}-${i}`}
              href={articlePath(a)}
              className="flex shrink-0 items-center gap-2 text-sm font-medium whitespace-nowrap hover:underline"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              {pick(a.title, locale)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BreakingNews;
