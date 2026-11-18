"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";

const INSTALL_PROMPT_KEY = "moon_news_install_prompt_dismissed";
const INSTALL_PROMPT_DATE_KEY = "moon_news_install_prompt_dismissed_at";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true);

  const isDismissedRecently = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const dismissed = window.localStorage.getItem(INSTALL_PROMPT_KEY);
      if (!dismissed) return false;
      const dismissedAt = Number(window.localStorage.getItem(INSTALL_PROMPT_DATE_KEY) ?? "0");
      if (dismissed === "never") return true;
      return Date.now() - dismissedAt < COOLDOWN_MS;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (isStandalone || isDismissedRecently()) {
      setShow(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setShow(true);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShow(false);
      setDeferredPrompt(null);
      try {
        window.localStorage.setItem(INSTALL_PROMPT_KEY, "installed");
        window.localStorage.setItem(INSTALL_PROMPT_DATE_KEY, String(Date.now()));
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone, isDismissedRecently]);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        try {
          window.localStorage.setItem(INSTALL_PROMPT_KEY, "installed");
          window.localStorage.setItem(INSTALL_PROMPT_DATE_KEY, String(Date.now()));
        } catch {}
      }
      setDeferredPrompt(null);
      setShow(false);
    } catch {
      setShow(false);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      window.localStorage.setItem(INSTALL_PROMPT_KEY, "dismissed");
      window.localStorage.setItem(INSTALL_PROMPT_DATE_KEY, String(Date.now()));
    } catch {}
  }, []);

  if (installed || !show) return null;

  return (
    <div
      ref={promptRef}
      className="fixed inset-0 z-50 flex items-end justify-center pb-4 sm:pb-6 lg:items-center lg:justify-center lg:p-4 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Install Moon News"
    >
      <div className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-[rgb(var(--surface))] rounded-2xl border border-border shadow-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:slide-in-from-top-0 duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <Download className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="btn-ghost -mx-1.5 -my-1 h-8 w-8 rounded-lg hover:bg-[rgb(var(--bg-subtle))]"
            aria-label="Close install prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mb-1 font-serif text-xl font-bold tracking-tight">Install Moon News</h2>
        <p className="mb-6 text-sm text-[rgb(var(--text-muted))]">
          Install Moon News on your device for faster access and a better reading experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={install}
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={!deferredPrompt}
          >
            {deferredPrompt ? (
              <>
                <Download className="h-4 w-4" /> Install Moon News
              </>
            ) : (
              "Install"
            )}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="btn-outline w-full"
          >
            Not Now
          </button>
        </div>

        <p className="mt-5 text-xs text-[rgb(var(--text-muted))] text-center">
          Can&apos;t see the install button? Use your browser&rsquo;s menu and choose
          &ldquo;Add to Home Screen&rdquo; or &ldquo;Install this app.&rdquo;
        </p>
      </div>

      {promptRef && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={dismiss}
          aria-hidden
        />
      )}
    </div>
  );
}

export default InstallPrompt;
