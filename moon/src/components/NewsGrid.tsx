import type { Article } from "@/lib/types";
import { NewsCard } from "./NewsCard";
import { cn } from "@/lib/utils";

interface NewsGridProps {
  articles: Article[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const colClass: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function NewsGrid({ articles, columns = 3, className }: NewsGridProps) {
  return (
    <div className={cn("grid gap-5 grid-cols-1", colClass[columns], className)}>
      {articles.map((a, i) => (
        <NewsCard key={a.id} article={a} priority={i < 2} />
      ))}
    </div>
  );
}

export default NewsGrid;
