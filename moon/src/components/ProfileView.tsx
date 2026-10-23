"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bookmark, History, LogOut, Settings } from "lucide-react";
import type { Article } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { roleLabels } from "@/lib/services/authService";
import { userService } from "@/lib/services/userService";
import { useLanguage } from "@/lib/i18n";
import { NewsCard } from "./NewsCard";
import { EmptyState } from "./EmptyState";

export function ProfileView() {
  const { user, hydrated, logout } = useAuth();
  const { locale } = useLanguage();
  const router = useRouter();
  const [saved, setSaved] = useState<Article[]>([]);
  const [history, setHistory] = useState<Article[]>([]);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  useEffect(() => {
    if (user) {
      setSaved(userService.getSavedArticles());
      setHistory(userService.getHistoryArticles());
    }
  }, [user]);

  if (!hydrated || !user) {
    return <div className="container-page py-16 text-center text-sm text-[rgb(var(--text-muted))]">Loading…</div>;
  }

  return (
    <div className="container-page py-8">
      {/* Profile header */}
      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-700 to-accent-500" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <span className="relative h-20 w-20 overflow-hidden rounded-full bg-brand-100 ring-4 ring-[rgb(var(--surface))]">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill sizes="80px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <div className="sm:pb-1">
              <h1 className="font-serif text-2xl font-extrabold">{user.name}</h1>
              <p className="text-sm text-[rgb(var(--text-muted))]">{user.email}</p>
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                {roleLabels[user.role]}
              </span>
              <Link href="/settings" className="btn-outline h-9 !py-0">
                <Settings className="h-4 w-4" /> <span className="hidden sm:inline">{locale === "rw" ? "Igenamiterere" : "Settings"}</span>
              </Link>
              <button type="button" onClick={logout} className="btn-ghost h-9 !py-0 text-red-600">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* Saved */}
        <section className="lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-extrabold">
            <Bookmark className="h-5 w-5 text-brand-600" />
            {locale === "rw" ? "Inkuru zabitswe" : "Saved stories"}
            <span className="text-sm font-medium text-[rgb(var(--text-muted))]">({saved.length})</span>
          </h2>
          {saved.length === 0 ? (
            <EmptyState title={locale === "rw" ? "Nta nkuru zabitswe." : "No saved stories yet."} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {saved.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          )}
        </section>

        {/* Reading history */}
        <aside>
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-extrabold">
            <History className="h-5 w-5 text-brand-600" />
            {locale === "rw" ? "Byasomwe vuba" : "Reading history"}
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">
              {locale === "rw" ? "Nta nkuru urasoma." : "Articles you read will appear here."}
            </p>
          ) : (
            <ol className="space-y-3">
              {history.slice(0, 8).map((a) => (
                <li key={a.id}>
                  <Link href={`/news/${a.category}/${a.slug}`} className="group flex gap-3">
                    <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image src={a.image} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                    <span className="line-clamp-2 text-sm font-medium group-hover:text-brand-600">
                      {locale === "rw" ? a.title.rw : a.title.en}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ProfileView;
