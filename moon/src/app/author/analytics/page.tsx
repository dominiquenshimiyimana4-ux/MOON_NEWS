"use client";

import { useMemo } from "react";
import { Eye, MessageSquare, Share2, ThumbsUp } from "lucide-react";
import { useAuthor } from "@/lib/author/AuthorProvider";
import { categoryMap } from "@/lib/data/categories";
import { formatCount } from "@/lib/utils";
import { PageHeader, StatCard, ChartCard } from "@/components/admin/StatCard";
import { AreaChart, BarChart, DonutChart } from "@/components/admin/Charts";
import { EmptyState } from "@/components/EmptyState";

export default function AuthorAnalyticsPage() {
  const { myArticles, hydrated } = useAuthor();

  const published = myArticles.filter((a) => a.status === "published");
  const totalViews = myArticles.reduce((s, a) => s + a.views, 0);
  const totalShares = myArticles.reduce((s, a) => s + a.shares, 0);
  const totalComments = myArticles.reduce((s, a) => s + a.commentsCount, 0);

  // Reads per story (top performers first).
  const perStory = useMemo(
    () =>
      [...published]
        .sort((a, b) => b.views - a.views)
        .slice(0, 8)
        .map((a) => ({
          label: a.title.en.length > 14 ? a.title.en.slice(0, 14) + "…" : a.title.en,
          value: a.views,
        })),
    [published]
  );

  // Cumulative trend across published stories (oldest → newest).
  const trend = useMemo(
    () =>
      [...published]
        .sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt))
        .map((a) => ({
          label: new Date(a.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          value: a.views,
        })),
    [published]
  );

  const byCategory = useMemo(() => {
    const counts = published.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + a.views;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([slug, value]) => ({
        label: categoryMap[slug as keyof typeof categoryMap]?.name.en ?? slug,
        value,
        color: categoryMap[slug as keyof typeof categoryMap]?.color ?? "#888",
      }));
  }, [published]);

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  if (published.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="How your stories perform." />
        <EmptyState
          title="No analytics yet"
          description="Once your stories are published, readership and engagement metrics will appear here."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Analytics" subtitle="How your published stories perform." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total reads" value={formatCount(totalViews)} icon={<Eye className="h-5 w-5" />} delta="+8% this week" accent="#2563eb" />
        <StatCard label="Shares" value={formatCount(totalShares)} icon={<Share2 className="h-5 w-5" />} accent="#0d9488" />
        <StatCard label="Comments" value={formatCount(totalComments)} icon={<MessageSquare className="h-5 w-5" />} accent="#db2777" />
        <StatCard
          label="Avg. reads / story"
          value={formatCount(Math.round(totalViews / published.length))}
          icon={<ThumbsUp className="h-5 w-5" />}
          accent="#4c2fd0"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Reads over time">
          <AreaChart data={trend} />
        </ChartCard>
        <ChartCard title="Reads by story">
          <BarChart data={perStory} />
        </ChartCard>
        <ChartCard title="Reads by category" className="lg:col-span-2">
          <DonutChart data={byCategory} />
        </ChartCard>
      </div>

      {/* Leaderboard */}
      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h3 className="font-serif text-base font-bold">Top performing stories</h3>
        </div>
        <ul className="divide-y divide-[rgb(var(--border))]">
          {[...published]
            .sort((a, b) => b.views - a.views)
            .slice(0, 10)
            .map((a, i) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                <span className="w-5 shrink-0 text-sm font-bold text-[rgb(var(--text-muted))]">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{a.title.en}</span>
                  <span className="text-xs text-[rgb(var(--text-muted))]">
                    {categoryMap[a.category]?.name.en} · {formatCount(a.shares)} shares · {a.commentsCount} comments
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-bold">{formatCount(a.views)}</span>
                  <span className="text-xs text-[rgb(var(--text-muted))]">reads</span>
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
