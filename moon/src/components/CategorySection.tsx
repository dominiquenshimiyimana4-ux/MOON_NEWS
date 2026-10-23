"use client";

import type { Article, CategorySlug } from "@/lib/types";
import { categoryMap } from "@/lib/data/categories";
import { useLanguage } from "@/lib/i18n";
import { pick } from "@/lib/utils";
import { NewsCard } from "./NewsCard";
import { SectionHeading } from "./SectionHeading";

interface CategorySectionProps {
  category: CategorySlug;
  articles: Article[];
  columns?: 3 | 4;
}

export function CategorySection({ category, articles, columns = 4 }: CategorySectionProps) {
  const { locale } = useLanguage();
  const cat = categoryMap[category];
  if (!articles.length) return null;

  return (
    <section>
      <SectionHeading
        title={pick(cat.name, locale)}
        href={`/${category}`}
        accent={cat.color}
      />
      <div
        className={`grid gap-5 grid-cols-1 sm:grid-cols-2 ${
          columns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {articles.slice(0, columns).map((a, i) => (
          <NewsCard key={a.id} article={a} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
