"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, UserPlus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth/AuthProvider";
import { dashboardRouteFor, isAdminEmail, MIN_PASSWORD_LENGTH } from "@/lib/services/authService";
import { useLanguage } from "@/lib/i18n";

/** Newsroom staff addresses are provisioned internally, never self-registered. */
function isStaffEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return /@moonnews\.rw$/.test(normalized) && normalized !== "reader@moonnews.rw";
}

export function RegisterForm() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const { locale, t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Administrator/staff accounts are provisioned — they can never be created here.
    if (isAdminEmail(email)) {
      setError(
        locale === "rw"
          ? "Iyi imeyili ntishobora kwiyandikisha. Injira ukoresheje amakuru yawe."
          : "This e-mail address cannot be registered. Please sign in instead."
      );
      return;
    }
    if (isStaffEmail(email)) {
      setError(
        locale === "rw"
          ? "Konti z'abakozi zitegurwa n'ubuyobozi, ntiziyandikisha ku rukuta."
          : "Staff accounts are created by the newsroom, not self-registered."
      );
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        locale === "rw"
          ? `Ijambo ry'ibanga rigomba kuba nibura inyuguti ${MIN_PASSWORD_LENGTH}.`
          : `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      );
      return;
    }
    if (password !== confirm) {
      setError(locale === "rw" ? "Amagambo y'ibanga ntabwo ahuye." : "Passwords do not match.");
      return;
    }
    try {
      // Only reader accounts can be self-registered. Advertiser, author and
      // admin accounts are provisioned and sign in through the browser.
      const user = await register({ name, email, password, role: "reader" });
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
              <label className="label" htmlFor="name">{t("auth.name")}</label>
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="label" htmlFor="email">{t("auth.email")}</label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="password">{t("auth.password")}</label>
              <input id="password" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`} />
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

          <p className="mt-4 flex items-start gap-1.5 text-xs text-[rgb(var(--text-muted))]">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {locale === "rw"
              ? "Ijambo ry'ibanga rihindurwa muburyo buhishwe (hashed) mbere yo kubikwa."
              : "Your password is hashed before it is stored — only reader accounts can be created here."
            }
          </p>

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
