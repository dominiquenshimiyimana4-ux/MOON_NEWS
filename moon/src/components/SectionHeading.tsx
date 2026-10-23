import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  href?: string;
  linkLabel?: string;
  accent?: string;
  className?: string;
}

export function SectionHeading({ title, href, linkLabel, accent = "#4c2fd0", className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <h2 className="relative font-serif text-2xl font-extrabold tracking-tight sm:text-[1.7rem]">
        <span className="absolute -left-4 top-1 bottom-1 w-1 rounded-full" style={{ background: accent }} />
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          {linkLabel ?? "View all"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export default SectionHeading;
