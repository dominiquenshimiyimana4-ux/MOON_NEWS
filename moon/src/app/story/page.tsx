"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { ArticleView } from "@/components/ArticleView";
import { newsService } from "@/lib/services/newsService";

function StoryLoading() {
  return (
    <div className="container-page py-12">
      <p className="text-sm text-[rgb(var(--text-muted))]">Loading story…</p>
    </div>
  );
}

function StoryContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const [story, setStory] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [popular, setPopular] = useState<Article[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStory(null);
    setStatus("loading");

    async function loadStory() {
      if (!slug) {
        setStatus("missing");
        return;
      }

      try {
        const article = await newsService.getBySlug(slug);
        if (!article || (category && article.category !== category)) {
          if (!cancelled) setStatus("missing");
          return;
        }

        const [relatedArticles, popularArticles] = await Promise.all([
          newsService.getRelated(article, 3),
          newsService.getTrending(5),
        ]);
        if (cancelled) return;
        setStory(article);
        setRelated(relatedArticles);
        setPopular(popularArticles);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void loadStory();
    return () => {
      cancelled = true;
    };
  }, [category, slug]);

  if (status === "loading") return <StoryLoading />;
  if (status === "error") {
    return (
      <div className="container-page py-12">
        <p role="alert" className="text-sm text-[rgb(var(--text-muted))]">
          This story could not be loaded right now. Please try again later.
        </p>
      </div>
    );
  }
  if (status === "missing" || !story) {
    return (
      <div className="container-page py-12">
        <h1 className="font-serif text-2xl font-bold">Story not available</h1>
        <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
          This story may have been removed or is temporarily unavailable.
        </p>
        <Link href="/latest" className="btn-primary mt-5">Browse latest news</Link>
      </div>
    );
  }

  return <ArticleView article={story} related={related} popular={popular} />;
}

export default function StoryPage() {
  return (
    <Suspense fallback={<StoryLoading />}>
      <StoryContent />
    </Suspense>
  );
}
