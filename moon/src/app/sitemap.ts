import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://moonnews.rw").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: siteUrl, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/search`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/politics`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/business`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/sports`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/technology`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/entertainment`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/health`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];
}
