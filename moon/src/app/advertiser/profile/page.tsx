"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { useAdvertiser } from "@/lib/advertiser/AdvertiserProvider";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { PageHeader } from "@/components/admin/StatCard";

/** Edit the advertiser's business profile. */
export default function AdvertiserProfilePage() {
  const { hydrated, account } = useAdvertiser();
  const { updateAdvertiser } = useAdmin();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    category: "Other",
    about: "",
  });

  useEffect(() => {
    if (account) {
      setForm({
        businessName: account.businessName,
        contactName: account.contactName,
        email: account.email,
        phone: account.phone ?? "",
        website: account.website ?? "",
        category: account.category,
        about: account.about ?? "",
      });
    }
  }, [account]);

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  if (!account) {
    return (
      <div>
        <PageHeader title="Business Profile" subtitle="Register your business first." />
        <Link href="/advertiser" className="btn-primary">Go to dashboard</Link>
      </div>
    );
  }

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    updateAdvertiser(account.id, {
      businessName: form.businessName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      website: form.website.trim() || undefined,
      category: form.category,
      about: form.about.trim() || undefined,
    });
    setSaved(true);
  }

  return (
    <div>
      <PageHeader title="Business Profile" subtitle="Your advertiser account details." />

      {saved && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          Profile saved.
        </div>
      )}

      <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Business name</span>
          <input className="input" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} required />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Contact name</span>
          <input className="input" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} required />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Phone</span>
          <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Website</span>
          <input className="input" value={form.website} onChange={(e) => update("website", e.target.value)} />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Industry</span>
          <select className="input" value={form.category} onChange={(e) => update("category", e.target.value)}>
            {["Finance", "Telecom", "Retail", "Hospitality", "Technology", "Health", "Education", "Other"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">About</span>
          <textarea className="input min-h-20" value={form.about} onChange={(e) => update("about", e.target.value)} />
        </label>

        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4" /> Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
