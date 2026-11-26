import type {
  BillingPeriod,
  Channel,
  ChannelPayment,
  ChannelPlan,
} from "@/lib/types";
import { api, hasBackend, simulateLatency } from "./api";

export interface ChannelDashboardData {
  channel: Channel | null;
  payments: ChannelPayment[];
  plans: ChannelPlan[];
}

/**
 * Channel service — talks to the backend channel API. When no backend is
 * configured the write operations fail with a clear message (stations need a
 * real account + review flow, so there is no offline fallback).
 */
export const channelService = {
  /** Public directory of live channels. */
  async listActive(): Promise<Channel[]> {
    if (!hasBackend) {
      await simulateLatency(150);
      return [];
    }
    return api.get<Channel[]>("/api/channels");
  },

  /** The signed-in station's channel, payment history and available plans. */
  async getMyChannel(): Promise<ChannelDashboardData> {
    if (!hasBackend) {
      await simulateLatency(150);
      throw new Error(
        "Station accounts need the Moon News backend, which is not configured."
      );
    }
    return api.get<ChannelDashboardData>("/api/channels/mine");
  },

  /** Submit (or resubmit) the channel for administrator review. */
  async saveChannel(input: {
    stationName: string;
    type: Channel["type"];
    description: string;
    location: string;
    streamUrl: string;
    logo?: string;
  }): Promise<Channel> {
    const existing = await this.getMyChannel();
    if (existing.channel) {
      return api.patch<Channel>("/api/channels/mine", input);
    }
    return api.post<Channel>("/api/channels", input);
  },

  /**
   * Start a subscription checkout. Returns the pending payment with the
   * provider's hosted checkout URL — card details are entered on the
   * provider's page, never on Moon News.
   */
  async startCheckout(
    planId: string,
    billingPeriod: BillingPeriod
  ): Promise<ChannelPayment> {
    return api.post<ChannelPayment>("/api/channels/subscribe", {
      planId,
      billingPeriod,
    });
  },

  /** Verify the hosted-checkout transaction and activate the subscription. */
  async confirmPayment(providerRef: string, transactionId: string): Promise<ChannelPayment> {
    return api.post<ChannelPayment>(
      `/api/channels/payments/${encodeURIComponent(providerRef)}/confirm`,
      { transactionId },
    );
  },

  async cancelSubscription(): Promise<Channel> {
    return api.delete<Channel>("/api/channels/mine/subscription");
  },
};
