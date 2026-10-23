"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileEdit, Pencil, Radio, Search, Star, Trash2 } from "lucide-react";
import type { ArticleStatus, CategorySlug } from "@/lib/types";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { categories, categoryMap } from "@/lib/data/categories";
import { PageHeader, StatusPill } from "@/components/admin/StatCard";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";

export default function AdminArticlesPage() {
  const { articles, hydrated, deleteArticle, toggleBreaking, toggleFeatured } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ArticleStatus | "all">("all");
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (category !== "all" && a.category !== category) return false;
      if (query && !a.title.en.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [articles, query, status, category]);

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  return (
    <div>
      <PageHeader
        title="Manage News"
        subtitle={`${articles.length} total · ${filtered.length} shown`}
        action={
          <Link href="/admin/articles/new" className="btn-primary">
            <FileEdit className="h-4 w-4" /> New article
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="input !pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as ArticleStatus | "all")} className="input">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value as CategorySlug | "all")} className="input">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name.en}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No articles found" description="Try adjusting your filters." />
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-[rgb(var(--border))]">
            {filtered.map((a) => (
              <li key={a.id} className="flex items-center gap-4 p-3">
                <span className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg sm:block">
                  <Image src={a.image} alt="" fill sizes="80px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/articles/${a.id}`} className="block truncate font-medium hover:text-brand-600">
                    {a.title.en}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--text-muted))]">
                    <StatusPill status={a.status} />
                    <span className="chip border border-border">{categoryMap[a.category]?.name.en}</span>
                    {a.breaking && <span className="chip bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300">Breaking</span>}
                    {a.featured && <span className="chip bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">Featured</span>}
                    <span>{a.views.toLocaleString()} views</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconBtn label={a.breaking ? "Unmark breaking" : "Mark breaking"} active={a.breaking} onClick={() => toggleBreaking(a.id)}>
                    <Radio className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label={a.featured ? "Unmark featured" : "Mark featured"} active={a.featured} onClick={() => toggleFeatured(a.id)}>
                    <Star className="h-4 w-4" />
                  </IconBtn>
                  <Link href={`/admin/articles/${a.id}`} className="btn-ghost h-8 w-8 rounded-lg !px-0" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmId(a.id)}
                    className="btn-ghost h-8 w-8 rounded-lg !px-0 text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {confirmId && (
        <ConfirmDialog
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            deleteArticle(confirmId);
            setConfirmId(null);
          }}
        />
      )}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`btn-ghost h-8 w-8 rounded-lg !px-0 ${active ? "text-brand-600" : ""}`}
    >
      {children}
    </button>
  );
}
