"use client";

import { useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { userService } from "@/lib/services/userService";

export function Newsletter() {
  const { locale, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await userService.subscribe(email);
    setStatus(res.ok ? "done" : "error");
    setMessage(res.message);
    if (res.ok) setEmail("");
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="relative grid gap-6 p-7 sm:p-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Mail className="h-3.5 w-3.5" /> Moon News
          </span>
          <h2 className="mt-4 font-serif text-2xl font-extrabold sm:text-3xl">{t("newsletter.title")}</h2>
          <p className="mt-2 max-w-md text-sm text-white/85">{t("newsletter.desc")}</p>
        </div>
        <form onSubmit={onSubmit} className="w-full">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter.emailPlaceholder")}
              className="w-full rounded-lg border-0 bg-white/95 px-4 py-3 text-sm text-ink-950 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-400"
              aria-label={t("newsletter.emailPlaceholder")}
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "done"}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-accent-400 px-5 py-3 text-sm font-bold text-ink-950 transition-colors hover:bg-accent-300 disabled:opacity-70"
            >
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "done" && <Check className="h-4 w-4" />}
              {status === "done" ? t("newsletter.subscribed") : t("newsletter.subscribe")}
            </button>
          </div>
          {message && (
            <p className={`mt-2 text-sm ${status === "error" ? "text-accent-200" : "text-white/85"}`}>
              {message}
            </p>
          )}
          <p className="mt-3 text-xs text-white/70">
            {locale === "rw"
              ? "Nta spam. Ushobora kwiyandukuza igihe cyose."
              : "No spam. Unsubscribe at any time."}
          </p>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;
