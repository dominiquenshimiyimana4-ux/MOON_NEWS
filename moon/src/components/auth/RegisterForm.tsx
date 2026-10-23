"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth/AuthProvider";
import { dashboardRouteFor } from "@/lib/services/authService";
import { useLanguage } from "@/lib/i18n";
import type { UserRole } from "@/lib/types";

export function RegisterForm() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const { locale, t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<Extract<UserRole, "reader" | "advertiser">>("reader");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(locale === "rw" ? "Amagambo y'ibanga ntabwo ahuye." : "Passwords do not match.");
      return;
    }
    try {
      const user = await register({ name, email, password, role });
      router.push(dashboardRouteFor(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
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
              <UserPlus className="h-6 w-6" />
            </span>
            <h1 className="font-serif text-2xl font-extrabold">{t("auth.createAccount")}</h1>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
              {locale === "rw"
                ? "Bika inkuru, utange ibitekerezo, ukurikire amakuru."
                : "Save stories, join the conversation, follow what matters."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <span className="label">{locale === "rw" ? "Ubwoko bwa konti" : "Account type"}</span>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "reader", label: locale === "rw" ? "Umukoresha" : "Reader" },
                  { value: "advertiser", label: locale === "rw" ? "Ikwamamaza" : "Advertiser" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      role === opt.value
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {role === "advertiser" && (
                <p className="mt-1.5 text-xs text-[rgb(var(--text-muted))]">
                  {locale === "rw"
                    ? "Uzakenera kwandikisha ubucuruzi bwawe nyuma yo kwinjira."
                    : "You'll register your business after signing in."}
                </p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="name">{t("auth.name")}</label>
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="label" htmlFor="email">{t("auth.email")}</label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="password">{t("auth.password")}</label>
              <input id="password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="label" htmlFor="confirm">{t("auth.confirmPassword")}</label>
              <input id="confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {t("auth.register")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[rgb(var(--text-muted))]">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
