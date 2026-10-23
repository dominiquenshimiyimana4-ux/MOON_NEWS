"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { articles } from "@/lib/data/articles";
import { cn, pick } from "@/lib/utils";

const RECENT_KEY = "moon_news_recent_searches";

interface SearchBarProps {
  variant?: "compact" | "full";
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({ variant = "full", autoFocus, className }: SearchBarProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setRecent(JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return articles
      .filter((a) =>
        [a.title.en, a.title.rw, a.tags.join(" ")].join(" ").toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [value]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = value.trim();
    if (!q) return;
    const next = [q, ...recent.filter((r) => r !== q)].slice(0, 6);
    setRecent(next);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function goSuggestion(slug: string, category: string) {
    setOpen(false);
    router.push(`/news/${category}/${slug}`);
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => router.push("/search")}
        className={cn("btn-ghost h-9 w-9 rounded-full !px-0", className)}
        aria-label={t("nav.search")}
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    );
  }

  return (
    <div className={cn("relative w-full", className)} ref={wrapRef}>
      <form onSubmit={submit} role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[rgb(var(--text-muted))]" />
          <input
            type="search"
            value={value}
            autoFocus={autoFocus}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t("search.placeholder")}
            className="input !pl-10"
            aria-label={t("nav.search")}
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {open && (suggestions.length > 0 || recent.length > 0) && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-card-hover">
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goSuggestion(s.slug, s.category)}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[rgb(var(--bg-subtle))]"
                  >
                    <Search className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--text-muted))]" />
                    <span className="line-clamp-2 text-sm font-medium">{pick(s.title, locale)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            value.trim() === "" &&
            recent.length > 0 && (
              <div>
                <div className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                  {t("search.recent")}
                </div>
                <ul>
                  {recent.map((r) => (
                    <li key={r}>
                      <button
                        type="button"
                        onClick={() => {
                          setValue(r);
                          submit();
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[rgb(var(--bg-subtle))]"
                      >
                        <Clock className="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))]" />
                        {r}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
