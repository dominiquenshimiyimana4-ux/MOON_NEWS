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
  color: string;
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
  createdAt: string;
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
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
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
  duration: string;
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
  time: string;
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
  updates: LiveUpdate[];
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

export type UserRole = "admin" | "editor" | "journalist" | "reader";

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
  size: number;
  alt: string;
  createdAt: string;
}

export type MonetizationStatus = "active" | "paused" | "ended" | "pending" | "draft" | "scheduled";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type InvoiceStatus = "paid" | "unpaid" | "overdue" | "draft";
export type PayoutStatus = "completed" | "processing" | "failed";

export interface Advertisement {
  id: string;
  advertiser: string;
  placement: "homepage" | "article" | "sidebar" | "newsletter" | "category";
  type: "banner" | "video" | "native";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: MonetizationStatus;
}

export type SubscriptionPlanName = "Basic" | "Premium" | "Pro";

export interface SubscriptionPlan {
  id: string;
  name: SubscriptionPlanName;
  priceMonthly: number;
  subscribers: number;
  churnRate: number;
  features: string[];
}
