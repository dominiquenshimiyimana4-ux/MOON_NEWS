"use client";

import { Loader2 } from "lucide-react";
import { useChannelDashboard } from "@/lib/hooks/useChannelDashboard";
import { channelService } from "@/lib/services/channelService";
import { PlansAndCheckout } from "@/components/station/PlansAndCheckout";
import { PageHeader } from "@/components/admin/StatCard";

/** Station: subscription plans, prices and secure checkout. */
export default function StationPlansPage() {
  const { loading, error, channel, plans, refresh } = useChannelDashboard();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading plans…
      </div>
    );
  }

  if (error && !channel) {
    return (
      <div>
        <PageHeader title="Plans & Billing" />
        <div className="card border-red-300 p-6 text-sm text-red-700 dark:border-red-500/30 dark:text-red-300">{error}</div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div>
        <PageHeader title="Plans & Billing" subtitle="Register your channel first." />
        <p className="text-sm text-[rgb(var(--text-muted))]">
          Go to the <strong>Dashboard</strong> to submit your channel for review — plans unlock once it is approved.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Plans & Billing"
        subtitle="Pick the plan that fits your station. Your channel goes live after payment is confirmed."
      />
      <PlansAndCheckout channel={channel} plans={plans} onDone={refresh} />
    </div>
  );
}
