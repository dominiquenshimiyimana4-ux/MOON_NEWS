"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { AdPayment, Advertisement, AdvertiserAccount, User } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAdmin, type AdPaymentDraft } from "@/lib/admin/AdminProvider";

/**
 * Advertiser-scoped view over the shared advertising store.
 *
 * The self-service advertiser dashboard and the editor/admin review queues read
 * and write the same campaigns (persisted by AdminProvider), so an ad submitted
 * here immediately shows up for editors to approve. This provider simply scopes
 * that shared data to the business account owned by the signed-in user.
 */
interface AdvertiserContextValue {
  user: User | null;
  hydrated: boolean;
  /** The business account belonging to the signed-in user, if any. */
  account: AdvertiserAccount | null;
  /** The advertiser's own campaigns, newest first. */
  myAds: Advertisement[];
  /** Payments recorded against the advertiser's campaigns, newest first. */
  myPayments: AdPayment[];
  /** Register a business account for the signed-in user. */
  registerBusiness: (draft: {
    businessName: string;
    contactName: string;
    email: string;
    phone?: string;
    website?: string;
    category?: string;
    about?: string;
  }) => AdvertiserAccount | null;
}

const AdvertiserContext = createContext<AdvertiserContextValue | undefined>(undefined);

/** Finds the advertiser account owned by a user, matching by userId then email. */
function resolveAccount(
  user: User | null,
  accounts: AdvertiserAccount[]
): AdvertiserAccount | null {
  if (!user) return null;
  const byUser = accounts.find((a) => a.userId === user.id);
  if (byUser) return byUser;
  const byEmail = accounts.find((a) => a.email.toLowerCase() === user.email.toLowerCase());
  return byEmail ?? null;
}

export function AdvertiserProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const {
    hydrated: storeHydrated,
    ads,
    advertisers,
    payments,
    createAdvertiser,
  } = useAdmin();

  const account = useMemo(() => resolveAccount(user, advertisers), [user, advertisers]);

  const myAds = useMemo(() => {
    if (!account) return [];
    const mine = ads.filter((a) => a.advertiserId === account.id);
    return [...mine].sort((a, b) => +new Date(b.submittedAt ?? b.startDate) - +new Date(a.submittedAt ?? a.startDate));
  }, [ads, account]);

  const myPayments = useMemo(() => {
    if (!account) return [];
    const mine = payments.filter((p) => p.advertiserId === account.id);
    return [...mine].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [payments, account]);

  const value = useMemo<AdvertiserContextValue>(
    () => ({
      user,
      hydrated: authHydrated && storeHydrated,
      account,
      myAds,
      myPayments,
      registerBusiness: (draft) => {
        if (!user) return null;
        return createAdvertiser({ ...draft, userId: user.id });
      },
    }),
    [user, authHydrated, storeHydrated, account, myAds, myPayments, createAdvertiser]
  );

  return <AdvertiserContext.Provider value={value}>{children}</AdvertiserContext.Provider>;
}

export function useAdvertiser(): AdvertiserContextValue {
  const ctx = useContext(AdvertiserContext);
  if (!ctx) throw new Error("useAdvertiser must be used within AdvertiserProvider");
  return ctx;
}

export type { AdPaymentDraft };
