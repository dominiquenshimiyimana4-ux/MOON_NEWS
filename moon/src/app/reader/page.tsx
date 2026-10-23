"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Compass,
  History,
  Newspaper,
  Settings,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import type { Article } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { userService } from "@/lib/services/userService";
import { categories, categoryMap } from "@/lib/data/categories";
import { useLanguage } from "@/lib/i18n";
import { pick, formatDate } from "@/lib/utils";
import { PageHeader, StatCard, ChartCard } from "@/components/admin/StatCard";
import { BarChart } from "@/components/admin/Charts";
import { NewsCard } from "@/components/NewsCard";

/**
 * Reader dashboard.
 *
 * A personal, authenticated workspace for signed-in readers: what they saved,
 * what they have read, where their reading is concentrated, and quick ways back
 * into the newsroom. Everything here is derived from the reader's own local
 * library — no fabricated numbers.
 */
export default function ReaderDashboardPage() {
  const { user, hydrated } = useAuth();
  const { locale } = useLanguage();
  const [saved, setSaved] = useState<Article[]>([]);
  const [history, setHistory] = useState<Article[]>([]);

  useEffect(() => {
    if (!user) return;
    setSaved(userService.getSavedArticles());
    setHistory(userService.getHistoryArticles());
  }, [user]);

  if (!hydrated) {
    return <div className="text-sm text-[rgb(var(--text-muted))]">Loading your dashboard…</div>;
  }

  if (!user) return null;

  // Reading concentration by category (from the reader's own history).
  const byCategory = Object.entries(
    history.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([slug, value]) => ({
      label: categoryMap[slug as keyof typeof categoryMap]?.name.en ?? slug,
      value,
    }));

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Your personal reading dashboard."
        action={
          <Link href="/latest" className="btn-primary">
            <Compass className="h-4 w-4" /> Discover news
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Saved stories"
          value={saved.length}
          icon={<Bookmark className="h-5 w-5" />}
          accent="#4c2fd0"
        />
        <StatCard
          label="Stories read"
          value={history.length}
          icon={<History className="h-5 w-5" />}
          accent="#16a34a"
        />
        <StatCard
          label="Topics followed"
          value={byCategory.length}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="#2563eb"
        />
        <StatCard
          label="Member since"
          value={new Date(user.createdAt).getFullYear()}
          icon={<UserIcon className="h-5 w-5" />}
          accent="#0d9488"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <h2 className="mb-3 font-serif text-lg font-bold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/saved", label: "Saved Stories", desc: `${saved.length} bookmarked`, icon: Bookmark, accent: "#4c2fd0" },
            { href: "/reader/history", label: "Reading History", desc: `${history.length} articles`, icon: History, accent: "#16a34a" },
            { href: "/latest", label: "Discover", desc: "Browse the latest news", icon: Newspaper, accent: "#2563eb" },
            { href: "/settings", label: "Settings", desc: "Preferences & language", icon: Settings, accent: "#ca8a04" },
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

      {/* Reading trend + topic mix */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Where your reading is concentrated">
          {byCategory.length > 0 ? (
            <BarChart data={byCategory} />
          ) : (
            <p className="text-sm text-[rgb(var(--text-muted))]">
              Read a few articles and your topic mix will appear here.
            </p>
          )}
        </ChartCard>

        <ChartCard title="Explore a topic">
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 12).map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="chip border border-border transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />
                {pick(c.name, locale)}
              </Link>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Saved + history */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-base font-bold">Recently saved</h3>
            <Link href="/saved" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {saved.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">
              No saved stories yet.{" "}
              <Link href="/latest" className="font-semibold text-brand-600 hover:underline">
                Find something to read →
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {saved.slice(0, 2).map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-serif text-base font-bold">Continue reading</h3>
            <Link href="/reader/history" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {history.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[rgb(var(--text-muted))]">Articles you read will appear here.</p>
          ) : (
            <ul className="divide-y divide-[rgb(var(--border))]">
              {history.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/news/${a.category}/${a.slug}`}
                      className="block truncate text-sm font-medium hover:text-brand-600"
                    >
                      {pick(a.title, locale)}
                    </Link>
                    <span className="text-xs text-[rgb(var(--text-muted))]">
                      {categoryMap[a.category]?.name.en} · {formatDate(a.publishedAt, locale)}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))]" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
