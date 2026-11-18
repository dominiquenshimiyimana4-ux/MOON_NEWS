"use client";

import { useCallback, useEffect, useState } from "react";
import type { Channel, ChannelPayment, ChannelPlan } from "@/lib/types";
import { channelService } from "@/lib/services/channelService";

export interface ChannelDashboardState {
  loading: boolean;
  error: string | null;
  channel: Channel | null;
  payments: ChannelPayment[];
  plans: ChannelPlan[];
  refresh: () => Promise<void>;
}

/**
 * Loads the signed-in station's channel, payment history and the plan
 * catalogue, with loading + error state handling for the whole station area.
 */
export function useChannelDashboard(): ChannelDashboardState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [payments, setPayments] = useState<ChannelPayment[]>([]);
  const [plans, setPlans] = useState<ChannelPlan[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await channelService.getMyChannel();
      setChannel(data.channel);
      setPayments(data.payments ?? []);
      setPlans(data.plans ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your channel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, channel, payments, plans, refresh: load };
}
