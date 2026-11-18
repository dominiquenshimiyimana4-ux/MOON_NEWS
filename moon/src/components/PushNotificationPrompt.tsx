"use client";

import { useCallback, useEffect, useState } from "react";
import { BellOff, Bell, Check, Loader2, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PUSH_PROMPT_KEY = "moon_news_push_prompt_dismissed";
const PUSH_SUBSCRIBED_KEY = "moon_news_push_subscribed";

interface PushNotificationPromptProps {
  className?: string;
}

/**
 * Browser push notification opt-in prompt.
 *
 * Asks the user to subscribe to breaking news alerts. The subscription is
 * stored in localStorage (the actual push server integration would send the
 * PushSubscription to a backend endpoint). Honors dismissal cooldown and
 * already-subscribed state.
 */
export function PushNotificationPrompt({ className }: PushNotificationPromptProps) {
  const { locale, t } = useLanguage();
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already subscribed or dismissed recently
    try {
      const alreadySubscribed = window.localStorage.getItem(PUSH_SUBSCRIBED_KEY) === "true";
      const dismissed = window.localStorage.getItem(PUSH_PROMPT_KEY);
      const dismissedAt = Number(window.localStorage.getItem("moon_news_push_prompt_dismissed_at") ?? "0");
      const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (alreadySubscribed) {
        setSubscribed(true);
        setShow(false);
      } else if (!dismissed || Date.now() - dismissedAt > cooldown) {
        // Check if push API is supported
        if ("PushManager" in window && "serviceWorker" in navigator) {
          setSupported(true);
          setShow(true);
        }
      }
    } catch {}
  }, []);

  const subscribe = useCallback(async () => {
    if (!("PushManager" in window) || !("serviceWorker" in navigator)) return;

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
            "BEl62iUYgUivxIkv69yViEwiCAa-8DRfTZEyz7Jr_UB2VvP7b2qG8Mw5oK4tM4s2FqvQp7gK6L5lG7lM4hN8oQ0"
        ) as unknown as BufferSource,
      });

      try {
        window.localStorage.setItem(PUSH_SUBSCRIBED_KEY, "true");
        window.localStorage.setItem("moon_news_push_subscription", JSON.stringify(subscription.toJSON()));
      } catch {}

      setSubscribed(true);
      setShow(false);
    } catch {
      // User blocked or error
    } finally {
      setLoading(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      window.localStorage.setItem(PUSH_PROMPT_KEY, "true");
      window.localStorage.setItem("moon_news_push_prompt_dismissed_at", String(Date.now()));
    } catch {}
  }, []);

  // Subscribed toast
  if (subscribed) {
    return (
      <div className={cn("fixed bottom-4 left-4 z-[60] flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-lg", className)}>
        <Check className="h-5 w-5 text-emerald-600" />
        <div>
          <p className="font-semibold">{locale === "rw" ? "Byemejwe!" : "Subscribed!"}</p>
          <p className="text-xs text-emerald-600/70">
            {locale === "rw"
              ? "Uzaba ushobora kubona amakuru y'ihangane."
              : "You'll receive breaking news alerts."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSubscribed(false)}
          className="ml-3 rounded-lg text-emerald-600 hover:bg-emerald-100 !px-1"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (!supported || !show) return null;

  return (
    <div className={cn("fixed bottom-4 left-4 right-4 z-[60] flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-[rgb(var(--surface))] p-4 sm:p-6 shadow-2xl animate-in slide-in-from-bottom duration-300", className)}>
      <div className="flex-1">
        <h3 className="font-serif text-base font-bold">{locale === "rw" ? "Amakuru y'ihangane" : "Breaking News Alerts"}</h3>
        <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
          {locale === "rw"
            ? "Umbone amakuru y'ihangane ku webe site yawe."
            : "Get breaking news alerts on your device."}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-3 sm:mt-0">
        <button
          type="button"
          onClick={subscribe}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
          <span>{t("notifications.enable")}</span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="btn-ghost !px-2 text-xs text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-subtle))]"
        >
          <BellOff className="h-3.5 w-3.5" />
          <span>{t("notifications.later")}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Converts a base64-encoded VAPID public key string to a Uint8Array.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default PushNotificationPrompt;
