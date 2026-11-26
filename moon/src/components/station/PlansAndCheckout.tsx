"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import type { BillingPeriod, Channel, ChannelPayment, ChannelPlan } from "@/lib/types";
import { channelService } from "@/lib/services/channelService";
import { formatRWF } from "@/lib/utils";

function statusChip(status: ChannelPayment["status"]) {
  if (status === "confirmed")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (status === "failed") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
  return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
}

/**
 * Plan catalogue + secure checkout flow.
 *
 * Checkout happens on the payment provider's hosted page: Moon News never sees
 * or stores card details. The station returns from the provider and confirms,
 * which activates the subscription.
 */
export function PlansAndCheckout({
  channel,
  plans,
  onDone,
}: {
  channel: Channel;
  plans: ChannelPlan[];
  onDone: () => Promise<void> | void;
}) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [checkout, setCheckout] = useState<ChannelPayment | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedRef = params.get("tx_ref");
    const returnedTransactionId = params.get("transaction_id");
    if (returnedRef && returnedTransactionId) {
      channelService.getMyChannel().then(({ payments }) => {
        const payment = payments.find((item) => item.providerRef === returnedRef);
        if (payment) {
          setCheckout(payment);
          setTransactionId(returnedTransactionId);
        }
        window.history.replaceState({}, "", window.location.pathname);
      }).catch(() => {
        setError("Could not load payment details. Refresh the page and try again.");
      });
    }
  }, []);

  const canSubscribe = channel.status === "approved" && channel.subscription.status !== "active";

  async function choose(plan: ChannelPlan) {
    setError("");
    setBusy(plan.id);
    try {
      const payment = await channelService.startCheckout(plan.id, period);
      setCheckout(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setBusy(null);
    }
  }

  async function confirm() {
    if (!checkout || !transactionId.trim()) {
      setError("Enter the transaction ID returned by the payment provider.");
      return;
    }
    setConfirming(true);
    setError("");
    try {
      await channelService.confirmPayment(checkout.providerRef, transactionId.trim());
      setCheckout(null);
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment confirmation failed.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div>
      {/* Billing period toggle */}
      <div className="mb-5 flex items-center justify-center gap-2">
        {(["monthly", "yearly"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${period === p
                ? "bg-brand-600 text-white"
                : "border border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
              }`}
          >
            {p === "monthly" ? "Monthly" : "Yearly · save 2 months"}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {!canSubscribe && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm ${channel.subscription.status === "active"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
            }`}
        >
          {channel.subscription.status === "active" ? (
            <>✅ Your channel is live on the <strong>{channel.subscription.planName}</strong> plan ({channel.subscription.billingPeriod} billing){channel.subscription.renewsAt ? `, renews ${new Date(channel.subscription.renewsAt).toLocaleDateString()}` : ""}.</>
          ) : channel.status === "pending" ? (
            <>⏳ Your channel is awaiting administrator review. Plans unlock once it is approved.</>
          ) : (
            <>Your channel was not approved yet — see the dashboard for the reviewer&apos;s note.</>
          )}
        </div>
      )}

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan, i) => {
          const price = plan.prices[period];
          const current = channel.subscription.plan === plan.id && channel.subscription.status === "active";
          return (
            <div
              key={plan.id}
              className={`card flex flex-col p-6 ${i === 1 ? "ring-2 ring-brand-600" : ""}`}
            >
              {i === 1 && (
                <span className="mb-2 w-fit rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-serif text-lg font-bold">{plan.name}</h3>
              <p className="mt-1 text-2xl font-extrabold">
                {formatRWF(price)}
                <span className="text-sm font-medium text-[rgb(var(--text-muted))]">/{period === "monthly" ? "mo" : "yr"}</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={!canSubscribe || busy !== null}
                onClick={() => choose(plan)}
                className={`mt-5 ${current ? "btn-outline" : "btn-primary"} w-full disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {busy === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {current ? "Current plan" : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Hosted checkout modal */}
      {checkout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !confirming && setCheckout(null)} aria-hidden />
          <div className="card relative w-full max-w-md p-6">
            <h3 className="font-serif text-lg font-bold">Secure checkout</h3>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
              {checkout.planName} · {checkout.billingPeriod} · <strong>{formatRWF(checkout.amount)}</strong>
            </p>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-[rgb(var(--bg-subtle))] p-3 text-xs text-[rgb(var(--text-muted))]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              You&apos;ll pay on our payment provider&apos;s secure hosted page. Moon News never
              sees or stores your card details. Reference{" "}
              <strong className="ml-1">{checkout.providerRef}</strong>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              {checkout.checkoutUrl && (
                <a
                  href={checkout.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full"
                >
                  <ExternalLink className="h-4 w-4" /> Open secure payment page
                </a>
              )}
              <label className="label" htmlFor="flutterwave-transaction-id">Payment transaction ID</label>
              <input
                id="flutterwave-transaction-id"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                className="input"
                placeholder="Enter the transaction ID from Flutterwave"
              />
              <button
                type="button"
                className="btn-outline w-full"
                disabled={confirming}
                onClick={confirm}
              >
                {confirming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Verify payment
              </button>
              <button
                type="button"
                className="btn-ghost w-full text-sm"
                disabled={confirming}
                onClick={() => setCheckout(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment status hint */}
      <p className="mt-4 text-center text-xs text-[rgb(var(--text-muted))]">
        Payment status: pending payments appear in <span className={`chip ${statusChip("pending")}`}>pending</span>{" "}
        until the provider confirms; your channel goes live only after confirmation.
      </p>
    </div>
  );
}
