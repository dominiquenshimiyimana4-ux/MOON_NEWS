"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Eye, User } from "lucide-react";
import type { Article } from "@/lib/types";
import { authorMap } from "@/lib/data/authors";
import { useLanguage } from "@/lib/i18n";
import { articlePath, formatCount, pick, readingLabel, timeAgo } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";

interface HeroNewsProps {
  main: Article;
  secondary: Article[]; // up to 4
}

export function HeroNews({ main, secondary }: HeroNewsProps) {
  const { locale, t } = useLanguage();
  const mainAuthor = authorMap[main.authorId];

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {/* Main story */}
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="group relative col-span-1 overflow-hidden rounded-2xl lg:col-span-2"
      >
        <Link href={articlePath(main)} className="relative block aspect-[16/10] w-full lg:aspect-[16/9]">
          <Image
            src={main.image}
            alt={pick(main.title, locale)}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <CategoryBadge category={main.category} size="md" />
            {main.breaking && (
              <span className="chip bg-red-600 text-white">{t("section.breaking")}</span>
            )}
          </div>
          <Link href={articlePath(main)}>
            <h1 className="font-serif text-2xl font-extrabold leading-tight text-white drop-shadow-sm transition-colors group-hover:text-brand-200 sm:text-3xl lg:text-4xl">
              {pick(main.title, locale)}
            </h1>
          </Link>
          <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-white/85 sm:text-base">
            {pick(main.excerpt, locale)}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <User className="h-3.5 w-3.5" /> {mainAuthor?.name ?? "Moon News"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {timeAgo(main.publishedAt, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">{readingLabel(main.readingTime, locale)}</span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> {formatCount(main.views)}
            </span>
          </div>
        </div>
      </motion.article>

      {/* Four secondary stories */}
      <div className="col-span-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {secondary.slice(0, 4).map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * (i + 1) }}
          >
            <SecondaryCard article={a} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SecondaryCard({ article }: { article: Article }) {
  const { locale } = useLanguage();
  return (
    <Link
      href={articlePath(article)}
      className="group flex h-full gap-3 overflow-hidden rounded-xl border border-border bg-[rgb(var(--surface))] p-3 transition-shadow hover:shadow-card-hover"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32">
        <Image
          src={article.image}
          alt={pick(article.title, locale)}
          fill
          sizes="128px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0">
        <CategoryBadge category={article.category} className="mb-1.5" />
        <h3 className="line-clamp-3 font-serif text-sm font-bold leading-snug transition-colors group-hover:text-brand-600 sm:text-base">
          {pick(article.title, locale)}
        </h3>
        <p className="mt-1.5 text-xs text-[rgb(var(--text-muted))]">
          {timeAgo(article.publishedAt, locale)}
        </p>
      </div>
    </Link>
  );
}

export default HeroNews;
