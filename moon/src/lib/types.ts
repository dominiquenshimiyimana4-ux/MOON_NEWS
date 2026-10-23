export type Locale = "rw" | "en";

export type Theme = "light" | "dark" | "system";

export type CategorySlug =
  | "rwanda"
  | "politics"
  | "business"
  | "sports"
  | "technology"
  | "health"
  | "education"
  | "entertainment"
  | "international"
  | "environment"
  | "agriculture"
  | "culture"
  | "science";

export interface Category {
  slug: CategorySlug;
  name: { rw: string; en: string };
  color: string; // tailwind-safe hex used for chips/accents
}

export type ArticleStatus =
  | "published"
  | "draft"
  | "scheduled"
  | "pending"
  | "rejected";

export interface Author {
  id: string;
  slug: string;
  name: string;
  position: string;
  bio: string;
  avatar: string;
  social: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    email?: string;
  };
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string; // ISO
  likes: number;
  parentId?: string | null;
  replies?: Comment[];
}

export interface Article {
  id: string;
  slug: string;
  title: { rw: string; en: string };
  subtitle?: { rw: string; en: string };
  excerpt: { rw: string; en: string };
  content: { rw: string; en: string };
  category: CategorySlug;
  authorId: string;
  image: string;
  imageCaption?: string;
  publishedAt: string; // ISO
  updatedAt?: string; // ISO
  readingTime: number; // minutes
  views: number;
  shares: number;
  commentsCount: number;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  breaking: boolean;
  source?: string;
  seo?: {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
  };
}

export interface VideoItem {
  id: string;
  slug: string;
  title: { rw: string; en: string };
  description: { rw: string; en: string };
  category: CategorySlug;
  thumbnail: string;
  duration: string; // mm:ss
  videoUrl: string;
  publishedAt: string;
  views: number;
}

export interface PhotoGallery {
  id: string;
  slug: string;
  title: { rw: string; en: string };
  cover: string;
  category: CategorySlug;
  publishedAt: string;
  photos: { url: string; caption: { rw: string; en: string } }[];
}

export interface LiveUpdate {
  id: string;
  time: string; // ISO
  title: { rw: string; en: string };
  body: { rw: string; en: string };
  media?: string;
  type: "text" | "photo" | "video";
}

export interface LiveEvent {
  id: string;
  slug: string;
  title: { rw: string; en: string };
  summary: { rw: string; en: string };
  cover: string;
  /** Playable live stream link (video/stream URL). Optional so an event can be text-only. */
  streamUrl?: string;
  updates: LiveUpdate[];
}

/** Status of a reader's request to broadcast a live stream. */
export type LiveRequestStatus = "pending" | "approved" | "rejected";

/** A user-initiated request to go live, reviewed by an author or admin. */
export interface LiveRequest {
  id: string;
  /** Signed-in user who asked to go live. */
  userId: string;
  userName: string;
  userRole: UserRole;
  /** Proposed title and short description of the broadcast. */
  title: string;
  description: string;
  /** The stream link the user intends to broadcast. */
  streamUrl: string;
  status: LiveRequestStatus;
  createdAt: string;
  /** Who reviewed it, and when. */
  reviewedBy?: string;
  reviewedAt?: string;
  /** Editor note shown to the requester on rejection. */
  note?: string;
}

export interface Notification {
  id: string;
  type: "breaking" | "article" | "sports" | "technology";
  title: { rw: string; en: string };
  body: { rw: string; en: string };
  createdAt: string;
  read: boolean;
  href?: string;
}

export type UserRole = "admin" | "editor" | "journalist" | "reader" | "advertiser";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  size: number; // bytes
  alt: string;
  createdAt: string;
}

export interface LocalizedText {
  rw: string;
  en: string;
}

/* ------------------------------ Analytics ------------------------------ */

/**
 * One recorded visit (a page view). Personal data is deliberately minimal and
 * privacy-safe: no IP address, no precise location, no cross-site identifiers.
 */
export interface Visit {
  id: string;
  /** Opaque, rotating visitor id (see visitor identity rules). */
  visitorId: string;
  /** Anonymous, short-lived session id grouping a burst of activity. */
  sessionId: string;
  /** Path viewed, e.g. "/news/technology/xyz". */
  page: string;
  /** Referrer host or "direct". */
  source: string;
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  /** Kept coarse on purpose (privacy): usually undefined. */
  country?: string;
  city?: string;
  /** ISO timestamps. */
  firstVisit: string;
  lastVisit: string;
  /** ISO date (YYYY-MM-DD) bucketed for daily uniques. */
  visitDate: string;
}

/** Aggregated visitor totals for the admin analytics dashboard. */
export interface VisitorStats {
  /** Unique visitors across the whole recorded period. */
  totalVisitors: number;
  /** Unique visitors today. */
  visitorsToday: number;
  /** Unique visitors over the last 7 days (rolling). */
  visitorsWeek: number;
  /** Unique visitors over the last 30 days (rolling). */
  visitorsMonth: number;
  /** Visitors active within the recent-activity window. */
  onlineNow: number;
  /** Visitors seen before today who came back. */
  returningVisitors: number;
  /** Visitors whose first-ever visit was today. */
  newVisitors: number;
  /** Total page views all-time. */
  totalPageViews: number;
  /** Page views today. */
  pageViewsToday: number;
  /** Visitors today vs. yesterday, as a signed percentage. */
  growthPct: number;
  /** Visitors gained today vs. yesterday (absolute). */
  growthToday: number;
  /** ISO timestamp of the last recorded visit. */
  lastUpdated: string;
}

/** A point on the visitor traffic chart. */
export type TrafficRange = "today" | "7d" | "30d" | "12m";

export interface TrafficPoint {
  label: string;
  /** ISO bucket key (hour, day or month). */
  bucket: string;
  visitors: number;
  pageViews: number;
}

export interface TrafficSeries {
  range: TrafficRange;
  points: TrafficPoint[];
  total: number;
}

/** A ranked list row (top articles, pages, sources, devices). */
export interface AnalyticsBreakdown {
  key: string;
  label: string;
  visitors: number;
  pageViews: number;
  sharePct: number;
}

export interface AnalyticsSnapshot {
  stats: VisitorStats;
  onlineNow: number;
  /** Rolling window, in seconds, used to decide who is "online". */
  onlineWindowSeconds: number;
  traffic: TrafficSeries;
  topArticles: AnalyticsBreakdown[];
  topPages: AnalyticsBreakdown[];
  trafficSources: AnalyticsBreakdown[];
  devices: AnalyticsBreakdown[];
  browsers: AnalyticsBreakdown[];
  generatedAt: string;
}

/* ----------------------------- Monetization ----------------------------- */

export type MonetizationStatus = "active" | "paused" | "ended" | "pending" | "draft" | "scheduled";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type InvoiceStatus = "paid" | "unpaid" | "overdue" | "draft";
export type PayoutStatus = "completed" | "processing" | "failed";

export interface Advertisement {
  id: string;
  advertiser: string;
  /** Owning advertiser account, when the campaign came from the self-service dashboard. */
  advertiserId?: string;
  placement: "homepage" | "article" | "sidebar" | "newsletter" | "category";
  type: "banner" | "video" | "native";
  startDate: string;
  endDate: string;
  budget: number; // RWF
  spent: number; // RWF
  impressions: number;
  clicks: number;
  status: MonetizationStatus;
  /** Creative assets supplied by the advertiser. */
  headline?: string;
  targetUrl?: string;
  /** Editor review trail. */
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

/** A registered business that buys advertising through the self-service dashboard. */
export interface AdvertiserAccount {
  id: string;
  /** The signed-in user who owns this account. */
  userId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  category: string;
  /** Short description of the business. */
  about?: string;
  createdAt: string;
}

export type AdPaymentMethod = "mobile_money" | "card" | "bank_transfer";

/** A payment an advertiser has made (or owes) against a campaign budget. */
export interface AdPayment {
  id: string;
  /** Campaign this payment settles. */
  adId: string;
  advertiserId: string;
  advertiser: string;
  amount: number; // RWF
  method: AdPaymentMethod;
  /** Reference / receipt number supplied by the advertiser. */
  reference: string;
  createdAt: string;
  status: PaymentStatus;
}

export interface SponsoredArticle {
  id: string;
  sponsor: string;
  articleTitle: string;
  category: CategorySlug;
  publishedAt: string;
  fee: number; // RWF
  views: number;
  status: MonetizationStatus;
}

export interface FeaturedListing {
  id: string;
  articleTitle: string;
  position: "top-banner" | "homepage-hero" | "category-top" | "trending-slot";
  advertiser: string;
  startDate: string;
  endDate: string;
  price: number; // RWF
  status: MonetizationStatus;
}

export type SubscriptionPlanName = "Basic" | "Premium" | "Pro";

export interface SubscriptionPlan {
  id: string;
  name: SubscriptionPlanName;
  priceMonthly: number; // RWF
  subscribers: number;
  churnRate: number; // percentage
  features: string[];
}

export interface Membership {
  id: string;
  memberName: string;
  email: string;
  tier: "supporter" | "patron" | "benefactor";
  monthlyAmount: number; // RWF
  joinedAt: string;
  status: MonetizationStatus;
}

export interface AffiliateLink {
  id: string;
  partner: string;
  program: string;
  clicks: number;
  conversions: number;
  commissionRate: number; // percentage
  revenue: number; // RWF
  status: MonetizationStatus;
}

export interface NewsletterSponsorship {
  id: string;
  sponsor: string;
  edition: string;
  sentAt: string;
  openRate: number; // percentage
  price: number; // RWF
  status: MonetizationStatus;
}

export interface MonetizedEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  ticketsSold: number;
  ticketPrice: number; // RWF
  sponsorRevenue: number; // RWF
  status: MonetizationStatus;
}

export interface Payment {
  id: string;
  source: string;
  payer: string;
  amount: number; // RWF
  method: "mobile_money" | "card" | "bank_transfer" | "paypal";
  date: string;
  status: PaymentStatus;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  issueDate: string;
  dueDate: string;
  amount: number; // RWF
  status: InvoiceStatus;
}

export interface Payout {
  id: string;
  recipient: string;
  method: "mobile_money" | "bank_transfer" | "paypal";
  amount: number; // RWF
  requestedAt: string;
  processedAt?: string;
  status: PayoutStatus;
}

export interface RevenueReportRow {
  month: string;
  advertising: number;
  sponsoredContent: number;
  subscriptions: number;
  affiliate: number;
  other: number;
}
