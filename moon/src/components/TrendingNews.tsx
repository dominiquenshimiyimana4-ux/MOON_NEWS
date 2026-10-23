"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { articlePath, cn, formatCount, pick, timeAgo } from "@/lib/utils";

type Metric = "read" | "shared" | "commented";

export function TrendingNews({ articles }: { articles: Article[] }) {
  const { locale, t } = useLanguage();
  const [metric, setMetric] = useState<Metric>("read");

  const sorted = [...articles]
    .sort((a, b) => {
      if (metric === "shared") return b.shares - a.shares;
      if (metric === "commented") return b.commentsCount - a.commentsCount;
      return b.views - a.views;
    })
    .slice(0, 5);

  const tabs: { key: Metric; label: string }[] = [
    { key: "read", label: t("section.mostRead") },
    { key: "shared", label: t("section.mostShared") },
    { key: "commented", label: t("section.mostCommented") },
  ];

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-extrabold tracking-tight">{t("section.trending")}</h2>
        <div className="flex rounded-full border border-border p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMetric(tab.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                metric === tab.key
                  ? "bg-brand-600 text-white"
                  : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="space-y-3">
        {sorted.map((a, i) => (
          <li key={a.id}>
            <Link
              href={articlePath(a)}
              className="group flex gap-4 rounded-xl border border-border bg-[rgb(var(--surface))] p-3 transition-shadow hover:shadow-card-hover"
            >
              <span className="font-serif text-3xl font-extrabold leading-none text-[rgb(var(--border))] transition-colors group-hover:text-brand-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative hidden h-16 w-20 shrink-0 overflow-hidden rounded-lg sm:block">
                <Image src={a.image} alt={pick(a.title, locale)} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug transition-colors group-hover:text-brand-600 sm:text-base">
                  {pick(a.title, locale)}
                </h3>
                <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                  {timeAgo(a.publishedAt, locale)} · {formatCount(metric === "shared" ? a.shares : metric === "commented" ? a.commentsCount : a.views)}{" "}
                  {metric === "shared" ? (locale === "rw" ? "gusangizwa" : "shares") : metric === "commented" ? (locale === "rw" ? "ibitekerezo" : "comments") : (locale === "rw" ? "abasomyi" : "views")}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default TrendingNews;
