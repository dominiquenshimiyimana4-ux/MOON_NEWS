"use client";

import { useEffect, useState } from "react";
import { Check, Minus, Plus, Printer } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { SaveButton } from "./SaveButton";
import { cn } from "@/lib/utils";

const STEPS = [0.95, 1.0625, 1.2, 1.35]; // rem

export function ArticleReaderControls({
  slug,
  url,
  className,
}: {
  slug: string;
  url: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const { resolved, setTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--article-font-size", `${STEPS[step]}rem`);
  }, [step]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-[rgb(var(--surface))] text-[rgb(var(--text-muted))] transition-colors hover:text-brand-600 hover:border-brand-500";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Font size */}
      <div className="flex items-center gap-1 rounded-lg border border-border p-1">
        <button type="button" className={iconBtn + " !h-7 !w-7 !border-0"} onClick={() => setStep((s) => Math.max(0, s - 1))} aria-label="Decrease font size" disabled={step === 0}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-xs font-semibold text-[rgb(var(--text-muted))]">{t("article.font")}</span>
        <button type="button" className={iconBtn + " !h-7 !w-7 !border-0"} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} aria-label="Increase font size" disabled={step === STEPS.length - 1}>
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button type="button" className={iconBtn} onClick={() => window.print()} aria-label={t("article.print")} title={t("article.print")}>
        <Printer className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        className={iconBtn}
        onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
        aria-label={t("common.theme")}
        title={t("common.theme")}
      >
        <span className="text-sm font-bold">{resolved === "dark" ? "☀" : "☾"}</span>
      </button>

      <button type="button" className={iconBtn} onClick={copy} aria-label={t("article.copyLink")} title={t("article.copyLink")}>
        {copied ? <Check className="h-[18px] w-[18px] text-emerald-500" /> : <span className="text-sm font-bold">⧉</span>}
      </button>

      <div className="rounded-lg border border-border">
        <SaveButton
          slug={slug}
          showLabel
          label={t("article.save")}
          savedLabel={t("article.saved")}
          className="px-3"
        />
      </div>
    </div>
  );
}

export default ArticleReaderControls;
