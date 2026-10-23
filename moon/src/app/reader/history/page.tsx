"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { History } from "lucide-react";
import type { Article } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { userService } from "@/lib/services/userService";
import { categoryMap } from "@/lib/data/categories";
import { useLanguage } from "@/lib/i18n";
import { pick, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

/**
 * Reader reading history — the full list of articles this reader has opened,
 * most recent first. Data comes from the reader's own local library.
 */
export default function ReaderHistoryPage() {
  const { user, hydrated } = useAuth();
  const { locale } = useLanguage();
  const [history, setHistory] = useState<Article[]>([]);

  useEffect(() => {
    if (!user) return;
    setHistory(userService.getHistoryArticles());
  }, [user]);

  if (!hydrated) {
    return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Reading history"
        subtitle={locale === "rw" ? "Inkuru wasomye vuba." : "Articles you have read recently."}
      />

      {history.length === 0 ? (
        <EmptyState
          title={locale === "rw" ? "Nta nkuru urasoma." : "Nothing read yet."}
          description={
            locale === "rw"
              ? "Inkuru uzasoma zizagaragara hano."
              : "Articles you open will show up here so you can pick up where you left off."
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-[rgb(var(--border))]">
            {history.map((a) => (
              <li key={a.id}>
                <Link href={`/news/${a.category}/${a.slug}`} className="group flex items-center gap-4 px-5 py-4">
                  <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                    <Image src={a.image} alt="" fill sizes="96px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium group-hover:text-brand-600">
                      {pick(a.title, locale)}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                      <History className="h-3.5 w-3.5" />
                      {categoryMap[a.category]?.name.en} · {formatDate(a.publishedAt, locale)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
