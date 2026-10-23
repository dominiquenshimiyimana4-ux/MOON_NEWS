"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Eye, Tag as TagIcon } from "lucide-react";
import type { Article } from "@/lib/types";
import { authorMap } from "@/lib/data/authors";
import { categoryMap } from "@/lib/data/categories";
import { userService } from "@/lib/services/userService";
import { useLanguage } from "@/lib/i18n";
import { articlePath, formatCount, formatDate, pick, readingLabel, timeAgo } from "@/lib/utils";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { CategoryBadge } from "./CategoryBadge";
import { ArticleBody } from "./ArticleBody";
import { ShareButtons } from "./ShareButtons";
import { ArticleReaderControls } from "./ArticleReaderControls";
import { CommentSection } from "./CommentSection";
import { PopularStories } from "./PopularStories";
import { NewsCard } from "./NewsCard";

interface ArticleViewProps {
  article: Article;
  related: Article[];
  popular: Article[];
}

export function ArticleView({ article, related, popular }: ArticleViewProps) {
  const { locale, t } = useLanguage();
  const author = authorMap[article.authorId];
  const cat = categoryMap[article.category];
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
    userService.pushHistory(article.slug);
  }, [article.slug]);

  const title = pick(article.title, locale);

  return (
    <>
      <ReadingProgressBar />
      <article className="container-page py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-sm text-[rgb(var(--text-muted))]">
          <Link href="/" className="hover:text-brand-600">{t("nav.home")}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/${article.category}`} className="hover:text-brand-600">{pick(cat.name, locale)}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-[rgb(var(--text))]">{title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CategoryBadge category={article.category} href={`/${article.category}`} size="md" />
            <h1 className="mt-3 font-serif text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h1>
            {article.subtitle && (
              <p className="mt-3 text-lg leading-relaxed text-[rgb(var(--text-muted))]">
                {pick(article.subtitle, locale)}
              </p>
            )}

            {/* Author + meta row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
              <div className="flex items-center gap-3">
                {author && (
                  <Link href={`/authors/${author.slug}`} className="flex items-center gap-3">
                    <span className="relative h-11 w-11 overflow-hidden rounded-full">
                      <Image src={author.avatar} alt={author.name} fill sizes="44px" className="object-cover" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold hover:text-brand-600">{author.name}</span>
                      <span className="block text-xs text-[rgb(var(--text-muted))]">{author.position}</span>
                    </span>
                  </Link>
                )}
              </div>
              <div className="flex flex-col items-start gap-1 text-xs text-[rgb(var(--text-muted))] sm:items-end">
                <span>
                  {t("article.published")} {formatDate(article.publishedAt, locale)}
                  {article.updatedAt && ` · ${t("article.updated")} ${timeAgo(article.updatedAt, locale)}`}
                </span>
                <span className="flex items-center gap-3">
                  <span>{readingLabel(article.readingTime, locale)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {formatCount(article.views)}
                  </span>
                </span>
              </div>
            </div>

            {/* Reader controls */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <ArticleReaderControls slug={article.slug} url={url || articlePath(article)} />
              <ShareButtons url={url || articlePath(article)} title={title} compact className="sm:hidden" />
            </div>

            {/* Main image */}
            <figure className="mt-6">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
                <Image
                  src={article.image}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
              {article.imageCaption && (
                <figcaption className="mt-2 text-sm text-[rgb(var(--text-muted))]">
                  {article.imageCaption}
                  {article.source && <span className="ml-1">· {t("article.source")}: {article.source}</span>}
                </figcaption>
              )}
            </figure>

            {/* Body */}
            <ArticleBody content={pick(article.content, locale)} className="mt-8" />

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[rgb(var(--text-muted))]">
                  <TagIcon className="h-4 w-4" /> {t("article.tags")}:
                </span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-[rgb(var(--text-muted))] transition-colors hover:border-brand-500 hover:text-brand-600"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="mt-8 border-t border-border pt-6">
              <ShareButtons url={url || articlePath(article)} title={title} />
            </div>

            {/* Author bio */}
            {author && (
              <div className="mt-8 flex gap-4 rounded-2xl border border-border bg-[rgb(var(--bg-subtle))] p-5">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                  <Image src={author.avatar} alt={author.name} fill sizes="64px" className="object-cover" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                    {locale === "rw" ? "Umwanditsi" : "Written by"}
                  </p>
                  <Link href={`/authors/${author.slug}`} className="font-serif text-lg font-bold hover:text-brand-600">
                    {author.name}
                  </Link>
                  <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{author.bio}</p>
                </div>
              </div>
            )}

            <CommentSection article={article} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <PopularStories articles={popular} />
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 font-serif text-2xl font-extrabold">{t("section.related")}</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

export default ArticleView;
