"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Search, SlidersHorizontal, X } from "lucide-react";
import type { Article, CategorySlug } from "@/lib/types";
import { categories, categoryMap } from "@/lib/data/categories";
import { newsService, type SortKey } from "@/lib/services/newsService";
import { useLanguage } from "@/lib/i18n";
import { pick } from "@/lib/utils";
import { NewsCard } from "./NewsCard";
import { ListSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";

const RECENT_KEY = "moon_news_recent_searches";
type DateRange = "any" | "day" | "week" | "month";

function withinDays(iso: string, range: DateRange): boolean {
  if (range === "any") return true;
  const days = range === "day" ? 1 : range === "week" ? 7 : 30;
  return Date.now() - new Date(iso).getTime() <= days * 86400000;
}

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useLanguage();

  const qParam = searchParams.get("q") ?? "";
  const [input, setInput] = useState(qParam);
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange>("any");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [recent, setRecent] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    try {
      setRecent(JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {
      setRecent([]);
    }
  }, []);

  const runSearch = useCallback(
    async (term: string) => {
      setLoading(true);
      const res = await newsService.search(term, { sort, pageSize: 50 });
      setResults(res.items);
      setLoading(false);
    },
    [sort]
  );

  useEffect(() => {
    setInput(qParam);
    runSearch(qParam);
  }, [qParam, runSearch]);

  const suggestions = useMemo(() => {
    const term = input.trim().toLowerCase();
    if (!term) return [];
    return categories
      .filter((c) => pick(c.name, locale).toLowerCase().includes(term))
      .slice(0, 4);
  }, [input, locale]);

  const filtered = results.filter(
    (a) =>
      (category === "all" || a.category === category) && withinDays(a.publishedAt, dateRange)
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = input.trim();
    if (!term) return;
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    setRecent(next);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-serif text-3xl font-extrabold">
        {qParam ? (
          <>
            {t("search.resultsFor")}{" "}
            <span className="text-brand-600">&ldquo;{qParam}&rdquo;</span>
            <span className="ml-2 text-base font-medium text-[rgb(var(--text-muted))]">
              ({filtered.length})
            </span>
          </>
        ) : (
          t("nav.search")
        )}
      </h1>

      <form onSubmit={submit} className="relative mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("search.placeholder")}
            autoFocus
            className="input !py-3 !pl-12 !text-base"
          />
        </div>
        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-card-hover">
            <p className="px-4 pt-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
              {t("search.suggestions")}
            </p>
            {suggestions.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[rgb(var(--bg-subtle))]"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                {pick(c.name, locale)}
              </Link>
            ))}
          </div>
        )}
      </form>

      {/* Recent searches */}
      {!qParam && recent.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-[rgb(var(--text-muted))]">{t("search.recent")}:</span>
          {recent.map((r) => (
            <Link
              key={r}
              href={`/search?q=${encodeURIComponent(r)}`}
              className="chip border border-border bg-[rgb(var(--surface))] text-[rgb(var(--text))] hover:border-brand-500 hover:text-brand-600"
            >
              <Clock className="h-3 w-3" /> {r}
            </Link>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="btn-outline"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" /> {locale === "rw" ? "Shungura" : "Filters"}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-[rgb(var(--text-muted))]">{t("search.sort")}:</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortKey);
              runSearch(qParam);
            }}
            className="input !w-auto"
          >
            <option value="relevance">{t("search.sortRelevance")}</option>
            <option value="newest">{t("search.sortNewest")}</option>
            <option value="popular">{t("search.sortPopular")}</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
          <div>
            <span className="label">{t("search.filterCategory")}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategorySlug | "all")}
              className="input"
            >
              <option value="all">{t("search.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {pick(c.name, locale)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="label">{t("search.filterDate")}</span>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)} className="input">
              <option value="any">{t("search.allTime")}</option>
              <option value="day">{t("search.pastDay")}</option>
              <option value="week">{t("search.pastWeek")}</option>
              <option value="month">{t("search.pastMonth")}</option>
            </select>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {(category !== "all" || dateRange !== "any") && (
        <div className="mb-4 flex flex-wrap gap-2">
          {category !== "all" && (
            <button type="button" onClick={() => setCategory("all")} className="chip bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {pick(categoryMap[category].name, locale)} <X className="h-3 w-3" />
            </button>
          )}
          {dateRange !== "any" && (
            <button type="button" onClick={() => setDateRange("any")} className="chip bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {t("search.filterDate")}: {dateRange} <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {loading ? (
        <ListSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-10 w-10" />}
          title={t("search.noResults")}
          description={
            locale === "rw"
              ? "Nta nkuru zihuye n'iryo jambo. Gerageza irindi."
              : "No stories matched your search. Try different keywords or filters."
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <NewsCard key={a.id} article={a} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchView;
