"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/notifications/NotificationProvider";
import { useLanguage } from "@/lib/i18n";
import { pick, timeAgo } from "@/lib/utils";

const typeColor: Record<string, string> = {
  breaking: "bg-red-500",
  article: "bg-brand-500",
  sports: "bg-orange-500",
  technology: "bg-emerald-500",
};

export function NotificationBell() {
  const { items, unread, markRead, markAllRead, enabled } = useNotifications();
  const { locale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const visible = items.filter((n) => enabled[n.type]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost relative h-9 w-9 rounded-full !px-0"
        aria-label={t("nav.notifications")}
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-card-hover">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold">{t("nav.notifications")}</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                {locale === "rw" ? "Soma byose" : "Mark all read"}
              </button>
            )}
          </div>
          <ul className="thin-scroll max-h-96 overflow-y-auto">
            {visible.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                {locale === "rw" ? "Nta menyesha." : "No notifications."}
              </li>
            )}
            {visible.map((n) => {
              const inner = (
                <div className="flex gap-3 px-4 py-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${typeColor[n.type]}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                      {pick(n.title, locale)}
                    </p>
                    <p
                      className={`line-clamp-2 text-sm ${n.read ? "text-[rgb(var(--text-muted))]" : "font-medium"}`}
                    >
                      {pick(n.body, locale)}
                    </p>
                    <p className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">
                      {timeAgo(n.createdAt, locale)}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={n.id} className={`border-b border-border last:border-0 ${n.read ? "" : "bg-brand-500/5"}`}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                      className="block transition-colors hover:bg-[rgb(var(--bg-subtle))]"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="block w-full text-left transition-colors hover:bg-[rgb(var(--bg-subtle))]"
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border p-2">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-brand-600 hover:bg-[rgb(var(--bg-subtle))]"
            >
              {locale === "rw" ? "Genzura imenyesha" : "Notification settings"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
