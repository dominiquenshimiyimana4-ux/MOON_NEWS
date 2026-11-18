"use client";

import { CreditCard, CheckCircle2, Clock } from "lucide-react";
import { useChannelDashboard } from "@/lib/hooks/useChannelDashboard";
import { PageHeader, StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { formatRWF, timeAgo } from "@/lib/utils";

/** Station: complete payment history with status per transaction. */
export default function StationPaymentsPage() {
  const { loading, payments } = useChannelDashboard();

  if (loading) {
    return <div className="text-sm text-[rgb(var(--text-muted))]">Loading payments…</div>;
  }

  const confirmed = payments.filter((p) => p.status === "confirmed").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader title="Payment History" subtitle="Every subscription charge and its status." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Confirmed total" value={formatRWF(confirmed)} icon={<CheckCircle2 className="h-5 w-5" />} accent="#16a34a" />
        <StatCard label="Pending" value={formatRWF(pending)} icon={<Clock className="h-5 w-5" />} accent="#ca8a04" />
        <StatCard label="Transactions" value={payments.length} icon={<CreditCard className="h-5 w-5" />} accent="#4c2fd0" />
      </div>

      {payments.length === 0 ? (
        <EmptyState icon={<CreditCard className="h-8 w-8" />} title="No payments yet" description="Your checkout history will appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Period</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[rgb(var(--bg-subtle))]">
                  <td className="px-4 py-3 font-medium">{p.providerRef}</td>
                  <td className="px-4 py-3">{p.planName}</td>
                  <td className="px-4 py-3 capitalize text-[rgb(var(--text-muted))]">{p.billingPeriod}</td>
                  <td className="px-4 py-3 text-right">{formatRWF(p.amount)}</td>
                  <td className="px-4 py-3 text-xs text-[rgb(var(--text-muted))]">{timeAgo(p.createdAt, "en")}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`chip capitalize ${p.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : p.status === "failed"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
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
        Charges are processed by our secure payment provider — Moon News never stores card details.
      </p>
    </div>
  );
}
