import { NextResponse } from "next/server";
import { getArticles } from "@/lib/data/articleStore";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://moonnews.rw").replace(/\/$/, "");

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const articles = getArticles()
    .filter((article) => article.status === "published")
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 50);

  const items = articles
    .map(
      (article) => `
        <item>
          <title>${escapeXml(article.title.en)}</title>
          <link>${siteUrl}/news/${encodeURIComponent(article.slug)}</link>
          <guid isPermaLink="true">${siteUrl}/news/${encodeURIComponent(article.slug)}</guid>
          <description>${escapeXml(article.excerpt.en)}</description>
          <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
        </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Moon News</title>
    <link>${siteUrl}</link>
    <description>Trusted News. Right on Time.</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}
