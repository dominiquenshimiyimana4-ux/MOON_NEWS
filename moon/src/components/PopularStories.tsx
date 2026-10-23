"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import type { Article } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { articlePath, formatCount, pick } from "@/lib/utils";

export function PopularStories({
  articles,
  title,
}: {
  articles: Article[];
  title?: string;
}) {
  const { locale, t } = useLanguage();
  const top = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <aside className="rounded-xl border border-border bg-[rgb(var(--surface))] p-5">
      <h3 className="mb-4 font-serif text-lg font-extrabold">
        <span className="mr-2 inline-block h-5 w-1 rounded-full bg-brand-600 align-middle" />
        {title ?? t("section.popular")}
      </h3>
      <ol className="space-y-4">
        {top.map((a, i) => (
          <li key={a.id} className="flex gap-3">
            <span className="font-serif text-xl font-extrabold leading-none text-[rgb(var(--border))]">
              {i + 1}
            </span>
            <Link href={articlePath(a)} className="group min-w-0">
              <p className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-brand-600">
                {pick(a.title, locale)}
              </p>
              <span className="mt-1 flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                <Eye className="h-3.5 w-3.5" /> {formatCount(a.views)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export default PopularStories;
