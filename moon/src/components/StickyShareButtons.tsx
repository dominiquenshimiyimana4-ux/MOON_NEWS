"use client";

import { useEffect, useRef, useState } from "react";
import { Facebook, Link2, Mail, Send, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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

interface StickyShareButtonsProps {
  url: string;
  title: string;
}

/**
 * Sticky/floating social share buttons that appear on the right edge of
 * article pages on desktop, and as a bottom sheet on mobile.
 */
export function StickyShareButtons({ url, title }: StickyShareButtonsProps) {
  const { locale, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: WhatsAppGlyph,
      color: "hover:bg-[#25D366] hover:text-white",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
      color: "hover:bg-[#1877F2] hover:text-white",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: XGlyph,
      color: "hover:bg-black hover:text-white",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: Send,
      color: "hover:bg-[#229ED9] hover:text-white",
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function openShare() {
    setOpen(true);
  }

  return (
    <>
      {/* Desktop sticky trigger button */}
      <button
        type="button"
        ref={anchorRef}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] lg:hidden hidden"
        onClick={openShare}
        aria-label={t("article.share")}
      >
        <ShareIcon className="h-5 w-5" />
      </button>

      {/* Mobile bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 z-[71] bg-[rgb(var(--surface))] rounded-t-2xl border-t border-border p-4 sm:p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-bold">{t("article.share")}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost h-9 w-9 rounded-lg !px-0"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-sm font-medium transition-colors border border-border bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))]",
                    l.color
                  )}
                >
                  <l.icon className="h-5 w-5" />
                  <span>{l.label}</span>
                </a>
              ))}
              <button
                type="button"
                onClick={copy}
                aria-label={t("article.copyLink")}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-sm font-medium transition-colors border border-brand-500 bg-brand-50 text-brand-600"
                )}
              >
                <Link2 className="h-5 w-5" />
                <span>{copied ? (locale === "rw" ? "Byakoporowe" : "Copied") : t("article.copyLink")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sticky share rail */}
      <div className="hidden lg:flex flex-col items-center gap-2 fixed right-4 top-1/2 -translate-y-1/2 z-[60]">
        <div className="flex flex-col items-center gap-2 bg-[rgb(var(--surface))] rounded-xl border border-border p-2 shadow-xl">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${l.label}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] transition-colors",
                l.color
              )}
            >
              <l.icon className="h-4 w-4" />
            </a>
          ))}
          <button
            type="button"
            onClick={copy}
            aria-label={t("article.copyLink")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] transition-colors hover:bg-brand-50 hover:text-brand-600"
            )}
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>
        <span className="-rotate-90 text-xs font-medium text-[rgb(var(--text-muted))] hidden sm:block">
          {t("article.share")}
        </span>
      </div>
    </>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="21.5" y1="8" x2="15.5" y2="2" />
      <line x1="3.5" y1="8" x2="8.5" y2="14" />
      <line x1="16.5" y1="14" x2="9.5" y2="20" />
    </svg>
  );
}

export default StickyShareButtons;
