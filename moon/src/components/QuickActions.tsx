"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, Copy, ExternalLink, Loader2, Share2 } from "lucide-react";
import type { Article } from "@/lib/types";
import { articlePath, cn, truncate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { useBookmarks } from "@/lib/bookmarks/BookmarkProvider";

interface QuickActionsProps {
  article: Article;
  /** Wrapping element content rendered under a long-press + context-menu surface. */
  children: React.ReactNode;
  className?: string;
}

const HOLD_MS = 450;

/**
 * LongPressActions — wraps any news item so that pressing & holding
 * (or right-clicking) opens a quick-action sheet: Read, Save, Copy link, Share.
 *
 * This gives users access to article actions without navigating away,
 * and never produces a 404 because every action resolves the article's
 * canonical path via articlePath().
 */
export function QuickActions({ article, children, className }: QuickActionsProps) {
  const { locale, t } = useLanguage();
  const { isSaved, toggle } = useBookmarks();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const href = articlePath(article);
  const saved = isSaved(article.slug);

  const clearHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  useEffect(() => clearHold, [clearHold]);

  // Close the sheet on outside tap / Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const startHold = () => {
    firedRef.current = false;
    holdTimer.current = setTimeout(() => {
      firedRef.current = true;
      setOpen(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.(25); } catch { /* ignore */ }
      }
    }, HOLD_MS);
  };

  const cancelHold = () => clearHold();

  // Swallow the click that follows a completed long-press so the link doesn't fire.
  const onClickCapture = (e: React.MouseEvent) => {
    if (firedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      firedRef.current = false;
    }
  };

  async function copyLink() {
    try {
      const url = `${window.location.origin}${href}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } finally {
      setOpen(false);
    }
  }

  async function share() {
    setSharing(true);
    try {
      const url = `${window.location.origin}${href}`;
      const data = { title: truncate(article.title.en ?? "", 80), url };
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard?.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // user cancelled the share sheet — nothing to do
    } finally {
      setSharing(false);
      setOpen(false);
    }
  }

  function onSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(article.slug);
  }

  return (
    <div
      className={cn("relative", className)}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onContextMenu={(e) => {
        e.preventDefault();
        setOpen(true);
      }}
      onClickCapture={onClickCapture}
      title={t("article.longPressHint")}
    >
      {children}

      {open && (
        <div
          ref={sheetRef}
          role="menu"
          aria-label={t("article.quickActions")}
          className="absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-[rgb(var(--surface))] shadow-card-hover"
        >
          <p className="truncate border-b border-border px-3 py-2 text-xs font-semibold text-[rgb(var(--text-muted))]">
            {truncate(article.title.en ?? article.title.rw ?? "", 42)}
          </p>
          <Link
            href={href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-brand-500/10"
          >
            <ExternalLink className="h-4 w-4 text-brand-600" /> {t("article.read")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={onSave}
            aria-pressed={saved}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-500/10"
          >
            <Bookmark className={cn("h-4 w-4 text-brand-600", saved && "fill-current")} />
            {saved ? t("article.saved") : t("article.save")}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-500/10"
          >
            <Copy className="h-4 w-4 text-brand-600" />
            {copied ? t("article.linkCopied") : t("article.copyLink")}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={share}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-500/10"
          >
            {sharing ? (
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            ) : (
              <Share2 className="h-4 w-4 text-brand-600" />
            )}
            {t("article.share")}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuickActions;
