"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthorArticleEditor } from "@/components/author/AuthorArticleEditor";
import { useAuthor } from "@/lib/author/AuthorProvider";
import { EmptyState } from "@/components/EmptyState";
import type { Article } from "@/lib/types";

export default function AuthorEditArticlePage() {
  const params = useParams<{ id: string }>();
  const { myArticles, hydrated } = useAuthor();
  const [found, setFound] = useState<Article | undefined>(undefined);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setFound(myArticles.find((a) => a.id === params.id));
    setChecked(true);
  }, [hydrated, myArticles, params.id]);

  if (!hydrated || !checked) {
    return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;
  }

  if (!found) {
    return (
      <EmptyState
        title="Article not found"
        description="It may have been deleted, or it isn't one of your stories."
      />
    );
  }

  return <AuthorArticleEditor existing={found} />;
}
