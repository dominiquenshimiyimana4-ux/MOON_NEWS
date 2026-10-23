"use client";

import { useState } from "react";
import { Building2, Save } from "lucide-react";
import { useAdvertiser } from "@/lib/advertiser/AdvertiserProvider";

/**
 * Business registration form for advertisers.
 *
 * Shown the first time an advertiser opens their dashboard (before they have an
 * account). Registration creates the business profile that owns all of that
 * advertiser's campaigns.
 */
export function BusinessRegistration() {
  const { registerBusiness } = useAdvertiser();
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    category: "Other",
    about: "",
  });
  const [error, setError] = useState("");

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.businessName.trim()) return setError("Business name is required.");
    if (!form.contactName.trim()) return setError("Contact name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    setError("");
    registerBusiness({
      businessName: form.businessName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      website: form.website.trim() || undefined,
      category: form.category,
      about: form.about.trim() || undefined,
    });
  }

  return (
    <div className="card mx-auto max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-lg font-bold">Register your business</h2>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            This profile is the advertiser account that owns your campaigns.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Business name</span>
          <input
            className="input"
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            placeholder="e.g. Volcano Coffee"
            required
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Contact name</span>
          <input
            className="input"
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            placeholder="Full name"
            required
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@business.rw"
            required
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Phone</span>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+250 …"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Website</span>
          <input
            className="input"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://…"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Industry</span>
          <select
            className="input"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {["Finance", "Telecom", "Retail", "Hospitality", "Technology", "Health", "Education", "Other"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">About your business</span>
          <textarea
            className="input min-h-20"
            value={form.about}
            onChange={(e) => update("about", e.target.value)}
            placeholder="A short description shown to our team."
          />
        </label>

        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4" /> Register business
          </button>
        </div>
      </form>
    </div>
  );
}

export default BusinessRegistration;
