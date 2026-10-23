"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useLanguage } from "@/lib/i18n";
import type { Theme } from "@/lib/types";
import { cn } from "@/lib/utils";

const icons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = icons[theme];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const opts: { value: Theme; label: string }[] = [
    { value: "light", label: t("common.light") },
    { value: "dark", label: t("common.dark") },
    { value: "system", label: t("common.system") },
  ];

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost h-9 w-9 rounded-full !px-0"
        aria-label={t("common.theme")}
        aria-expanded={open}
      >
        <Icon className="h-[18px] w-[18px]" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border border-border bg-surface shadow-card-hover">
          {opts.map((o) => {
            const OIcon = icons[o.value];
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  setTheme(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[rgb(var(--bg-subtle))]",
                  theme === o.value && "text-brand-600 font-semibold"
                )}
              >
                <OIcon className="h-4 w-4" />
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
