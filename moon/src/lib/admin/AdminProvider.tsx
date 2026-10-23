"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AdPayment,
  Advertisement,
  AdvertiserAccount,
  Article,
  MediaItem,
  MonetizationStatus,
} from "@/lib/types";
import { articles as seedArticles } from "@/lib/data/articles";
import { ARTICLES_STORAGE_KEY, refreshArticles } from "@/lib/data/articleStore";
import {
  advertisements as seedAds,
  advertiserAccounts as seedAdvertisers,
  adPayments as seedPayments,
} from "@/lib/data/advertising";
import { slugify } from "@/lib/utils";

const ARTICLES_KEY = ARTICLES_STORAGE_KEY;
const MEDIA_KEY = "moon_news_admin_media";
const ADS_KEY = "moon_news_admin_ads";
const ADVERTISERS_KEY = "moon_news_advertisers";
const AD_PAYMENTS_KEY = "moon_news_ad_payments";

function seedMedia(): MediaItem[] {
  return seedArticles.slice(0, 12).map((a, i) => ({
    id: `m${i + 1}`,
    name: `${a.slug}.jpg`,
    url: a.image,
    type: "image" as const,
    size: 180000 + i * 12345,
    alt: a.imageCaption ?? a.title.en,
    createdAt: a.publishedAt,
  }));
}

export type ArticleDraft = Partial<Omit<Article, "id">> & {
  title: string;
  excerpt: string;
  content: string;
};

export type AdDraft = Partial<Omit<Advertisement, "id">> & {
  advertiser: string;
};

export type AdvertiserDraft = Partial<Omit<AdvertiserAccount, "id" | "createdAt">> & {
  businessName: string;
  contactName: string;
  email: string;
};

export type AdPaymentDraft = Partial<Omit<AdPayment, "id" | "createdAt">> & {
  adId: string;
  amount: number;
};

interface AdminContextValue {
  hydrated: boolean;
  articles: Article[];
  media: MediaItem[];
  ads: Advertisement[];
  advertisers: AdvertiserAccount[];
  payments: AdPayment[];
  createArticle: (draft: ArticleDraft) => Article;
  updateArticle: (id: string, patch: Partial<Article> & ArticleDraft) => void;
  deleteArticle: (id: string) => void;
  toggleBreaking: (id: string) => void;
  toggleFeatured: (id: string) => void;
  addMedia: (item: Omit<MediaItem, "id" | "createdAt">) => void;
  deleteMedia: (id: string) => void;
  createAd: (draft: AdDraft) => Advertisement;
  updateAd: (id: string, patch: Partial<Advertisement>) => void;
  deleteAd: (id: string) => void;
  setAdStatus: (id: string, status: MonetizationStatus) => void;
  /** Advertiser self-service: submit a campaign for editorial review. */
  submitAdForReview: (draft: AdDraft) => Advertisement;
  /** Editorial review: approve a submitted campaign (publishes it). */
  approveAd: (id: string, reviewerName: string) => void;
  /** Editorial review: reject a submitted campaign, optionally with a note. */
  rejectAd: (id: string, reviewerName: string, note?: string) => void;
  /** Register a new advertising business account. */
  createAdvertiser: (draft: AdvertiserDraft) => AdvertiserAccount;
  /** Update an advertiser business profile. */
  updateAdvertiser: (id: string, patch: Partial<AdvertiserAccount>) => void;
  /** Record a payment from an advertiser against a campaign. */
  recordPayment: (draft: AdPaymentDraft) => AdPayment;
  /** Update a payment status (e.g. mark pending as paid). */
  setPaymentStatus: (id: string, status: AdPayment["status"]) => void;
  resetDemoData: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

function draftToArticle(draft: ArticleDraft, existing?: Article): Article {
  const base = existing ?? {
    id: `a-${Date.now()}`,
    views: 0,
    shares: 0,
    commentsCount: 0,
    publishedAt: new Date().toISOString(),
  } as Article;
  return {
    ...base,
    slug: draft.slug?.trim() || slugify(draft.title),
    title: { rw: draft.title, en: draft.title, ...(existing?.title ?? {}) },
    excerpt: { rw: draft.excerpt, en: draft.excerpt },
    content: { rw: draft.content, en: draft.content },
    category: draft.category ?? base.category ?? "rwanda",
    authorId: draft.authorId ?? base.authorId ?? "a1",
    image: draft.image ?? base.image ?? "https://picsum.photos/seed/moon/1200/800",
    imageCaption: draft.imageCaption ?? base.imageCaption,
    tags: draft.tags ?? base.tags ?? [],
    status: draft.status ?? base.status ?? "draft",
    featured: draft.featured ?? base.featured ?? false,
    breaking: draft.breaking ?? base.breaking ?? false,
    readingTime: draft.readingTime ?? base.readingTime ?? Math.max(1, Math.round(draft.content.split(/\s+/).length / 200)),
    updatedAt: new Date().toISOString(),
    seo: draft.seo ?? base.seo,
  };
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [advertisers, setAdvertisers] = useState<AdvertiserAccount[]>([]);
  const [payments, setPayments] = useState<AdPayment[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawA = window.localStorage.getItem(ARTICLES_KEY);
      const rawM = window.localStorage.getItem(MEDIA_KEY);
      const rawAd = window.localStorage.getItem(ADS_KEY);
      const rawAdv = window.localStorage.getItem(ADVERTISERS_KEY);
      const rawPay = window.localStorage.getItem(AD_PAYMENTS_KEY);
      setArticles(rawA ? JSON.parse(rawA) : seedArticles);
      setMedia(rawM ? JSON.parse(rawM) : seedMedia());
      setAds(rawAd ? JSON.parse(rawAd) : seedAds);
      setAdvertisers(rawAdv ? JSON.parse(rawAdv) : seedAdvertisers);
      setPayments(rawPay ? JSON.parse(rawPay) : seedPayments);
    } catch {
      setArticles(seedArticles);
      setMedia(seedMedia());
      setAds(seedAds);
      setAdvertisers(seedAdvertisers);
      setPayments(seedPayments);
    }
    setHydrated(true);
  }, []);

  const persistArticles = useCallback((next: Article[]) => {
    setArticles(next);
    window.localStorage.setItem(ARTICLES_KEY, JSON.stringify(next));
    // Let the public site (newsService) pick up newly published stories live.
    refreshArticles();
  }, []);

  const persistMedia = useCallback((next: MediaItem[]) => {
    setMedia(next);
    window.localStorage.setItem(MEDIA_KEY, JSON.stringify(next));
  }, []);

  const persistAds = useCallback((next: Advertisement[]) => {
    setAds(next);
    window.localStorage.setItem(ADS_KEY, JSON.stringify(next));
  }, []);

  const persistAdvertisers = useCallback((next: AdvertiserAccount[]) => {
    setAdvertisers(next);
    window.localStorage.setItem(ADVERTISERS_KEY, JSON.stringify(next));
  }, []);

  const persistPayments = useCallback((next: AdPayment[]) => {
    setPayments(next);
    window.localStorage.setItem(AD_PAYMENTS_KEY, JSON.stringify(next));
  }, []);

  const createArticle = useCallback(
    (draft: ArticleDraft) => {
      const article = draftToArticle(draft);
      persistArticles([article, ...articles]);
      return article;
    },
    [articles, persistArticles]
  );

  const updateArticle = useCallback(
    (id: string, patch: Partial<Article> & ArticleDraft) => {
      const next = articles.map((a) => (a.id === id ? draftToArticle(patch, a) : a));
      persistArticles(next);
    },
    [articles, persistArticles]
  );

  const deleteArticle = useCallback(
    (id: string) => persistArticles(articles.filter((a) => a.id !== id)),
    [articles, persistArticles]
  );

  const toggleBreaking = useCallback(
    (id: string) =>
      persistArticles(articles.map((a) => (a.id === id ? { ...a, breaking: !a.breaking } : a))),
    [articles, persistArticles]
  );

  const toggleFeatured = useCallback(
    (id: string) =>
      persistArticles(articles.map((a) => (a.id === id ? { ...a, featured: !a.featured } : a))),
    [articles, persistArticles]
  );

  const addMedia = useCallback(
    (item: Omit<MediaItem, "id" | "createdAt">) => {
      const next: MediaItem = {
        ...item,
        id: `m-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      persistMedia([next, ...media]);
    },
    [media, persistMedia]
  );

  const deleteMedia = useCallback(
    (id: string) => persistMedia(media.filter((m) => m.id !== id)),
    [media, persistMedia]
  );

  const createAd = useCallback(
    (draft: AdDraft) => {
      const ad: Advertisement = {
        id: `ad-${Date.now()}`,
        advertiser: draft.advertiser,
        placement: draft.placement ?? "homepage",
        type: draft.type ?? "banner",
        startDate: draft.startDate ?? new Date().toISOString(),
        endDate: draft.endDate ?? new Date().toISOString(),
        budget: draft.budget ?? 0,
        spent: draft.spent ?? 0,
        impressions: draft.impressions ?? 0,
        clicks: draft.clicks ?? 0,
        status: draft.status ?? "draft",
      };
      persistAds([ad, ...ads]);
      return ad;
    },
    [ads, persistAds]
  );

  const updateAd = useCallback(
    (id: string, patch: Partial<Advertisement>) =>
      persistAds(ads.map((a) => (a.id === id ? { ...a, ...patch, id } : a))),
    [ads, persistAds]
  );

  const deleteAd = useCallback(
    (id: string) => persistAds(ads.filter((a) => a.id !== id)),
    [ads, persistAds]
  );

  const setAdStatus = useCallback(
    (id: string, status: MonetizationStatus) =>
      persistAds(ads.map((a) => (a.id === id ? { ...a, status } : a))),
    [ads, persistAds]
  );

  // --- Advertiser self-service + editorial review -------------------------

  /**
   * A campaign created by an advertiser starts life as `pending` and carries the
   * owning advertiser id, so the editor queue and the advertiser dashboard can
   * both find it. It is not billable or visible until an editor approves it.
   */
  const submitAdForReview = useCallback(
    (draft: AdDraft) => {
      const ad: Advertisement = {
        id: `ad-${Date.now()}`,
        advertiser: draft.advertiser,
        advertiserId: draft.advertiserId,
        placement: draft.placement ?? "homepage",
        type: draft.type ?? "banner",
        startDate: draft.startDate ?? new Date().toISOString(),
        endDate: draft.endDate ?? new Date().toISOString(),
        budget: draft.budget ?? 0,
        spent: 0,
        impressions: 0,
        clicks: 0,
        headline: draft.headline,
        targetUrl: draft.targetUrl,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      persistAds([ad, ...ads]);
      return ad;
    },
    [ads, persistAds]
  );

  const approveAd = useCallback(
    (id: string, reviewerName: string) =>
      persistAds(
        ads.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "active",
                reviewedBy: reviewerName,
                reviewedAt: new Date().toISOString(),
                reviewNote: undefined,
              }
            : a
        )
      ),
    [ads, persistAds]
  );

  const rejectAd = useCallback(
    (id: string, reviewerName: string, note?: string) =>
      persistAds(
        ads.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "ended",
                reviewedBy: reviewerName,
                reviewedAt: new Date().toISOString(),
                reviewNote: note,
              }
            : a
        )
      ),
    [ads, persistAds]
  );

  // --- Advertiser accounts + payments -------------------------------------

  const createAdvertiser = useCallback(
    (draft: AdvertiserDraft) => {
      const account: AdvertiserAccount = {
        id: `adv-${Date.now()}`,
        userId: draft.userId ?? `u-${Date.now()}`,
        businessName: draft.businessName,
        contactName: draft.contactName,
        email: draft.email,
        phone: draft.phone,
        website: draft.website,
        category: draft.category ?? "Other",
        about: draft.about,
        createdAt: new Date().toISOString(),
      };
      persistAdvertisers([account, ...advertisers]);
      return account;
    },
    [advertisers, persistAdvertisers]
  );

  const updateAdvertiser = useCallback(
    (id: string, patch: Partial<AdvertiserAccount>) =>
      persistAdvertisers(advertisers.map((a) => (a.id === id ? { ...a, ...patch, id } : a))),
    [advertisers, persistAdvertisers]
  );

  const recordPayment = useCallback(
    (draft: AdPaymentDraft) => {
      const ad = ads.find((a) => a.id === draft.adId);
      const payment: AdPayment = {
        id: `pay-${Date.now()}`,
        adId: draft.adId,
        advertiserId: draft.advertiserId ?? ad?.advertiserId ?? "",
        advertiser: draft.advertiser ?? ad?.advertiser ?? "Unknown",
        amount: draft.amount,
        method: draft.method ?? "mobile_money",
        reference: draft.reference ?? `REF-${Date.now()}`,
        status: draft.status ?? "pending",
        createdAt: new Date().toISOString(),
      };
      persistPayments([payment, ...payments]);
      return payment;
    },
    [ads, payments, persistPayments]
  );

  const setPaymentStatus = useCallback(
    (id: string, status: AdPayment["status"]) =>
      persistPayments(payments.map((p) => (p.id === id ? { ...p, status } : p))),
    [payments, persistPayments]
  );

  const resetDemoData = useCallback(() => {
    persistArticles(seedArticles);
    persistMedia(seedMedia());
    persistAds(seedAds);
    persistAdvertisers(seedAdvertisers);
    persistPayments(seedPayments);
  }, [persistArticles, persistMedia, persistAds, persistAdvertisers, persistPayments]);

  const value = useMemo(
    () => ({
      hydrated,
      articles,
      media,
      ads,
      advertisers,
      payments,
      createArticle,
      updateArticle,
      deleteArticle,
      toggleBreaking,
      toggleFeatured,
      addMedia,
      deleteMedia,
      createAd,
      updateAd,
      deleteAd,
      setAdStatus,
      submitAdForReview,
      approveAd,
      rejectAd,
      createAdvertiser,
      updateAdvertiser,
      recordPayment,
      setPaymentStatus,
      resetDemoData,
    }),
    [
      hydrated,
      articles,
      media,
      ads,
      advertisers,
      payments,
      createArticle,
      updateArticle,
      deleteArticle,
      toggleBreaking,
      toggleFeatured,
      addMedia,
      deleteMedia,
      createAd,
      updateAd,
      deleteAd,
      setAdStatus,
      submitAdForReview,
      approveAd,
      rejectAd,
      createAdvertiser,
      updateAdvertiser,
      recordPayment,
      setPaymentStatus,
      resetDemoData,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
