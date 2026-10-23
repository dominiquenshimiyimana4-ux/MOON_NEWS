import type {
  Article,
  CategorySlug,
  Comment,
  LiveEvent,
  Locale,
  PhotoGallery,
  VideoItem,
} from "@/lib/types";
import { getArticles } from "@/lib/data/articleStore";
import { comments as seedComments } from "@/lib/data/comments";
import { videos } from "@/lib/data/videos";
import { galleries } from "@/lib/data/photos";
import { liveEvents } from "@/lib/data/live";
import { api, hasBackend, simulateLatency } from "./api";

export type SortKey = "newest" | "oldest" | "popular" | "relevance";

export interface NewsQuery {
  category?: CategorySlug;
  status?: Article["status"];
  featured?: boolean;
  breaking?: boolean;
  authorId?: string;
  tag?: string;
  search?: string;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function matchesQuery(a: Article, q: NewsQuery): boolean {
  if (q.status && a.status !== q.status) return false;
  if (q.category && a.category !== q.category) return false;
  if (q.featured !== undefined && a.featured !== q.featured) return false;
  if (q.breaking !== undefined && a.breaking !== q.breaking) return false;
  if (q.authorId && a.authorId !== q.authorId) return false;
  if (q.tag && !a.tags.includes(q.tag)) return false;
  if (q.search) {
    const needle = q.search.toLowerCase();
    const hay = [
      a.title.en,
      a.title.rw,
      a.excerpt.en,
      a.excerpt.rw,
      a.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

function sortArticles(list: Article[], sort: SortKey, search?: string): Article[] {
  const copy = [...list];
  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt)
      );
    case "popular":
      return copy.sort((a, b) => b.views - a.views);
    case "relevance":
      if (!search) return copy.sort((a, b) => b.views - a.views);
      return copy.sort((a, b) => relevance(b, search) - relevance(a, search));
    case "newest":
    default:
      return copy.sort(
        (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
      );
  }
}

function relevance(a: Article, search: string): number {
  const needle = search.toLowerCase();
  let score = 0;
  if (a.title.en.toLowerCase().includes(needle)) score += 10;
  if (a.title.rw.toLowerCase().includes(needle)) score += 10;
  if (a.tags.some((t) => t.includes(needle))) score += 5;
  if (a.excerpt.en.toLowerCase().includes(needle)) score += 2;
  return score;
}

/** Serves a query from the local article store (no backend required). */
function listLocal(q: NewsQuery): Paginated<Article> {
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 9;
  // Public queries only surface published articles unless a status is asked for.
  const status = q.status ?? "published";
  const filtered = getArticles().filter(
    (a) => a.status === status && matchesQuery(a, { ...q, status: undefined })
  );
  const sorted = sortArticles(filtered, q.sort ?? "newest", q.search);
  const start = (page - 1) * pageSize;
  return {
    items: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
  };
}

export const newsService = {
  async list(q: NewsQuery = {}): Promise<Paginated<Article>> {
    if (hasBackend) {
      // Prefer the real backend, but never break rendering if it is unreachable
      // (e.g. during static export when the API host is not running).
      try {
        return await api.get<Paginated<Article>>("/api/news", {
          ...q,
          page: q.page,
          pageSize: q.pageSize,
        } as Record<string, string | number | boolean | undefined>);
      } catch {
        return listLocal(q);
      }
    }
    await simulateLatency();
    return listLocal(q);
  },

  async getBySlug(slug: string): Promise<Article | undefined> {
    if (hasBackend) {
      return api.get<Article>(`/api/news/${slug}`).catch(() => undefined);
    }
    await simulateLatency(150);
    return getArticles().find((a) => a.slug === slug);
  },

  async getFeatured(limit = 5): Promise<Article[]> {
    const { items } = await this.list({ featured: true, sort: "newest" });
    return items.slice(0, limit);
  },

  async getBreaking(): Promise<Article[]> {
    return getArticles()
      .filter((a) => a.status === "published" && a.breaking)
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  },

  async getTrending(limit = 5): Promise<Article[]> {
    const { items } = await this.list({ sort: "popular", pageSize: 100 });
    return items.slice(0, limit);
  },

  async getRelated(article: Article, limit = 3): Promise<Article[]> {
    const all = getArticles();
    const sameCat = all.filter(
      (a) =>
        a.status === "published" &&
        a.id !== article.id &&
        a.category === article.category
    );
    const others = all.filter(
      (a) => a.status === "published" && a.id !== article.id && a.category !== article.category
    );
    return [...sameCat, ...others].slice(0, limit);
  },

  async getByCategory(
    category: CategorySlug,
    opts: { page?: number; pageSize?: number } = {}
  ): Promise<Paginated<Article>> {
    return this.list({ category, ...opts });
  },

  async getByAuthor(authorId: string): Promise<Article[]> {
    const { items } = await this.list({ authorId, pageSize: 100 });
    return items;
  },

  async search(query: string, q: NewsQuery = {}): Promise<Paginated<Article>> {
    return this.list({ ...q, search: query, sort: q.sort ?? "relevance" });
  },
};

export const contentService = {
  async videos(): Promise<VideoItem[]> {
    await simulateLatency(120);
    return videos;
  },
  async galleries(): Promise<PhotoGallery[]> {
    await simulateLatency(120);
    return galleries;
  },
  async live(): Promise<LiveEvent[]> {
    await simulateLatency(120);
    return liveEvents;
  },
};

export const commentService = {
  async listForArticle(articleId: string): Promise<Comment[]> {
    if (hasBackend) {
      return api
        .get<Comment[]>(`/api/comments?articleId=${articleId}`)
        .catch(() => seedComments.filter((c) => c.articleId === articleId));
    }
    await simulateLatency(120);
    return seedComments.filter((c) => c.articleId === articleId);
  },
};
