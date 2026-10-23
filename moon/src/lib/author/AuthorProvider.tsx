"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Article, Author, User } from "@/lib/types";
import { authors, authorMap } from "@/lib/data/authors";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAdmin, type ArticleDraft } from "@/lib/admin/AdminProvider";

/**
 * Author-scoped view over the shared article store. The author dashboard and the
 * admin panel read/write the same articles (persisted under the same key by
 * AdminProvider), so a story submitted here shows up for editors there.
 */

interface AuthorContextValue {
  /** The staff member currently logged in. */
  user: User | null;
  /** The public author profile this user writes as. */
  profile: Author | null;
  hydrated: boolean;
  /** Articles owned by the current author, newest first. */
  myArticles: Article[];
  createArticle: (draft: ArticleDraft) => Article | null;
  updateArticle: (id: string, patch: Partial<Article> & ArticleDraft) => void;
  deleteArticle: (id: string) => void;
  /** Move a draft/pending/rejected story into the review queue. */
  submitForReview: (id: string) => void;
  /** Save an article back to draft. */
  saveDraft: (id: string) => void;
  /** Publish a story immediately so it appears on the public site. */
  publish: (id: string) => void;
}

const AuthorContext = createContext<AuthorContextValue | undefined>(undefined);

/** Resolves the logged-in user to an author profile, matching by email then name. */
export function resolveAuthor(user: User | null): Author | null {
  if (!user) return null;
  const byEmail = authors.find(
    (a) => a.social.email?.toLowerCase() === user.email.toLowerCase()
  );
  if (byEmail) return byEmail;
  const byName = authors.find((a) => a.name.toLowerCase() === user.name.toLowerCase());
  if (byName) return byName;
  // Registered demo users may not exist in the directory yet — fall back to a
  // deterministic profile so their dashboard still has an identity.
  return authorMap[authorForUser(user)];
}

/** Stable author id for a user with no directory entry (e.g. a fresh sign-up). */
function authorForUser(user: User): string {
  let hash = 0;
  for (let i = 0; i < user.email.length; i++) hash = (hash * 31 + user.email.charCodeAt(i)) >>> 0;
  return authors[hash % authors.length].id;
}

export function AuthorProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const {
    articles,
    hydrated: storeHydrated,
    createArticle: createArticleInStore,
    updateArticle,
    deleteArticle,
  } = useAdmin();

  const profile = useMemo(() => resolveAuthor(user), [user]);

  // Authors see their own stories. Editors/admins get everything so they can
  // review what the team submitted.
  const myArticles = useMemo(() => {
    const mine = !profile
      ? []
      : articles.filter((a) => a.authorId === profile.id);
    return [...mine].sort(
      (a, b) => +new Date(b.updatedAt ?? b.publishedAt) - +new Date(a.updatedAt ?? a.publishedAt)
    );
  }, [articles, profile]);

  const value = useMemo<AuthorContextValue>(
    () => ({
      user,
      profile,
      hydrated: authHydrated && storeHydrated,
      myArticles,
      createArticle: (draft) => {
        if (!profile) return null;
        // Always stamp the story with the signed-in author.
        return createArticleInStore({ ...draft, authorId: profile.id });
      },
      updateArticle,
      deleteArticle,
      submitForReview: (id) => updateArticle(id, { status: "pending" } as never),
      saveDraft: (id) => updateArticle(id, { status: "draft" } as never),
      publish: (id) =>
        updateArticle(id, { status: "published", publishedAt: new Date().toISOString() } as never),
    }),
    [
      user,
      profile,
      authHydrated,
      storeHydrated,
      myArticles,
      createArticleInStore,
      updateArticle,
      deleteArticle,
    ]
  );

  return <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>;
}

export function useAuthor(): AuthorContextValue {
  const ctx = useContext(AuthorContext);
  if (!ctx) throw new Error("useAuthor must be used within AuthorProvider");
  return ctx;
}
