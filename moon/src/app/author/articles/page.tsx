"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Eye, Pencil, PenSquare, Search, Send, Trash2, UploadCloud } from "lucide-react";
import type { ArticleStatus } from "@/lib/types";
import { useAuthor } from "@/lib/author/AuthorProvider";
import { categoryMap } from "@/lib/data/categories";
import { articlePath, formatCount, timeAgo } from "@/lib/utils";
import { PageHeader, StatusPill } from "@/components/admin/StatCard";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";

type TabKey = ArticleStatus | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "pending", label: "Pending Review" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const EMPTY_COPY: Record<TabKey, { title: string; description: string }> = {
  published: { title: "No published stories yet", description: "Stories approved by an editor will appear here." },
  draft: { title: "No drafts", description: "Start a new article and save it as a draft to see it here." },
  pending: { title: "Nothing awaiting review", description: "Submitted stories wait here until an editor approves them." },
  rejected: { title: "No rejected stories", description: "If an editor sends a story back, you'll find it here with notes." },
  all: { title: "No articles yet", description: "Write your first story to get started." },
  scheduled: { title: "No scheduled stories", description: "Scheduled stories will appear here." },
};

export default function MyArticlesPage() {
  const { myArticles, hydrated, deleteArticle, submitForReview, saveDraft, publish } = useAuthor();
  const searchParams = useSearchParams();
  const initial = (searchParams.get("status") as TabKey | null) ?? "published";

  const [tab, setTab] = useState<TabKey>(TABS.some((t) => t.key === initial) ? initial : "published");
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const s = searchParams.get("status") as TabKey | null;
    if (s && TABS.some((t) => t.key === s)) setTab(s);
  }, [searchParams]);

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: myArticles.length, published: 0, draft: 0, pending: 0, rejected: 0, scheduled: 0 };
    for (const a of myArticles) c[a.status]++;
    return c;
  }, [myArticles]);

  const filtered = useMemo(
    () =>
      myArticles.filter((a) => {
        if (tab !== "all" && a.status !== tab) return false;
        if (query && !a.title.en.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [myArticles, tab, query]
  );

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  return (
    <div>
      <PageHeader
        title="My Articles"
        subtitle={`${myArticles.length} stories across your workspace`}
        action={
          <Link href="/author/create" className="btn-primary">
            <PenSquare className="h-4 w-4" /> New article
          </Link>
        }
      />

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`chip border transition-colors ${tab === t.key
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
              }`}
          >
            {t.label}
            <span className={`ml-1.5 ${tab === t.key ? "text-white/80" : "text-[rgb(var(--text-muted))]"}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your articles…"
          className="input !pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={EMPTY_COPY[tab].title}
          description={EMPTY_COPY[tab].description}
          action={
            tab !== "published" ? (
              <Link href="/author/create" className="btn-primary">
                <PenSquare className="h-4 w-4" /> Create article
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-[rgb(var(--border))]">
            {filtered.map((a) => (
              <li key={a.id} className="flex items-center gap-4 p-3">
                <span className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg sm:block">
                  <Image src={a.image} alt="" fill sizes="80px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/author/articles/${a.id}`} className="block truncate font-medium hover:text-brand-600">
                    {a.title.en}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--text-muted))]">
                    <StatusPill status={a.status} />
                    <span className="chip border border-border">{categoryMap[a.category]?.name.en}</span>
                    <span>
                      {a.status === "published"
                        ? `${formatCount(a.views)} reads · ${timeAgo(a.publishedAt, "en")}`
                        : `Updated ${timeAgo(a.updatedAt ?? a.publishedAt, "en")}`}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {a.status === "published" && (
                    <Link
                      href={articlePath(a)}
                      target="_blank"
                      className="btn-ghost h-8 w-8 rounded-lg !px-0"
                      aria-label="View live"
                      title="View live"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  )}
                  {(a.status === "draft" || a.status === "rejected" || a.status === "pending") && (
                    <>
                      <button
                        type="button"
                        onClick={() => publish(a.id)}
                        className="btn-ghost h-8 rounded-lg !px-2 text-xs text-emerald-600"
                        title="Publish now"
                      >
                        <UploadCloud className="h-4 w-4" /> Publish
                      </button>
                      {(a.status === "draft" || a.status === "rejected") && (
                        <button
                          type="button"
                          onClick={() => submitForReview(a.id)}
                          className="btn-ghost h-8 rounded-lg !px-2 text-xs text-brand-600"
                          title="Submit for review"
                        >
                          <Send className="h-4 w-4" /> Submit
                        </button>
                      )}
                    </>
                  )}
                  {a.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => saveDraft(a.id)}
                      className="btn-ghost h-8 rounded-lg !px-2 text-xs"
                      title="Move back to drafts"
                    >
                      Unsubmit
                    </button>
                  )}
                  <Link href={`/author/articles/${a.id}`} className="btn-ghost h-8 w-8 rounded-lg !px-0" aria-label="Edit">
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
          title="Delete article?"
          message="This removes the story from your workspace. This action cannot be undone."
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
