"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Filter, Search } from "lucide-react";
import type { Article, CategorySlug } from "@/lib/types";
import { categories, categoryMap } from "@/lib/data/categories";
import { newsService, type SortKey } from "@/lib/services/newsService";
import { useLanguage } from "@/lib/i18n";
import { pick } from "@/lib/utils";
import { NewsCard } from "@/components/NewsCard";
import { PopularStories } from "@/components/PopularStories";
import { Pagination } from "@/components/Pagination";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeading } from "@/components/SectionHeading";

const PAGE_SIZE = 9;

export function CategoryView({ category }: { category: CategorySlug }) {
  const { locale, t } = useLanguage();
  const cat = categoryMap[category];
  const [items, setItems] = useState<Article[]>([]);
  const [popular, setPopular] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<SortKey>("newest");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await newsService.list({
      category,
      sort,
      search: query || undefined,
      page,
      pageSize: PAGE_SIZE,
    });
    setItems(res.items);
    setTotalPages(res.totalPages);
    setTotal(res.total);
    setLoading(false);
  }, [category, sort, query, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    newsService.getTrending(5).then(setPopular);
  }, []);

  const related = categories.filter((c) => c.slug !== category).slice(0, 6);
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <div>
      {/* Category header */}
      <div className="border-b border-border bg-[rgb(var(--bg-subtle))]">
        <div className="container-page py-8">
          <div className="flex items-center gap-3">
            <span className="h-10 w-1.5 rounded-full" style={{ background: cat.color }} />
            <div>
              <h1 className="font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">
                {pick(cat.name, locale)}
              </h1>
              <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
                {total} {locale === "rw" ? "inkuru" : "stories"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Filter / search */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={`${t("nav.search")} ${pick(cat.name, locale)}…`}
                className="input !pl-9"
              />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortKey);
                  setPage(1);
                }}
                className="input !pl-9 sm:w-48"
                aria-label={t("search.sort")}
              >
                <option value="newest">{t("search.sortNewest")}</option>
                <option value="popular">{t("search.sortPopular")}</option>
                <option value="oldest">{locale === "rw" ? "Iza kera" : "Oldest"}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Search className="h-10 w-10" />}
              title={t("search.noResults")}
              description={locale === "rw" ? "Gerageza irindi jambo cyangwa icyiciro." : "Try a different keyword or category."}
            />
          ) : (
            <>
              {featured && (
                <div className="mb-6">
                  <NewsCard article={featured} variant="horizontal" />
                </div>
              )}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {rest.map((a) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
              <Pagination
                className="mt-8"
                page={page}
                totalPages={totalPages}
                onChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}

          {/* Related categories */}
          <div className="mt-10">
            <SectionHeading title={locale === "rw" ? "Ibindi byiciro" : "Related categories"} />
            <div className="flex flex-wrap gap-2">
              {related.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="chip border border-border bg-[rgb(var(--surface))] text-[rgb(var(--text))] transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = c.color;
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {pick(c.name, locale)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <PopularStories articles={popular} />
        </aside>
      </div>
    </div>
  );
}

export default CategoryView;
