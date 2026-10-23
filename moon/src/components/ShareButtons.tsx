"use client";

import { useState } from "react";
import { Check, Facebook, Link2, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
  compact?: boolean;
}

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.2 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.4 3.8H5.6L17.8 20Z" />
    </svg>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4ZM12 22a10 10 0 0 1-5-1.4L2 22l1.4-4.9A10 10 0 1 1 12 22Zm0-18a8 8 0 0 0-6.8 12.2L4.4 19l2.9-.8A8 8 0 1 0 12 4Z" />
    </svg>
  );
}

export function ShareButtons({ url, title, className, compact }: ShareButtonsProps) {
  const { locale, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, icon: WhatsAppGlyph, color: "hover:bg-[#25D366] hover:text-white" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: Facebook, color: "hover:bg-[#1877F2] hover:text-white" },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, icon: XGlyph, color: "hover:bg-black hover:text-white" },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, icon: Send, color: "hover:bg-[#229ED9] hover:text-white" },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be blocked; fall back silently */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {!compact && (
        <span className="mr-1 text-sm font-semibold text-[rgb(var(--text-muted))]">
          {t("article.share")}:
        </span>
      )}
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-[rgb(var(--surface))] text-[rgb(var(--text-muted))] transition-colors",
            l.color
          )}
        >
          <l.icon className="h-[18px] w-[18px]" />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label={t("article.copyLink")}
        title={t("article.copyLink")}
        className={cn(
          "flex h-10 items-center gap-1.5 rounded-full border border-border bg-[rgb(var(--surface))] px-3 text-sm font-medium text-[rgb(var(--text-muted))] transition-colors hover:border-brand-500 hover:text-brand-600"
        )}
      >
        {copied ? <Check className="h-[18px] w-[18px] text-emerald-500" /> : <Link2 className="h-[18px] w-[18px]" />}
        {!compact && <span>{copied ? (locale === "rw" ? "Byakoporowe" : "Copied") : t("article.copyLink")}</span>}
      </button>
    </div>
  );
}

export default ShareButtons;
