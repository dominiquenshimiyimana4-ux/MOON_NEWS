import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/CategoryView";
import { categories, categoryMap } from "@/lib/data/categories";
import type { CategorySlug } from "@/lib/types";

const validSlugs = new Set<string>(categories.map((c) => c.slug));

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!validSlugs.has(category)) return { title: "Not found" };
  const cat = categoryMap[category as CategorySlug];
  return {
    title: `${cat.name.en} News`,
    description: `Latest ${cat.name.en} news and updates from Rwanda and around the world — Moon News.`,
    openGraph: { title: `${cat.name.en} | Moon News`, type: "website" },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!validSlugs.has(category)) notFound();
  return <CategoryView category={category as CategorySlug} />;
}
