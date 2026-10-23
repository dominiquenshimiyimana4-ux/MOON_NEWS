import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Article, Locale } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pick<T extends { rw: string; en: string }>(
  text: T,
  locale: Locale
): string {
  return text[locale] || text.en;
}

export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "rw" ? "rw-RW" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleTimeString(locale === "rw" ? "rw-RW" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string, locale: Locale): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === "rw" ? "rw" : "en", {
    numeric: "auto",
  });
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let duration = seconds;
  for (let i = 0; i < divisions.length; i++) {
    const [amount, unit] = divisions[i];
    if (Math.abs(duration) < amount) {
      return rtf.format(-Math.round(duration), unit);
    }
    duration /= amount;
  }
  return rtf.format(-Math.round(duration), "year");
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function readingLabel(mins: number, locale: Locale): string {
  return locale === "rw" ? `Gusoma ${mins} min` : `${mins} min read`;
}

export function articlePath(a: Pick<Article, "category" | "slug">): string {
  return `/news/${a.category}/${a.slug}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export function formatRWF(n: number): string {
  return `${Math.round(n).toLocaleString("en-US")} RWF`;
}
