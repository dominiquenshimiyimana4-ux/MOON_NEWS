"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube, Send } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";
import { categories, primaryNavCategories, categoryMap } from "@/lib/data/categories";
import { pick } from "@/lib/utils";

const socials = [
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Telegram", href: "https://telegram.org", icon: Send },
];

export function Footer() {
  const { locale, t } = useLanguage();

  const newsLinks = primaryNavCategories.map((c) => ({
    label: pick(categoryMap[c].name, locale),
    href: `/${c}`,
  }));

  const aboutLinks = [
    { label: t("footer.about"), href: "/about" },
    { label: t("footer.contact"), href: "/contact" },
    { label: t("footer.careers"), href: "/about#careers" },
    { label: t("footer.advertise"), href: "/about#advertise" },
  ];

  const supportLinks = [
    { label: t("footer.privacy"), href: "/legal/privacy" },
    { label: t("footer.terms"), href: "/legal/terms" },
    { label: t("footer.cookies"), href: "/legal/cookies" },
    { label: t("footer.contact"), href: "/contact" },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-[rgb(var(--bg-subtle))]">
      {/* Newsletter strip */}
      <div className="border-b border-border">
        <div className="container-page grid gap-4 py-8 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-serif text-xl font-bold">{t("newsletter.title")}</h3>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{t("newsletter.desc")}</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" aria-label="Moon News">
            <Logo showTagline />
          </Link>
          <p className="mt-4 max-w-sm text-sm text-[rgb(var(--text-muted))]">
            {locale === "rw"
              ? "Moon News ni urubuga rw'amakuru rwigenga rutanga amakuru y'ukuri, ku gihe, mu Kinyarwanda no mu Cyongereza."
              : "Moon News is an independent digital newsroom delivering trusted, timely coverage in Kinyarwanda and English."}
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-[rgb(var(--text-muted))] transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <div className="mt-5">
            <LanguageSwitcher />
          </div>
        </div>

        <FooterCol title={t("footer.sections")} links={newsLinks} />
        <FooterCol title={t("footer.about")} links={aboutLinks} />
        <FooterCol title={t("footer.support")} links={supportLinks} />
      </div>

      {/* All categories */}
      <div className="border-t border-border">
        <div className="container-page flex flex-wrap gap-x-4 gap-y-2 py-4 text-xs">
          {categories.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="text-[rgb(var(--text-muted))] hover:text-brand-600">
              {pick(c.name, locale)}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-[rgb(var(--text-muted))] sm:flex-row">
          <p>© 2026 Moon News. {t("footer.rights")}</p>
          <p>{locale === "rw" ? "Amakuru y'ukuri, ku gihe." : "Trusted News. Right on Time."}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-sm text-[rgb(var(--text-muted))] transition-colors hover:text-brand-600">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterForm() {
  return (
    <form
      className="flex w-full flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("footer-email") as HTMLInputElement;
        if (input) input.value = "";
        alert("Thanks for subscribing to Moon News!");
      }}
    >
      <input
        name="footer-email"
        type="email"
        required
        placeholder="you@example.com"
        className="input"
        aria-label="Email"
      />
      <button type="submit" className="btn-primary whitespace-nowrap">
        Subscribe
      </button>
    </form>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.2 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.4 3.8H5.6L17.8 20Z" />
    </svg>
  );
}

export default Footer;
