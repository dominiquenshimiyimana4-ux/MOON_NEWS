"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Eye, User } from "lucide-react";
import type { Article } from "@/lib/types";
import { authorMap } from "@/lib/data/authors";
import { useLanguage } from "@/lib/i18n";
import { articlePath, cn, formatCount, pick, readingLabel, timeAgo } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";
import { SaveButton } from "./SaveButton";

interface NewsCardProps {
  article: Article;
  variant?: "default" | "horizontal" | "minimal";
  className?: string;
  priority?: boolean;
}

export function NewsCard({ article, variant = "default", className, priority }: NewsCardProps) {
  const { locale } = useLanguage();
  const href = articlePath(article);

  if (variant === "minimal") {
    return (
      <Link href={href} className={cn("group block", className)}>
        <CategoryBadge category={article.category} className="mb-1.5" />
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-brand-600">
          {pick(article.title, locale)}
        </h4>
        <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{timeAgo(article.publishedAt, locale)}</p>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className={cn("card group flex gap-4 overflow-hidden p-3 transition-shadow hover:shadow-card-hover", className)}>
        <Link href={href} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-40">
          <Image
            src={article.image}
            alt={pick(article.title, locale)}
            fill
            sizes="(max-width: 640px) 128px, 160px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <CategoryBadge category={article.category} className="mb-1.5 w-fit" />
          <Link href={href} className="line-clamp-2 font-serif text-base font-bold leading-snug transition-colors hover:text-brand-600 sm:text-lg">
            {pick(article.title, locale)}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-[rgb(var(--text-muted))]">{pick(article.excerpt, locale)}</p>
          <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-[rgb(var(--text-muted))]">
            <Meta article={article} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("card group flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover", className)}>
      <div className="relative">
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden">
          <Image
            src={article.image}
            alt={pick(article.title, locale)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-3 top-3">
          <CategoryBadge category={article.category} size="md" />
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-black/40 p-1 backdrop-blur-sm transition-opacity hover:bg-black/60">
          <SaveButton slug={article.slug} className="!text-white" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Link href={href} className="line-clamp-3 font-serif text-lg font-bold leading-snug transition-colors hover:text-brand-600">
          {pick(article.title, locale)}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-[rgb(var(--text-muted))]">{pick(article.excerpt, locale)}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-[rgb(var(--text-muted))]">
          <Meta article={article} />
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {formatCount(article.views)}
          </span>
        </div>
      </div>
    </article>
  );
}

function Meta({ article }: { article: Article }) {
  const { locale } = useLanguage();
  const author = authorMap[article.authorId];
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-1">
        <User className="h-3.5 w-3.5" /> {author?.name ?? "Moon News"}
      </span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" /> {timeAgo(article.publishedAt, locale)}
      </span>
      <span className="hidden sm:inline">{readingLabel(article.readingTime, locale)}</span>
    </span>
  );
}

export default NewsCard;
