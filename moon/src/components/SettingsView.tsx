"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Globe, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useNotifications } from "@/lib/notifications/NotificationProvider";
import type { Theme } from "@/lib/types";
import { cn } from "@/lib/utils";

const notifLabels: Record<string, { rw: string; en: string }> = {
  breaking: { rw: "Amakuru yihutirwa", en: "Breaking news" },
  article: { rw: "Inkuru nshya", en: "New articles" },
  sports: { rw: "Imikino", en: "Sports updates" },
  technology: { rw: "Ikoranabuhanga", en: "Technology updates" },
};

export function SettingsView() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const { locale, setLocale, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { enabled, toggleCategory } = useNotifications();

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return <div className="container-page py-16 text-center text-sm text-[rgb(var(--text-muted))]">Loading…</div>;
  }

  const themes: { value: Theme; label: string }[] = [
    { value: "light", label: t("common.light") },
    { value: "dark", label: t("common.dark") },
    { value: "system", label: t("common.system") },
  ];

  return (
    <div className="container-page max-w-3xl py-8">
      <h1 className="mb-8 font-serif text-3xl font-extrabold">{t("nav.settings")}</h1>

      {/* Language */}
      <section className="card mb-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold">
          <Globe className="h-5 w-5 text-brand-600" /> {t("common.language")}
        </h2>
        <div className="flex gap-2">
          {(["rw", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
                locale === l ? "border-brand-600 bg-brand-600 text-white" : "border-border hover:bg-[rgb(var(--bg-subtle))]"
              )}
            >
              {l === "rw" ? "Kinyarwanda" : "English"}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section className="card mb-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold">
          <Moon className="h-5 w-5 text-brand-600" /> {t("common.theme")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {themes.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
                theme === opt.value ? "border-brand-600 bg-brand-600 text-white" : "border-border hover:bg-[rgb(var(--bg-subtle))]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold">
          <Bell className="h-5 w-5 text-brand-600" /> {locale === "rw" ? "Imenyesha" : "Push notifications"}
        </h2>
        <ul className="divide-y divide-[rgb(var(--border))]">
          {Object.keys(notifLabels).map((key) => {
            const on = enabled[key as keyof typeof enabled];
            return (
              <li key={key} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">
                  {locale === "rw" ? notifLabels[key].rw : notifLabels[key].en}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggleCategory(key as keyof typeof enabled)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    on ? "bg-brand-600" : "bg-[rgb(var(--border))]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                      on ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default SettingsView;
