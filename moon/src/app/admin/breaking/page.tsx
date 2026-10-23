"use client";

import Link from "next/link";
import { ExternalLink, Radio } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { categoryMap } from "@/lib/data/categories";
import { timeAgo } from "@/lib/utils";
import { PageHeader } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

export default function AdminBreakingPage() {
  const { articles, hydrated, toggleBreaking } = useAdmin();

  const breaking = articles.filter((a) => a.breaking);
  const candidates = articles.filter((a) => !a.breaking && a.status === "published");

  return (
    <div>
      <PageHeader
        title="Breaking News"
        subtitle="Articles marked here appear in the scrolling breaking-news bar at the top of every page."
      />

      <div className="card mb-6 flex items-center gap-3 border-l-4 border-l-red-600 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15">
          <Radio className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">Breaking bar is {breaking.length > 0 ? "active" : "empty"}</p>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            {breaking.length > 0
              ? `${breaking.length} headline${breaking.length > 1 ? "s" : ""} currently rotating.`
              : "Mark a published article as breaking to start the bar."}
          </p>
        </div>
      </div>

      <h2 className="mb-3 font-serif text-lg font-bold">Currently breaking</h2>
      {!hydrated ? (
        <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>
      ) : breaking.length === 0 ? (
        <EmptyState
          icon={<Radio className="h-6 w-6" />}
          title="No breaking news"
          description="Nothing is marked as breaking right now."
        />
      ) : (
        <div className="card mb-8 divide-y divide-[rgb(var(--border))] overflow-hidden">
          {breaking.map((a) => (
            <Row key={a.id} id={a.id} title={a.title.en} category={categoryMap[a.category]?.name.en ?? ""} when={a.publishedAt} onToggle={toggleBreaking} active />
          ))}
        </div>
      )}

      <h2 className="mb-3 font-serif text-lg font-bold">Mark as breaking</h2>
      {candidates.length === 0 ? (
        <EmptyState title="No published articles" description="Publish an article to make it eligible for breaking news." />
      ) : (
        <div className="card divide-y divide-[rgb(var(--border))] overflow-hidden">
          {candidates.map((a) => (
            <Row key={a.id} id={a.id} title={a.title.en} category={categoryMap[a.category]?.name.en ?? ""} when={a.publishedAt} onToggle={toggleBreaking} />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  id,
  title,
  category,
  when,
  onToggle,
  active,
}: {
  id: string;
  title: string;
  category: string;
  when: string;
  onToggle: (id: string) => void;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">
          {category} · {timeAgo(when, "en")}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className={`chip shrink-0 border transition-colors ${
          active
            ? "border-red-600 bg-red-600 text-white"
            : "border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
        }`}
      >
        <Radio className="mr-1 h-3 w-3" />
        {active ? "Breaking" : "Mark breaking"}
      </button>
      <Link
        href={`/admin/articles/${id}`}
        className="btn-ghost h-8 w-8 shrink-0 rounded-lg !px-0"
        aria-label="Edit article"
      >
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
  );
}
