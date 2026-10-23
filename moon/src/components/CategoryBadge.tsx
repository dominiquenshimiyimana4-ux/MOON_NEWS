import Link from "next/link";
import { categoryMap } from "@/lib/data/categories";
import { useLanguage } from "@/lib/i18n";
import { cn, pick } from "@/lib/utils";
import type { CategorySlug } from "@/lib/types";

interface CategoryBadgeProps {
  category: CategorySlug;
  href?: string;
  className?: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, href, className, size = "sm" }: CategoryBadgeProps) {
  const { locale } = useLanguage();
  const cat = categoryMap[category];
  const content = (
    <span
      className={cn(
        "chip text-white",
        size === "sm" ? "text-[0.65rem]" : "px-3 py-1 text-xs",
        className
      )}
      style={{ backgroundColor: cat.color }}
    >
      {pick(cat.name, locale)}
    </span>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default CategoryBadge;
