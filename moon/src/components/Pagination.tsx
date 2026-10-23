"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="btn-outline h-9 !px-2.5"
        aria-label={t("common.prev")}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-sm text-[rgb(var(--text-muted))]">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition-colors",
              p === page
                ? "bg-brand-600 text-white"
                : "border border-border text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-subtle))]"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-outline h-9 !px-2.5"
        aria-label={t("common.next")}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export default Pagination;
