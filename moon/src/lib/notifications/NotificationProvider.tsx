"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Notification } from "@/lib/types";
import { notifications as seed } from "@/lib/data/notifications";

type NotifCategory = Notification["type"];

interface NotificationContextValue {
  items: Notification[];
  unread: number;
  enabled: Record<NotifCategory, boolean>;
  toggleCategory: (c: NotifCategory) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

const ENABLED_KEY = "moon_news_notif_prefs";

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const defaultEnabled: Record<NotifCategory, boolean> = {
  breaking: true,
  article: true,
  sports: true,
  technology: false,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [enabled, setEnabled] = useState<Record<NotifCategory, boolean>>(defaultEnabled);

  useEffect(() => {
    setItems(seed);
    try {
      const raw = window.localStorage.getItem(ENABLED_KEY);
      if (raw) setEnabled({ ...defaultEnabled, ...JSON.parse(raw) });
    } catch {
      /* ignore malformed prefs */
    }
  }, []);

  const toggleCategory = useCallback((c: NotifCategory) => {
    setEnabled((prev) => {
      const next = { ...prev, [c]: !prev[c] };
      window.localStorage.setItem(ENABLED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      items,
      unread: items.filter((n) => !n.read && enabled[n.type]).length,
      enabled,
      toggleCategory,
      markRead,
      markAllRead,
      clear,
    }),
    [items, enabled, toggleCategory, markRead, markAllRead, clear]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
