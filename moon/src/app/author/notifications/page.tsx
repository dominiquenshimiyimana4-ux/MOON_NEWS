"use client";

import Link from "next/link";
import { Bell, BellOff, CheckCheck, Inbox, Trash2 } from "lucide-react";
import { useNotifications } from "@/lib/notifications/NotificationProvider";
import { useLanguage } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";
import { PageHeader, StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

export default function AuthorNotificationsPage() {
  const { items, unread, enabled, toggleCategory, markRead, markAllRead, clear } = useNotifications();
  const { locale } = useLanguage();

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread · editor decisions, mentions and story updates`}
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={markAllRead} className="btn-outline" disabled={items.length === 0}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
            <button
              type="button"
              onClick={clear}
              className="btn-ghost text-red-600"
              disabled={items.length === 0}
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Unread" value={unread} icon={<Bell className="h-5 w-5" />} accent="#4c2fd0" />
        <StatCard label="All notifications" value={items.length} icon={<Inbox className="h-5 w-5" />} accent="#2563eb" />
        <StatCard
          label="Story updates"
          value={items.filter((n) => n.type === "article").length}
          icon={<Inbox className="h-5 w-5" />}
          accent="#0d9488"
        />
        <StatCard
          label="Breaking"
          value={items.filter((n) => n.type === "breaking").length}
          icon={<Bell className="h-5 w-5" />}
          accent="#dc2626"
        />
      </div>

      {/* Category preferences */}
      <div className="card mb-6 p-5">
        <h3 className="mb-3 font-serif text-base font-bold">Notify me about</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(enabled) as (keyof typeof enabled)[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleCategory(key)}
              className={`chip border capitalize transition-colors ${enabled[key]
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<BellOff className="h-8 w-8" />}
          title="No notifications"
          description="You're all caught up. New activity on your stories will appear here."
        />
      ) : (
        <div className="card divide-y divide-[rgb(var(--border))] overflow-hidden">
          {items.map((n) => {
            const body = (
              <>
                <span className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.read
                        ? "bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))]"
                        : "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                      }`}
                  >
                    <Bell className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{n.title.en}</span>
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                    </span>
                    <span className="mt-0.5 block text-sm text-[rgb(var(--text-muted))]">{n.body.en}</span>
                    <span className="mt-1 block text-xs text-[rgb(var(--text-muted))]">{timeAgo(n.createdAt, "en")}</span>
                  </span>
                </span>
              </>
            );

            return (
              <div key={n.id} className="p-4">
                {n.href ? (
                  <Link
                    href={n.href}
                    onClick={() => markRead(n.id)}
                    className="block rounded-lg transition-colors hover:bg-[rgb(var(--bg-subtle))]"
                  >
                    {body}
                  </Link>
                ) : (
                  <button type="button" onClick={() => markRead(n.id)} className="block w-full text-left">
                    {body}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-[rgb(var(--text-muted))]">
        {locale === "rw"
          ? "Amatangazo abikwa mu buryo bwa demo; huza na API nyayo kugira abikwe."
          : "Notifications are stored locally for the demo. Connect your API to deliver them live."}
      </p>
    </div>
  );
}
