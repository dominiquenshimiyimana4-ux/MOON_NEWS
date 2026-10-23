import type { Article } from "@/lib/types";
import { articles } from "@/lib/data/articles";
import { api, hasBackend, simulateLatency } from "./api";

const BOOKMARKS_KEY = "moon_news_bookmarks";
const HISTORY_KEY = "moon_news_history";
const NEWSLETTER_KEY = "moon_news_newsletter";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const userService = {
  // ---- Bookmarks / saved stories ----
  getBookmarks(): string[] {
    return readJson<string[]>(BOOKMARKS_KEY, []);
  },
  isSaved(slug: string): boolean {
    return this.getBookmarks().includes(slug);
  },
  toggleBookmark(slug: string): boolean {
    const current = this.getBookmarks();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [slug, ...current];
    writeJson(BOOKMARKS_KEY, next);
    if (hasBackend) {
      api.post("/api/bookmarks", { slug }).catch(() => undefined);
    }
    return next.includes(slug);
  },
  getSavedArticles(): Article[] {
    return this.getBookmarks()
      .map((slug) => articles.find((a) => a.slug === slug))
      .filter((a): a is Article => !!a);
  },

  // ---- Reading history ----
  getHistory(): string[] {
    return readJson<string[]>(HISTORY_KEY, []);
  },
  pushHistory(slug: string) {
    const next = [slug, ...this.getHistory().filter((s) => s !== slug)].slice(0, 30);
    writeJson(HISTORY_KEY, next);
  },
  getHistoryArticles(): Article[] {
    return this.getHistory()
      .map((slug) => articles.find((a) => a.slug === slug))
      .filter((a): a is Article => !!a);
  },

  // ---- Newsletter ----
  isSubscribed(email: string): boolean {
    return readJson<string[]>(NEWSLETTER_KEY, []).includes(email.toLowerCase());
  },
  async subscribe(email: string): Promise<{ ok: boolean; message: string }> {
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return { ok: false, message: "Please enter a valid email address." };
    }
    await simulateLatency(600);
    if (hasBackend) {
      try {
        await api.post("/api/newsletter", { email: clean });
      } catch {
        /* fall through to local confirmation in demo mode */
      }
    }
    const list = readJson<string[]>(NEWSLETTER_KEY, []);
    if (!list.includes(clean)) writeJson(NEWSLETTER_KEY, [clean, ...list]);
    return { ok: true, message: "You're subscribed to Moon News." };
  },
};
