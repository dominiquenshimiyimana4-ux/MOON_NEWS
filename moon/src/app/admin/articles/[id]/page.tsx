"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { EmptyState } from "@/components/EmptyState";
import type { Article } from "@/lib/types";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const { articles, hydrated } = useAdmin();
  const [found, setFound] = useState<Article | undefined>(undefined);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setFound(articles.find((a) => a.id === params.id));
    setChecked(true);
  }, [hydrated, articles, params.id]);

  if (!hydrated || !checked) {
    return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;
  }

  if (!found) {
    return <EmptyState title="Article not found" description="It may have been deleted." />;
  }

  return <ArticleEditor existing={found} />;
}
