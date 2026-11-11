"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, LogIn } from "lucide-react";
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

          {/* Security note. Staff credentials are never displayed here. */}
          <p className="mt-4 flex items-start gap-1.5 text-center text-xs text-[rgb(var(--text-muted))]">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {locale === "rw"
              ? "Amagambo y'ibanga abikwa mu buryo buhishwe (hashed) — ntabwo aboneka muri sisitemu."
              : "Passwords are stored as salted hashes and are never displayed."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
