import type { Category, CategorySlug } from "@/lib/types";

export const categories: Category[] = [
  { slug: "rwanda", name: { rw: "U Rwanda", en: "Rwanda" }, color: "#4c2fd0" },
  { slug: "politics", name: { rw: "Politiki", en: "Politics" }, color: "#5f46e8" },
  { slug: "business", name: { rw: "Ubukungu", en: "Business" }, color: "#0d9488" },
  { slug: "sports", name: { rw: "Imikino", en: "Sports" }, color: "#ea580c" },
  {
    slug: "technology",
    name: { rw: "Ikoranabuhanga", en: "Technology" },
    color: "#2563eb",
  },
  { slug: "health", name: { rw: "Ubuzima", en: "Health" }, color: "#dc2626" },
  { slug: "education", name: { rw: "Uburezi", en: "Education" }, color: "#ca8a04" },
  {
    slug: "entertainment",
    name: { rw: "Imyidagaduro", en: "Entertainment" },
    color: "#db2777",
  },
  {
    slug: "international",
    name: { rw: "Amahanga", en: "International" },
    color: "#0891b2",
  },
  {
    slug: "environment",
    name: { rw: "Ibidukikije", en: "Environment" },
    color: "#16a34a",
  },
  {
    slug: "agriculture",
    name: { rw: "Ubuhinzi", en: "Agriculture" },
    color: "#65a30d",
  },
  { slug: "culture", name: { rw: "Umuco", en: "Culture" }, color: "#9333ea" },
  { slug: "science", name: { rw: "Ubumenyi", en: "Science" }, color: "#4f46e5" },
];

export const categoryMap: Record<CategorySlug, Category> = categories.reduce(
  (acc, c) => {
    acc[c.slug] = c;
    return acc;
  },
  {} as Record<CategorySlug, Category>
);

// Categories surfaced in the main navigation (spec order).
export const primaryNavCategories: CategorySlug[] = [
  "rwanda",
  "politics",
  "business",
  "sports",
  "technology",
  "health",
  "education",
  "entertainment",
  "international",
];

export function getCategory(slug: CategorySlug): Category {
  return categoryMap[slug];
}
