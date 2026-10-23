"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, LayoutGrid, Radio, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const tabs = [
    { href: "/", label: locale === "rw" ? "Ahabanza" : "Home", icon: Home },
    { href: "/latest", label: locale === "rw" ? "Amakuru" : "Latest", icon: LayoutGrid },
    { href: "/live", label: "LIVE", icon: Radio },
    { href: "/search", label: locale === "rw" ? "Shakisha" : "Search", icon: Search },
    { href: "/saved", label: locale === "rw" ? "Byabitswe" : "Saved", icon: Bookmark },
  ];
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[rgb(var(--surface))]/95 backdrop-blur sm:hidden">
      <ul className="flex items-stretch">
        {tabs.map((tab) => (
          <li key={tab.href} className="flex-1">
            <Link
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[0.65rem] font-medium transition-colors",
                isActive(tab.href) ? "text-brand-600" : "text-[rgb(var(--text-muted))]"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default MobileTabBar;
