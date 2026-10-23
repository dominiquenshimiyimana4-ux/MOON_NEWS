"use client";

import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();
  const options: { code: "rw" | "en"; label: string }[] = [
    { code: "rw", label: "RW" },
    { code: "en", label: "EN" },
  ];
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border p-0.5",
        className
      )}
      role="group"
      aria-label={t("common.language")}
    >
      {options.map((o) => (
        <button
          key={o.code}
          type="button"
          onClick={() => setLocale(o.code)}
          aria-pressed={locale === o.code}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold transition-colors",
            locale === o.code
              ? "bg-brand-600 text-white"
              : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
