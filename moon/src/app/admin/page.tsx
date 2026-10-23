"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Eye,
  FileText,
  Megaphone,
  MessageSquare,
  Newspaper,
  Radio,
  Users,
  MailCheck,
  FileEdit,
  Image as ImageIcon,
  Wallet,
  Wifi,
} from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import { comments } from "@/lib/data/comments";
import { users } from "@/lib/data/admin";
import { subscribers, dailyViews, userGrowth } from "@/lib/data/admin";
import { categoryMap } from "@/lib/data/categories";
import { formatCount } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PageHeader, StatCard, ChartCard, StatusPill } from "@/components/admin/StatCard";
import { AreaChart, BarChart, DonutChart } from "@/components/admin/Charts";
import { UploadButton } from "@/components/admin/UploadButton";

export default function AdminDashboard() {
  const { articles, media, ads, hydrated, addMedia } = useAdmin();
  const { snapshot, onlineNow } = useAnalytics("7d");
  const router = useRouter();

  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status === "draft");
  const totalViews = articles.reduce((s, a) => s + a.views, 0);
  const breaking = articles.filter((a) => a.breaking);
  const stats = snapshot?.stats;

  const catCounts = Object.entries(
    articles.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, value]) => ({
      label: categoryMap[slug as keyof typeof categoryMap]?.name.en ?? slug,
      value,
      color: categoryMap[slug as keyof typeof categoryMap]?.color ?? "#888",
    }));

  if (!hydrated) {
    return <div className="text-sm text-[rgb(var(--text-muted))]">Loading dashboard…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your newsroom activity."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <UploadButton
              label="Upload"
              onUploaded={(file) => {
                addMedia({ name: file.name, url: file.url, type: file.type, size: file.size, alt: file.alt });
                router.push("/admin/media");
              }}
            />
            <Link href="/admin/articles/new" className="btn-primary">
              <FileEdit className="h-4 w-4" /> New article
            </Link>
          </div>
        }
      />

      {/* Visitor analytics — real numbers from the analytics backend */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total visitors"
          value={stats ? stats.totalVisitors.toLocaleString("en-US") : "—"}
          icon={<Users className="h-5 w-5" />}
          delta={stats ? `+${stats.growthToday.toLocaleString("en-US")} today` : undefined}
          accent="#4c2fd0"
        />
        <StatCard
          label="Visitors today"
          value={stats ? stats.visitorsToday.toLocaleString("en-US") : "—"}
          icon={<Activity className="h-5 w-5" />}
          accent="#16a34a"
        />
        <StatCard
          label="Online now"
          value={onlineNow.toLocaleString("en-US")}
          icon={<Wifi className="h-5 w-5" />}
          accent="#0d9488"
        />
        <StatCard
          label="Visitors this week"
          value={stats ? stats.visitorsWeek.toLocaleString("en-US") : "—"}
          icon={<BarChart3 className="h-5 w-5" />}
          delta={stats ? `${stats.growthPct >= 0 ? "+" : ""}${stats.growthPct}% vs yesterday` : undefined}
          accent="#2563eb"
        />
      </div>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total articles" value={articles.length} icon={<FileText className="h-5 w-5" />} accent="#4c2fd0" />
        <StatCard label="Published" value={published.length} icon={<Newspaper className="h-5 w-5" />} accent="#16a34a" />
        <StatCard label="Drafts" value={drafts.length} icon={<FileEdit className="h-5 w-5" />} accent="#ca8a04" />
        <StatCard label="Total views" value={formatCount(totalViews)} icon={<Eye className="h-5 w-5" />} delta="+12% this week" accent="#2563eb" />
        <StatCard label="Comments" value={comments.length} icon={<MessageSquare className="h-5 w-5" />} accent="#db2777" />
        <StatCard label="Registered users" value={users.length} icon={<Users className="h-5 w-5" />} accent="#5f46e8" />
        <StatCard label="Subscribers" value={subscribers.length} icon={<MailCheck className="h-5 w-5" />} accent="#0d9488" />
        <StatCard
          label="Breaking news"
          value={breaking.length > 0 ? "Active" : "Off"}
          icon={<Radio className="h-5 w-5" />}
          accent="#dc2626"
        />
      </div>

      {/* Manage quick links */}
      <div className="mt-6">
        <h2 className="mb-3 font-serif text-lg font-bold">Manage</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/admin/articles", label: "Manage News", desc: "Create, edit, publish & schedule articles", icon: FileText, accent: "#4c2fd0", count: `${articles.length} articles` },
            { href: "/admin/users", label: "Manage Users", desc: "Roles, staff accounts & subscribers", icon: Users, accent: "#5f46e8", count: `${users.length} users` },
            { href: "/admin/comments", label: "Manage Feedback", desc: "Approve or remove reader comments", icon: MessageSquare, accent: "#db2777", count: `${comments.length} comments` },
            { href: "/admin/media", label: "Manage Media", desc: "Upload & organise images, videos and article files", icon: ImageIcon, accent: "#0d9488", count: `${media.length} files` },
            { href: "/admin/breaking", label: "Breaking News", desc: "Control the breaking-news bar", icon: Radio, accent: "#dc2626", count: breaking.length > 0 ? "Active" : "Off" },
            { href: "/admin/advertising", label: "Advertiser Dashboard", desc: "Campaigns, spend & ad performance", icon: Megaphone, accent: "#7c3aed", count: `${ads.length} campaigns` },
            { href: "/admin/ad-review", label: "Ad Review", desc: "Approve or reject submitted campaigns", icon: Megaphone, accent: "#db2777", count: `${ads.filter((a) => a.status === "pending").length} pending` },
            { href: "/admin/revenue", label: "Advertising Revenue", desc: "Payments, revenue & ad delivery", icon: Wallet, accent: "#16a34a", count: "Revenue" },
            { href: "/admin/analytics", label: "Visitor Analytics", desc: "Traffic, online users, top pages & sources", icon: BarChart3, accent: "#0d9488", count: stats ? `${stats.totalVisitors.toLocaleString("en-US")} visitors` : "Live traffic" },
            { href: "/admin/articles/new", label: "New Article", desc: "Write and publish a new story", icon: FileEdit, accent: "#ca8a04", count: "Start writing" },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="card group flex items-start gap-4 p-5 transition-shadow hover:shadow-lg"
            >
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
                <span className="mt-1 block text-xs font-medium" style={{ color: c.accent }}>{c.count}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Views per day">
          <AreaChart data={dailyViews.map((d) => ({ label: d.day, value: d.views }))} />
        </ChartCard>
        <ChartCard title="Articles published">
          <BarChart data={dailyViews.map((d) => ({ label: d.day, value: d.articles }))} color="#e3a637" />
        </ChartCard>
        <ChartCard title="Popular categories">
          <DonutChart data={catCounts} />
        </ChartCard>
        <ChartCard title="User growth">
          <AreaChart data={userGrowth.map((d) => ({ label: d.month, value: d.users }))} color="#16a34a" />
        </ChartCard>
      </div>

      {/* Recent articles */}
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-serif text-base font-bold">Recent articles</h3>
          <Link href="/admin/articles" className="text-sm font-semibold text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-[rgb(var(--border))]">
          {articles.slice(0, 6).map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-5 py-3">
              <span className="min-w-0 flex-1">
                <Link href={`/admin/articles/${a.id}`} className="block truncate text-sm font-medium hover:text-brand-600">
                  {a.title.en}
                </Link>
                <span className="text-xs text-[rgb(var(--text-muted))]">
                  {categoryMap[a.category]?.name.en} · {formatCount(a.views)} views
                </span>
              </span>
              <StatusPill status={a.status} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

