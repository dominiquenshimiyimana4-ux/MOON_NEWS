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
import type { LiveEvent, LiveRequest } from "@/lib/types";
import type { User } from "@/lib/types";

/**
 * Reader-initiated "go live" requests.
 *
 * A signed-in user asks for permission to broadcast (a title, a short
 * description and the stream link they intend to use). The request lands in a
 * queue that authors and admins review; approving or rejecting it is recorded
 * here and the requester sees the outcome on their own dashboard.
 *
 * Persisted to localStorage for the demo, matching the other stores in this
 * codebase. Swap the read/write helpers for API calls to persist server-side.
 * The store also listens for cross-tab `storage` events, so an approval made in
 * the admin tab reaches the requester's tab without a page reload.
 */

export const LIVE_REQUESTS_STORAGE_KEY = "moon_news_live_requests";
const STORAGE_KEY = LIVE_REQUESTS_STORAGE_KEY;

export interface LiveRequestDraft {
  title: string;
  description: string;
  streamUrl: string;
}

interface LiveRequestContextValue {
  hydrated: boolean;
  /** Every request, newest first. */
  requests: LiveRequest[];
  /** Requests awaiting review, newest first. */
  pending: LiveRequest[];
  /** Requests submitted by one user, newest first. */
  mineFor: (userId: string) => LiveRequest[];
  /** Approved requests, exposed as live events for the public Live page. */
  approvedEvents: LiveEvent[];
  /** The user's most recent request, regardless of status. */
  latestFor: (userId: string) => LiveRequest | null;
  /** Submit a new request to go live. Returns the created request. */
  requestLive: (user: User, draft: LiveRequestDraft) => LiveRequest;
  /** Approve a request (author/admin action). */
  approve: (id: string, reviewerName: string) => void;
  /** Reject a request, optionally with a note (author/admin action). */
  reject: (id: string, reviewerName: string, note?: string) => void;
  /** Withdraw the requester's own pending request. */
  cancel: (id: string) => void;
}

const LiveRequestContext = createContext<LiveRequestContextValue | undefined>(undefined);

/* ------------------------- Admin notification bridge ------------------------ */

/**
 * Live requests show up in the admin notification bell. The notification store
 * is client-side, so we mirror the request queue into its localStorage key. This
 * is what gives a signed-in admin a badge even when no admin tab is open.
 */
const NOTIFICATIONS_KEY = "moon_news_staff_notifications";

export const liveRequestNotificationId = (requestId: string) => `live-request-${requestId}`;

/** Minimal shape of a stored notification (avoids importing a provider). */
interface StoredNotification {
  id: string;
  type: string;
  title: { rw: string; en: string };
  body: { rw: string; en: string };
  createdAt: string;
  read: boolean;
  /** Recipient, when the notification is meant for one person (the requester). */
  userId?: string;
  href?: string;
}

function readNotifications(): StoredNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? (JSON.parse(raw) as StoredNotification[]) : [];
  } catch {
    return [];
  }
}

function writeNotifications(next: StoredNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
  } catch {
    /* storage full or disabled — the badge simply won't show */
  }
}

/** Add (or replace) a notification in the shared store. */
function pushNotification(
  n: Omit<StoredNotification, "createdAt" | "read">
): void {
  const entry: StoredNotification = { ...n, createdAt: new Date().toISOString(), read: false };
  writeNotifications([entry, ...readNotifications().filter((x) => x.id !== n.id)]);
}

/** Remove a notification from the shared store (e.g. the request was handled). */
function withdrawNotification(id: string): void {
  const all = readNotifications();
  const next = all.filter((n) => n.id !== id);
  if (next.length !== all.length) writeNotifications(next);
}

function readStored(): LiveRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LiveRequest[]) : [];
  } catch {
    return [];
  }
}

function byNewest(a: LiveRequest, b: LiveRequest): number {
  return +new Date(b.createdAt) - +new Date(a.createdAt);
}

export function LiveRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<LiveRequest[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRequests(readStored());
    setHydrated(true);
    // Pick up approvals/rejections made in another tab or window.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setRequests(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: LiveRequest[]) => {
    setRequests(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const requestLive = useCallback(
    (user: User, draft: LiveRequestDraft) => {
      // Reviewers need a badge even when no admin tab is open yet, so the
      // request is also written to the admin's persistent notification store.
      const request: LiveRequest = {
        id: `lr-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        title: draft.title.trim(),
        description: draft.description.trim(),
        streamUrl: draft.streamUrl.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      persist([request, ...requests]);
      // Remind the admin even if they have no admin tab open yet.
      pushNotification({
        id: liveRequestNotificationId(request.id),
        type: "live",
        title: {
          rw: "Ubusabe bushya bwa LIVE",
          en: "New live request",
        },
        body: {
          rw: `${user.name} asabye gukora LIVE: \u201c${request.title}\u201d.`,
          en: `${user.name} asked to go live: \u201c${request.title}\u201d.`,
        },
        href: "/admin/live-requests",
      });
      return request;
    },
    [requests, persist]
  );

  const review = useCallback(
    (id: string, status: LiveRequest["status"], reviewerName: string, note?: string) => {
      const target = requests.find((r) => r.id === id);
      persist(
        requests.map((r) =>
          r.id === id
            ? { ...r, status, reviewedBy: reviewerName, reviewedAt: new Date().toISOString(), note }
            : r
        )
      );
      // The request is no longer waiting on the admin: drop its admin reminder
      // and tell the requester the outcome.
      withdrawNotification(liveRequestNotificationId(id));
      if (target && target.status !== status) {
        const approved = status === "approved";
        pushNotification({
          id: `live-review-${id}-${status}`,
          type: "live",
          userId: target.userId,
          title: approved
            ? { rw: "Ubusabe bwa LIVE bwemejwe", en: "Your live request was approved" }
            : { rw: "Ubusabe bwa LIVE bwanze", en: "Your live request was declined" },
          body: {
            rw: approved
              ? `\u201c${target.title}\u201d \u2014 ubu urashobora gukora LIVE.`
              : `\u201c${target.title}\u201d${note ? ` \u2014 ${note}` : ""}`,
            en: approved
              ? `\u201c${target.title}\u201d \u2014 you can go live now.`
              : `\u201c${target.title}\u201d${note ? ` \u2014 ${note}` : ""}`,
          },
          href: "/live",
        });
      }
    },
    [requests, persist]
  );

  const approve = useCallback(
    (id: string, reviewerName: string) => review(id, "approved", reviewerName),
    [review]
  );

  const reject = useCallback(
    (id: string, reviewerName: string, note?: string) => review(id, "rejected", reviewerName, note),
    [review]
  );

  const cancel = useCallback(
    (id: string) => {
      persist(requests.filter((r) => r.id !== id));
      // Don't leave an admin with a badge for a withdrawn request.
      withdrawNotification(liveRequestNotificationId(id));
    },
    [requests, persist]
  );

  const value = useMemo<LiveRequestContextValue>(() => {
    const sorted = [...requests].sort(byNewest);
    return {
      hydrated,
      requests: sorted,
      pending: sorted.filter((r) => r.status === "pending"),
      mineFor: (userId) => sorted.filter((r) => r.userId === userId),
      latestFor: (userId) => sorted.find((r) => r.userId === userId) ?? null,
      approvedEvents: sorted
        .filter((r) => r.status === "approved")
        .map((r) => approvedToLiveEvent(r)),
      requestLive,
      approve,
      reject,
      cancel,
    };
  }, [hydrated, requests, requestLive, approve, reject, cancel]);

  return <LiveRequestContext.Provider value={value}>{children}</LiveRequestContext.Provider>;
}

/** A neutral cover for reader streams that is safe for `next/image`. */
const FALLBACK_COVER = "https://picsum.photos/seed/moon-live/1200/700";

/**
 * Turn an approved request into a live event so the public Live page can show
 * the stream the admin accepted.
 */
function approvedToLiveEvent(r: LiveRequest): LiveEvent {
  const when = r.reviewedAt ?? r.createdAt;
  return {
    id: `live-req-${r.id}`,
    slug: `live-${r.id}`,
    title: { rw: r.title, en: r.title },
    summary: {
      rw: r.description || "Isoko rya LIVE ryemejwe n'ubuyobozi.",
      en: r.description || "Live stream approved by the Moon News team.",
    },
    cover: FALLBACK_COVER,
    streamUrl: r.streamUrl,
    updates: [
      {
        id: `live-req-${r.id}-start`,
        time: when,
        type: "text",
        title: { rw: "LIVE yatangiye", en: "Live stream approved" },
        body: {
          rw: `${r.userName} yahawe uruhushya rwo gukora LIVE n'ubuyobozi.`,
          en: `${r.userName} was approved to go live by the Moon News team.`,
        },
      },
    ],
  };
}

export function useLiveRequests(): LiveRequestContextValue {
  const ctx = useContext(LiveRequestContext);
  if (!ctx) throw new Error("useLiveRequests must be used within LiveRequestProvider");
  return ctx;
}
