"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  Radio,
  Settings,
  User as UserIcon,
  Bookmark,
  LayoutDashboard,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "./NotificationBell";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/AuthProvider";
import { dashboardRouteFor } from "@/lib/services/authService";
import { categories, primaryNavCategories, categoryMap } from "@/lib/data/categories";
import { cn, pick } from "@/lib/utils";
import type { CategorySlug } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
}

export function Header() {
  const pathname = usePathname();
  const { locale, t } = useLanguage();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const topNav: NavItem[] = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.latest"), href: "/latest" },
    { label: t("nav.live"), href: "/live" },
    { label: t("nav.video"), href: "/video" },
    { label: t("nav.photos"), href: "/photos" },
    { label: t("nav.authors"), href: "/authors" },
  ];

  const categoryNav: NavItem[] = primaryNavCategories.map((c: CategorySlug) => ({
    label: pick(categoryMap[c].name, locale),
    href: `/${c}`,
  }));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const today = new Date().toLocaleDateString(
    locale === "rw" ? "rw-RW" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  // Every signed-in role gets a link to its own dashboard. Readers previously
  // had none; staff keep the newsroom/author labels they had before.
  const dashboardHref = user ? dashboardRouteFor(user) : "/login";
  const dashboardLabel =
    user?.role === "reader"
      ? t("nav.myDashboard")
      : user?.role === "advertiser"
        ? t("nav.advertiserStudio")
        : t("nav.admin");

  return (
    <>
      {/* Utility bar */}
      <div className="hidden border-b border-border bg-[rgb(var(--bg-subtle))] lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <span className="font-medium text-[rgb(var(--text-muted))]">{today}</span>
          <div className="flex items-center gap-4">
            <Link href="/live" className="flex items-center gap-1.5 font-semibold text-red-600 hover:underline">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE
            </Link>
            <Link href="/newsletter" className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">
              {locale === "rw" ? "Amakuru kuri imeyili" : "Newsletter"}
            </Link>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Main sticky header */}
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border bg-[rgb(var(--surface))]/95 backdrop-blur transition-shadow",
          scrolled && "shadow-nav"
        )}
      >
        <div className="container-page flex h-16 items-center gap-3">
          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="btn-ghost -ml-2 h-10 w-10 rounded-lg !px-0 lg:hidden"
            aria-label={t("nav.menu")}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="shrink-0" aria-label="Moon News">
            <Logo compact className="lg:hidden" />
            <Logo showTagline className="hidden lg:inline-flex" />
          </Link>

          {/* Desktop nav */}
          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {topNav.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  isActive(item.href)
                    ? "text-brand-600"
                    : "text-[rgb(var(--text))] hover:text-brand-600"
                )}
              >
                {item.label}
              </Link>
            ))}
            {/* Sections dropdown */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[rgb(var(--text))] transition-colors hover:text-brand-600"
              >
                {t("nav.news")}
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 w-64 translate-y-2 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-card-hover transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${c.slug}`}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[rgb(var(--bg-subtle))]",
                        isActive(`/${c.slug}`) && "text-brand-600"
                      )}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                      {pick(c.name, locale)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="ml-auto hidden w-64 xl:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1 lg:ml-2">
            <Link href="/search" className="btn-ghost h-9 w-9 rounded-full !px-0 xl:hidden" aria-label={t("nav.search")}>
              <SearchIcon />
            </Link>
            <NotificationBell />
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-[rgb(var(--bg-subtle))]"
                  aria-expanded={userMenu}
                >
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                </button>
                {userMenu && (
                  <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-card-hover">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-[rgb(var(--text-muted))]">{user.email}</p>
                    </div>
                    <MenuLink href="/profile" icon={<UserIcon className="h-4 w-4" />}>{t("nav.profile")}</MenuLink>
                    <MenuLink href="/saved" icon={<Bookmark className="h-4 w-4" />}>{t("nav.saved")}</MenuLink>
                    <MenuLink href="/settings" icon={<Settings className="h-4 w-4" />}>{t("nav.settings")}</MenuLink>
                    <MenuLink href={dashboardHref} icon={<LayoutDashboard className="h-4 w-4" />}>
                      {dashboardLabel}
                    </MenuLink>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-[rgb(var(--bg-subtle))]"
                    >
                      <LogOut className="h-4 w-4" /> {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/login" className="btn-ghost text-sm font-semibold">
                  {t("nav.login")}
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Category strip (desktop) */}
        <div className="hidden border-t border-border lg:block">
          <div className="container-page">
            <nav className="scrollbar-hide flex items-center gap-1 overflow-x-auto" aria-label="Sections">
              {categoryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "border-brand-600 text-brand-600"
                      : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <Logo compact />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="btn-ghost h-9 w-9 rounded-lg !px-0"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-4">
                <SearchBar />
              </div>
              <div className="mb-4 flex items-center justify-between rounded-lg border border-border p-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>

              <nav className="space-y-0.5">
                {topNav.map((item) => (
                  <MobileLink key={item.href} href={item.href} active={isActive(item.href)}>
                    {item.label}
                  </MobileLink>
                ))}
              </nav>

              <p className="mt-5 mb-2 text-xs font-bold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                {t("nav.news")}
              </p>
              <nav className="space-y-0.5">
                {categories.map((c) => (
                  <MobileLink key={c.slug} href={`/${c.slug}`} active={isActive(`/${c.slug}`)}>
                    <span className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                      {pick(c.name, locale)}
                    </span>
                  </MobileLink>
                ))}
              </nav>

              <div className="my-4 border-t border-border" />

              {user ? (
                <nav className="space-y-0.5">
                  <MobileLink href="/profile">{t("nav.profile")}</MobileLink>
                  <MobileLink href="/saved">{t("nav.saved")}</MobileLink>
                  <MobileLink href="/settings">{t("nav.settings")}</MobileLink>
                  <MobileLink href={dashboardHref}>{dashboardLabel}</MobileLink>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-[rgb(var(--bg-subtle))]"
                  >
                    <LogOut className="h-4 w-4" /> {t("nav.logout")}
                  </button>
                </nav>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="btn-outline flex-1">{t("nav.login")}</Link>
                  <Link href="/register" className="btn-primary flex-1">{t("nav.register")}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[rgb(var(--bg-subtle))]"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "hover:bg-[rgb(var(--bg-subtle))]"
      )}
    >
      {children}
    </Link>
  );
}

export default Header;
