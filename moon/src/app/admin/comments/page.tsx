"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, MessageSquare, Search, Trash2 } from "lucide-react";
import { comments as seedComments } from "@/lib/data/comments";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { timeAgo } from "@/lib/utils";
import { PageHeader } from "@/components/admin/StatCard";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";

export default function AdminCommentsPage() {
  const { articles, hydrated } = useAdmin();
  const [rows, setRows] = useState(seedComments);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const titleFor = (id: string) => articles.find((a) => a.id === id)?.title.en ?? "Article";
  const pathFor = (id: string) => {
    const a = articles.find((x) => x.id === id);
    return a ? `/news/${a.category}/${a.slug}` : "#";
  };

  const visible = useMemo(
    () =>
      rows.filter(
        (c) =>
          !hidden.has(c.id) &&
          (!query ||
            c.content.toLowerCase().includes(query.toLowerCase()) ||
            c.authorName.toLowerCase().includes(query.toLowerCase()))
      ),
    [rows, hidden, query]
  );

  const pending = rows.filter((c) => !hidden.has(c.id)).length;

  const approve = (id: string) => setHidden((s) => new Set(s).add(id));
  const remove = (id: string) => setRows((r) => r.filter((c) => c.id !== id));

  return (
    <div>
      <PageHeader
        title="Manage Feedback"
        subtitle={`${pending} active · ${rows.length} total`}
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search comments…"
              className="input !pl-9"
            />
          </div>
        }
      />

      {!hydrated ? (
        <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>
      ) : visible.length === 0 ? (
        <EmptyState title="No comments found" description="Try adjusting your search." />
      ) : (
        <div className="card divide-y divide-[rgb(var(--border))] overflow-hidden">
          {visible.map((c) => (
            <div key={c.id} className="flex gap-3 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.authorAvatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold">{c.authorName}</span>
                  {c.parentId && <span className="chip bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))]">reply</span>}
                  <span className="text-xs text-[rgb(var(--text-muted))]">· {timeAgo(c.createdAt, "en")}</span>
                  <span className="text-xs text-[rgb(var(--text-muted))]">· {c.likes} likes</span>
                </div>
                <p className="mt-1 text-sm text-[rgb(var(--text))]">{c.content}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link
                    href={pathFor(c.articleId)}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> {titleFor(c.articleId)}
                  </Link>
                  <span className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => approve(c.id)}
                      className="btn-ghost !px-2 text-xs text-emerald-600"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(c.id)}
                      className="btn-ghost !px-2 text-xs text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete comment?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            remove(confirmId);
            setConfirmId(null);
          }}
        />
      )}

      <p className="mt-4 flex items-center gap-2 text-xs text-[rgb(var(--text-muted))]">
        <MessageSquare className="h-3.5 w-3.5" />
        Moderation is stored locally for the demo. Connect <code>POST /api/comments</code> to persist.
      </p>
    </div>
  );
}
