import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/ArticleView";
import { newsService } from "@/lib/services/newsService";
import { authorMap } from "@/lib/data/authors";
import { articles as allArticles } from "@/lib/data/articles";
import { categoryMap } from "@/lib/data/categories";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moonnews.rw";

export function generateStaticParams() {
  return allArticles
    .filter((a) => a.status === "published")
    .map((a) => ({ category: a.category, slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await newsService.getBySlug(slug);
  if (!article) return { title: "Article not found" };
  const canonical = `${siteUrl}/news/${article.category}/${article.slug}`;
  return {
    title: article.seo?.title ?? article.title.en,
    description: article.seo?.description ?? article.excerpt.en,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.seo?.title ?? article.title.en,
      description: article.seo?.description ?? article.excerpt.en,
      url: canonical,
      images: [{ url: article.seo?.ogImage ?? article.image, width: 1200, height: 630 }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [authorMap[article.authorId]?.name ?? "Moon News"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo?.title ?? article.title.en,
      description: article.seo?.description ?? article.excerpt.en,
      images: [article.seo?.ogImage ?? article.image],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const article = await newsService.getBySlug(slug);
  if (!article || article.category !== category) notFound();

  const [related, popular] = await Promise.all([
    newsService.getRelated(article, 3),
    newsService.getTrending(5),
  ]);

  const author = authorMap[article.authorId];
  const cat = categoryMap[article.category];
  const canonical = `${siteUrl}/news/${article.category}/${article.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title.en,
    description: article.excerpt.en,
    image: [article.seo?.ogImage ?? article.image],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    articleSection: cat.name.en,
    keywords: article.tags.join(", "),
    author: author
      ? { "@type": "Person", name: author.name, url: `${siteUrl}/authors/${author.slug}` }
      : { "@type": "Organization", name: "Moon News" },
    publisher: {
      "@type": "Organization",
      name: "Moon News",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: cat.name.en, item: `${siteUrl}/${cat.slug}` },
      { "@type": "ListItem", position: 3, name: article.title.en, item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArticleView article={article} related={related} popular={popular} />
    </>
  );
}
