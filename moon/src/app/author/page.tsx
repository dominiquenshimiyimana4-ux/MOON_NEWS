"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Eye,
  FileEdit,
  FileText,
  MessageSquare,
  PenSquare,
  ThumbsDown,
  Timer,
  Newspaper,
  TrendingUp,
} from "lucide-react";
import { useAuthor } from "@/lib/author/AuthorProvider";
import { categoryMap } from "@/lib/data/categories";
import { comments } from "@/lib/data/comments";
import { formatCount, timeAgo } from "@/lib/utils";
import { PageHeader, StatCard, ChartCard, StatusPill } from "@/components/admin/StatCard";
import { AreaChart, BarChart } from "@/components/admin/Charts";

export default function AuthorDashboardPage() {
  const { myArticles, profile, hydrated } = useAuthor();

  const published = myArticles.filter((a) => a.status === "published");
  const drafts = myArticles.filter((a) => a.status === "draft");
  const pending = myArticles.filter((a) => a.status === "pending");
  const rejected = myArticles.filter((a) => a.status === "rejected");

  const totalViews = myArticles.reduce((s, a) => s + a.views, 0);
  const totalComments = myArticles.reduce((s, a) => s + a.commentsCount, 0);

  // Views over the last 7 published stories (proxy for a performance trend).
  const viewsSeries = published
    .slice(0, 7)
    .reverse()
    .map((a) => ({ label: a.title.en.length > 12 ? a.title.en.slice(0, 12) + "…" : a.title.en, value: a.views }));

  if (!hydrated) {
    return <div className="text-sm text-[rgb(var(--text-muted))]">Loading your studio…</div>;
  }

  return (
    <div>
      <PageHeader
        title={`Welcome${profile ? `, ${profile.name.split(" ")[0]}` : ""}`}
        subtitle="Your writing workspace at a glance."
        action={
          <Link href="/author/create" className="btn-primary">
            <PenSquare className="h-4 w-4" /> Create article
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Published"
          value={published.length}
          icon={<Newspaper className="h-5 w-5" />}
          accent="#16a34a"
        />
        <StatCard label="Drafts" value={drafts.length} icon={<FileEdit className="h-5 w-5" />} accent="#ca8a04" />
        <StatCard label="Pending review" value={pending.length} icon={<Timer className="h-5 w-5" />} accent="#4f46e5" />
        <StatCard
          label="Rejected"
          value={rejected.length}
          icon={<ThumbsDown className="h-5 w-5" />}
          accent="#dc2626"
        />
        <StatCard
          label="Total reads"
          value={formatCount(totalViews)}
          icon={<Eye className="h-5 w-5" />}
          delta="+8% this week"
          accent="#2563eb"
        />
        <StatCard
          label="Comments"
          value={formatCount(totalComments)}
          icon={<MessageSquare className="h-5 w-5" />}
          accent="#db2777"
        />
        <StatCard
          label="Stories"
          value={myArticles.length}
          icon={<FileText className="h-5 w-5" />}
          accent="#4c2fd0"
        />
        <StatCard
          label="Avg. reads"
          value={published.length ? formatCount(Math.round(totalViews / published.length)) : "0"}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="#0d9488"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <h2 className="mb-3 font-serif text-lg font-bold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/author/create", label: "Create Article", desc: "Start a new story from scratch", icon: PenSquare, accent: "#4c2fd0" },
            { href: "/author/articles?status=draft", label: "My Drafts", desc: `${drafts.length} stories in progress`, icon: FileEdit, accent: "#ca8a04" },
            { href: "/author/articles?status=pending", label: "Pending Review", desc: `${pending.length} awaiting an editor`, icon: Timer, accent: "#4f46e5" },
            { href: "/author/media", label: "Media Library", desc: "Images and videos for your stories", icon: FileText, accent: "#0d9488" },
            { href: "/author/analytics", label: "Analytics", desc: "Reads, engagement and trends", icon: TrendingUp, accent: "#2563eb" },
            { href: "/author/notifications", label: "Notifications", desc: "Review decisions and mentions", icon: Bell, accent: "#db2777" },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="card group flex items-start gap-4 p-5 transition-shadow hover:shadow-lg">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${c.accent}1a`, color: c.accent }}
              >
                <c.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-semibold">
                  {c.label}
                  <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
                <span className="mt-0.5 block text-sm text-[rgb(var(--text-muted))]">{c.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Reads by story">
          {viewsSeries.length > 0 ? (
            <AreaChart data={viewsSeries} />
          ) : (
            <p className="text-sm text-[rgb(var(--text-muted))]">Publish a story to see readership trends.</p>
          )}
        </ChartCard>
        <ChartCard title="Stories by category">
          <BarChart
            data={Object.entries(
              myArticles.reduce<Record<string, number>>((acc, a) => {
                acc[a.category] = (acc[a.category] ?? 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([slug, value]) => ({
                label: categoryMap[slug as keyof typeof categoryMap]?.name.en ?? slug,
                value,
              }))}
            color="#e3a637"
          />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Recent stories */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-serif text-base font-bold">Recent stories</h3>
            <Link href="/author/articles" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {myArticles.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[rgb(var(--text-muted))]">
              You have no stories yet. <Link href="/author/create" className="font-semibold text-brand-600 hover:underline">Write your first one →</Link>
            </p>
          ) : (
            <ul className="divide-y divide-[rgb(var(--border))]">
              {myArticles.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="min-w-0 flex-1">
                    <Link href={`/author/articles/${a.id}`} className="block truncate text-sm font-medium hover:text-brand-600">
                      {a.title.en}
                    </Link>
                    <span className="text-xs text-[rgb(var(--text-muted))]">
                      {categoryMap[a.category]?.name.en} · {a.status === "published" ? `${formatCount(a.views)} reads` : timeAgo(a.updatedAt ?? a.publishedAt, "en")}
                    </span>
                  </span>
                  <StatusPill status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Feedback awaiting reply */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-serif text-base font-bold">Latest reader feedback</h3>
            <Link href="/author/comments" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[rgb(var(--border))]">
            {comments.slice(0, 5).map((c) => (
              <li key={c.id} className="flex gap-3 px-5 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.authorAvatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">
                    <span className="font-semibold">{c.authorName}</span>{" "}
                    <span className="text-xs text-[rgb(var(--text-muted))]">· {timeAgo(c.createdAt, "en")}</span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-sm text-[rgb(var(--text-muted))]">{c.content}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
