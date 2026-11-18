"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useChannelDashboard } from "@/lib/hooks/useChannelDashboard";
import { channelService } from "@/lib/services/channelService";
import { ChannelForm, type ChannelFormValues } from "@/components/station/ChannelForm";
import { PageHeader } from "@/components/admin/StatCard";

/** Station: view and update channel details (resubmits rejected channels). */
export default function StationChannelPage() {
  const { loading, error, channel, refresh } = useChannelDashboard();
  const [savingError, setSavingError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave(values: ChannelFormValues) {
    setSavingError("");
    setSaved(false);
    await channelService.saveChannel(values);
    setSaved(true);
    await refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading channel…
      </div>
    );
  }

  if (error && !channel) {
    return (
      <div>
        <PageHeader title="Channel Details" />
        <div className="card border-red-300 p-6 text-sm text-red-700 dark:border-red-500/30 dark:text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Channel Details"
        subtitle="Update your station's public profile on Moon News."
      />
      {saved && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          ✅ Saved. {channel?.status === "pending" ? "Your channel is in the review queue." : ""}
        </div>
      )}
      {savingError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {savingError}
        </div>
      )}
      <ChannelForm initial={channel} onSubmit={handleSave} submitLabel="Save changes" />
    </div>
  );
}
