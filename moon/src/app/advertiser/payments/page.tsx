"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Wallet } from "lucide-react";
import { useAdvertiser } from "@/lib/advertiser/AdvertiserProvider";
import { useAdmin, type AdPaymentDraft } from "@/lib/admin/AdminProvider";
import type { AdPaymentMethod } from "@/lib/types";
import { formatRWF, timeAgo } from "@/lib/utils";
import { PageHeader, StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";

export default function AdvertiserPaymentsPage() {
  const { hydrated, account, myAds, myPayments } = useAdvertiser();
  const { recordPayment } = useAdmin();
  const [payFor, setPayFor] = useState<string | null>(null);
  const [method, setMethod] = useState<AdPaymentMethod>("mobile_money");

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  if (!account) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Register your business first." />
        <Link href="/advertiser" className="btn-primary">Go to dashboard</Link>
      </div>
    );
  }

  const paid = myPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pending = myPayments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const payable = myAds.find((a) => a.id === payFor);

  return (
    <div>
      <PageHeader title="Payments" subtitle="Pay for your campaigns and review your billing history." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Paid to date" value={formatRWF(paid)} icon={<CheckCircle2 className="h-5 w-5" />} accent="#16a34a" />
        <StatCard label="Pending" value={formatRWF(pending)} icon={<Clock className="h-5 w-5" />} accent="#ca8a04" />
        <StatCard label="Payments" value={myPayments.length} icon={<Wallet className="h-5 w-5" />} accent="#4c2fd0" />
        <StatCard label="Campaigns" value={myAds.length} icon={<Wallet className="h-5 w-5" />} accent="#0d9488" />
      </div>

      {/* Campaigns that can be paid for */}
      <h2 className="mb-3 font-serif text-lg font-bold">Pay for a campaign</h2>
      {myAds.filter((a) => a.status === "active").length === 0 ? (
        <p className="mb-6 text-sm text-[rgb(var(--text-muted))]">
          No live campaigns to pay for yet.
        </p>
      ) : (
        <div className="mb-8 space-y-2">
          {myAds
            .filter((a) => a.status === "active")
            .map((a) => (
              <div key={a.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold">{a.headline || a.advertiser}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">
                    Budget {formatRWF(a.budget)} · spent {formatRWF(a.spent)}
                  </p>
                </div>
                <button type="button" className="btn-primary" onClick={() => setPayFor(a.id)}>
                  <Wallet className="h-4 w-4" /> Make payment
                </button>
              </div>
            ))}
        </div>
      )}

      {/* History */}
      <h2 className="mb-3 font-serif text-lg font-bold">Payment history</h2>
      {myPayments.length === 0 ? (
        <EmptyState icon={<Wallet className="h-8 w-8" />} title="No payments yet" description="Your payment history will appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {myPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[rgb(var(--bg-subtle))]">
                  <td className="px-4 py-3 font-medium">{p.reference}</td>
                  <td className="px-4 py-3 text-[rgb(var(--text-muted))]">{p.method.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-right">{formatRWF(p.amount)}</td>
                  <td className="px-4 py-3 text-xs text-[rgb(var(--text-muted))]">{timeAgo(p.createdAt, "en")}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`chip shrink-0 capitalize ${p.status === "paid"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-[rgb(var(--text-muted))]">
        Payments are recorded locally for the demo and reviewed by the Super Admin.
      </p>

      {payable && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPayFor(null)} aria-hidden />
          <div className="card relative w-full max-w-sm p-6">
            <h3 className="font-serif text-lg font-bold">Make payment</h3>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
              Pay toward <strong>{payable.headline || payable.advertiser}</strong>. Our team confirms
              each payment before it clears.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium">Payment method</span>
              <select
                className="input"
                value={method}
                onChange={(e) => setMethod(e.target.value as AdPaymentMethod)}
              >
                <option value="mobile_money">Mobile money</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setPayFor(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const draft: AdPaymentDraft = {
                    adId: payable.id,
                    advertiserId: account.id,
                    advertiser: account.businessName,
                    amount: Math.max(0, payable.budget - payable.spent),
                    method,
                    status: "pending",
                  };
                  recordPayment(draft);
                  setPayFor(null);
                }}
              >
                Confirm payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
