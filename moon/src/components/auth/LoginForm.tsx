"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth/AuthProvider";
import { dashboardRouteFor } from "@/lib/services/authService";
import { useLanguage } from "@/lib/i18n";

export function LoginForm() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const { locale, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const user = await login({ email, password });
      router.push(dashboardRouteFor(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/"><Logo showTagline /></Link>
        </div>
        <div className="card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10">
              <LogIn className="h-6 w-6" />
            </span>
            <h1 className="font-serif text-2xl font-extrabold">{t("auth.welcomeBack")}</h1>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
              {locale === "rw" ? "Injira muri konti yawe ya Moon News." : "Log in to your Moon News account."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">{t("auth.email")}</label>
              <input
                id="email"
                type="text"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">{t("auth.password")}</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {t("auth.login")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[rgb(var(--text-muted))]">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="font-semibold text-brand-600 hover:underline">
              {t("auth.register")}
            </Link>
          </p>

          {/* Advertising portal entry point. */}
          <div className="mt-5 rounded-xl border border-border bg-[rgb(var(--bg-subtle))] p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
              {locale === "rw" ? "Ikwamamaza" : "Advertising"}
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
              {locale === "rw"
                ? "Ufite ubucuruzi? Injira ukoresheje konti y'ikwamamaza ukoreshe amakuru yawe yose."
                : "Have a business? Sign in with your advertiser account to manage campaigns."}
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail("ads@bk.rw");
                setPassword("ads123");
                setError("");
              }}
              className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
            >
              {locale === "rw" ? "Koresha konti y'ikwamamaza (demo)" : "Use advertiser demo account"}
            </button>
          </div>
        </div>

        {/* Demo login banner hidden on purpose — staff and readers log in with their own
            credentials instead of the one-click demo accounts.
        <div className="mt-4 rounded-xl border border-border bg-[rgb(var(--bg-subtle))] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
            <ShieldCheck className="h-3.5 w-3.5" /> {t("auth.demoHint")}
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                }}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                {d.role}
              </button>
            ))}
          </div>
        </div>
        */}
      </div>
    </div>
  );
}

export default LoginForm;
