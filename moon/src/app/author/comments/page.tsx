"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, MessageSquare, Search } from "lucide-react";
import { comments as seedComments } from "@/lib/data/comments";
import { useAuthor } from "@/lib/author/AuthorProvider";
import { articlePath, formatCount, timeAgo } from "@/lib/utils";
import { PageHeader, StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

export default function AuthorCommentsPage() {
  const { myArticles, hydrated } = useAuthor();
  const [query, setQuery] = useState("");

  const myArticleIds = useMemo(() => new Set(myArticles.map((a) => a.id)), [myArticles]);

  // Reader feedback on this author's stories.
  const rows = useMemo(
    () => seedComments.filter((c) => myArticleIds.has(c.articleId)),
    [myArticleIds]
  );

  const visible = useMemo(
    () =>
      rows.filter(
        (c) =>
          !query ||
          c.content.toLowerCase().includes(query.toLowerCase()) ||
          c.authorName.toLowerCase().includes(query.toLowerCase())
      ),
    [rows, query]
  );

  const totalLikes = rows.reduce((s, c) => s + c.likes, 0);
  const replies = rows.filter((c) => c.parentId).length;

  const articleFor = (id: string) => myArticles.find((a) => a.id === id);

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  return (
    <div>
      <PageHeader
        title="Comments"
        subtitle={`Reader feedback on your stories · ${rows.length} total`}
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

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total comments" value={rows.length} icon={<MessageSquare className="h-5 w-5" />} accent="#db2777" />
        <StatCard label="Reader likes" value={formatCount(totalLikes)} icon={<MessageSquare className="h-5 w-5" />} accent="#4c2fd0" />
        <StatCard label="Replies" value={replies} icon={<MessageSquare className="h-5 w-5" />} accent="#0d9488" />
        <StatCard
          label="Stories with feedback"
          value={new Set(rows.map((r) => r.articleId)).size}
          icon={<MessageSquare className="h-5 w-5" />}
          accent="#ca8a04"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No comments yet"
          description={
            rows.length === 0
              ? "Reader feedback on your published stories will show up here."
              : "Try adjusting your search."
          }
        />
      ) : (
        <div className="card divide-y divide-[rgb(var(--border))] overflow-hidden">
          {visible.map((c) => {
            const a = articleFor(c.articleId);
            return (
              <div key={c.id} className="flex gap-3 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.authorAvatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-semibold">{c.authorName}</span>
                    {c.parentId && (
                      <span className="chip bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))]">reply</span>
                    )}
                    <span className="text-xs text-[rgb(var(--text-muted))]">· {timeAgo(c.createdAt, "en")}</span>
                    <span className="text-xs text-[rgb(var(--text-muted))]">· {c.likes} likes</span>
                  </div>
                  <p className="mt-1 text-sm text-[rgb(var(--text))]">{c.content}</p>
                  {a && (
                    <Link
                      href={articlePath(a)}
                      target="_blank"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> {a.title.en}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
