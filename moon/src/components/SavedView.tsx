"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkX } from "lucide-react";
import type { Article } from "@/lib/types";
import { useBookmarks } from "@/lib/bookmarks/BookmarkProvider";
import { userService } from "@/lib/services/userService";
import { useLanguage } from "@/lib/i18n";
import { NewsCard } from "./NewsCard";
import { EmptyState } from "./EmptyState";

export function SavedView() {
  const { saved, hydrated, toggle } = useBookmarks();
  const { locale, t } = useLanguage();
  const [items, setItems] = useState<Article[]>([]);

  useEffect(() => {
    if (hydrated) setItems(userService.getSavedArticles());
  }, [saved, hydrated]);

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex items-center gap-3 border-b border-border pb-4">
        <Bookmark className="h-7 w-7 text-brand-600" />
        <div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight">{t("saved.title")}</h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            {hydrated ? `${items.length} ${locale === "rw" ? "zabitswe" : "saved"}` : ""}
          </p>
        </div>
      </div>

      {hydrated && items.length === 0 ? (
        <EmptyState
          icon={<BookmarkX className="h-10 w-10" />}
          title={t("saved.empty")}
          description={t("saved.emptyDesc")}
          action={
            <Link href="/" className="btn-primary">
              {t("common.backHome")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <div key={a.id} className="relative">
              <NewsCard article={a} />
              <button
                type="button"
                onClick={() => toggle(a.slug)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white backdrop-blur transition-colors hover:bg-red-600"
                aria-label={t("common.delete")}
                title={locale === "rw" ? "Kura mu byabitswe" : "Remove"}
              >
                <BookmarkX className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedView;
