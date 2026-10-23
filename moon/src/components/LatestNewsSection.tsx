"use client";

import { useCallback, useEffect, useState } from "react";
import type { Article } from "@/lib/types";
import { newsService } from "@/lib/services/newsService";
import { useLanguage } from "@/lib/i18n";
import { NewsCard } from "./NewsCard";
import { CardSkeleton } from "./LoadingSkeleton";
import { SectionHeading } from "./SectionHeading";

const PAGE_SIZE = 6;

export function LatestNewsSection({ showHeading = true }: { showHeading?: boolean }) {
  const { t } = useLanguage();
  const [items, setItems] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextPage: number) => {
    setLoading(true);
    const res = await newsService.list({ sort: "newest", page: nextPage, pageSize: PAGE_SIZE });
    setItems((prev) => (nextPage === 1 ? res.items : [...prev, ...res.items]));
    setHasMore(res.page < res.totalPages);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div>
      {showHeading && <SectionHeading title={t("section.latest")} accent="#4c2fd0" />}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
          <NewsCard key={a.id} article={a} priority={i < 2} />
        ))}
        {loading &&
          Array.from({ length: PAGE_SIZE }).map((_, i) => <CardSkeleton key={`sk-${i}`} />)}
      </div>
      {hasMore && !loading && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              load(next);
            }}
            className="btn-outline"
          >
            {t("section.loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}

export default LatestNewsSection;
