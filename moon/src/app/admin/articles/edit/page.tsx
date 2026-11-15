"use client";

import { useEffect, useState } from "react";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { EmptyState } from "@/components/EmptyState";
import type { Article } from "@/lib/types";

export default function EditArticlePage() {
  const { articles, hydrated } = useAdmin();
  const [found, setFound] = useState<Article | undefined>(undefined);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const id = new URLSearchParams(window.location.search).get("id");
    setFound(id ? articles.find((article) => article.id === id) : undefined);
    setChecked(true);
  }, [hydrated, articles]);

  if (!hydrated || !checked) {
    return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;
  }

  if (!found) {
    return <EmptyState title="Article not found" description="It may have been deleted." />;
  }

  return <ArticleEditor existing={found} />;
}
