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
import type { LiveRequest } from "@/lib/types";
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
 */

const STORAGE_KEY = "moon_news_live_requests";

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
  }, []);

  const persist = useCallback((next: LiveRequest[]) => {
    setRequests(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const requestLive = useCallback(
    (user: User, draft: LiveRequestDraft) => {
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
      return request;
    },
    [requests, persist]
  );

  const review = useCallback(
    (id: string, status: LiveRequest["status"], reviewerName: string, note?: string) => {
      persist(
        requests.map((r) =>
          r.id === id
            ? { ...r, status, reviewedBy: reviewerName, reviewedAt: new Date().toISOString(), note }
            : r
        )
      );
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
    (id: string) => persist(requests.filter((r) => r.id !== id)),
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
      requestLive,
      approve,
      reject,
      cancel,
    };
  }, [hydrated, requests, requestLive, approve, reject, cancel]);

  return <LiveRequestContext.Provider value={value}>{children}</LiveRequestContext.Provider>;
}

export function useLiveRequests(): LiveRequestContextValue {
  const ctx = useContext(LiveRequestContext);
  if (!ctx) throw new Error("useLiveRequests must be used within LiveRequestProvider");
  return ctx;
}
