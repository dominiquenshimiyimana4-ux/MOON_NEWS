"use client";

import Link from "next/link";
import { Bell, Newspaper } from "lucide-react";
import { useNotifications } from "@/lib/notifications/NotificationProvider";
import { useLanguage } from "@/lib/i18n";
import { pick, timeAgo, cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

/**
 * Reader notifications — breaking-news alerts and story updates relevant to
 * this reader. Backed by the shared NotificationProvider.
 */
export default function ReaderNotificationsPage() {
  const { items: notifications, markRead, markAllRead } = useNotifications();
  const { locale } = useLanguage();

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={locale === "rw" ? "Amakuru yihutirwa n'ibimenyetso." : "Breaking news alerts and updates."}
        action={
          notifications.some((n) => !n.read) ? (
            <button type="button" onClick={markAllRead} className="btn-outline">
              Mark all as read
            </button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title={locale === "rw" ? "Nta menyetso." : "No notifications yet."}
          description={
            locale === "rw"
              ? "Imenyesha rishya rizagaragara hano."
              : "Alerts about breaking stories will appear here."
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-[rgb(var(--border))]">
            {notifications.map((n) => (
              <li key={n.id}>
                <div
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 transition-colors",
                    !n.read && "bg-brand-50/60 dark:bg-brand-500/5"
                  )}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/15">
                    <Newspaper className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{pick(n.title, locale)}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-[rgb(var(--text-muted))]">
                      {pick(n.body, locale)}
                    </p>
                    <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{timeAgo(n.createdAt, locale)}</p>
                  </div>
                  {n.href && (
                    <Link
                      href={n.href}
                      onClick={() => markRead(n.id)}
                      className="shrink-0 text-sm font-semibold text-brand-600 hover:underline"
                    >
                      {locale === "rw" ? "Reba" : "View"}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
