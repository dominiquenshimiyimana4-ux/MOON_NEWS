"use client";

import type { Article } from "@/lib/types";
import { NewsCard } from "./NewsCard";

/**
 * ArticleCard is the list-oriented alias of NewsCard (horizontal layout).
 * Kept as a separate export so call sites can express intent clearly.
 */
export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  return <NewsCard article={article} variant="horizontal" className={className} />;
}

export default ArticleCard;
