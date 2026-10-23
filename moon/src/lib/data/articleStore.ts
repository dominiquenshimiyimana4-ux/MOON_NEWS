import type { Article } from "@/lib/types";
import { articles as seedArticles } from "@/lib/data/articles";

/**
 * Single source of truth for the article set used by the whole app.
 *
 * The admin/author studio persists edits to localStorage (see AdminProvider).
 * The public site used to read only the static seed array, so author-written
 * stories never reached the homepage. Both now share the same list through this
 * module: any story published in the studio appears on the public pages.
 */
export const ARTICLES_STORAGE_KEY = "moon_news_admin_articles";

/** Reads the persisted article list, falling back to the seed data. */
export function readArticles(): Article[] {
  if (typeof window === "undefined") return seedArticles;
  try {
    const raw = window.localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (!raw) return seedArticles;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Article[]) : seedArticles;
  } catch {
    return seedArticles;
  }
}

let cache: Article[] = seedArticles;

/** Returns the current article list (seed data on the server). */
export function getArticles(): Article[] {
  if (typeof window !== "undefined") cache = readArticles();
  return cache;
}

/**
 * Refreshes the in-memory cache from localStorage and notifies subscribers.
 * AdminProvider calls this after it writes, so the public pages re-render with
 * the freshly published stories without a full reload.
 */
export function refreshArticles(): Article[] {
  cache = readArticles();
  for (const listener of listeners) listener(cache);
  return cache;
}

type Listener = (articles: Article[]) => void;
const listeners = new Set<Listener>();

/** Subscribe to article-store changes. Returns an unsubscribe function. */
export function subscribeArticles(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
