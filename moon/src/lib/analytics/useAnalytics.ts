"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalyticsSnapshot, TrafficRange, VisitorFeed } from "@/lib/types";
import { analyticsService } from "@/lib/services/analyticsService";

interface UseAnalyticsResult {
  snapshot: AnalyticsSnapshot | null;
  range: TrafficRange;
  setRange: (range: TrafficRange) => void;
  loading: boolean;
  error: string | null;
  /** Polls a cheap endpoint and merges the fresh online count into the snapshot. */
  onlineNow: number;
  /**
   * Live visitor feed (today's counts + who is on the site). Refreshed on the
   * same short interval as the online counter, so a new visitor shows up in the
   * admin's box a few seconds after they land on the site.
   */
  feed: VisitorFeed | null;
  refresh: () => void;
}

/**
 * Loads the analytics snapshot for the admin dashboard and keeps the "online
 * now" number and the visitor feed live by polling the lightweight endpoint on
 * a short interval.
 */
export function useAnalytics(initialRange: TrafficRange = "7d", pollMs = 10_000): UseAnalyticsResult {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [range, setRange] = useState<TrafficRange>(initialRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineNow, setOnlineNow] = useState(0);
  const [feed, setFeed] = useState<VisitorFeed | null>(null);
  const mounted = useRef(true);

  const loadFeed = useCallback(async () => {
    const res = await analyticsService.online();
    if (!mounted.current || !res) return;
    setFeed(res);
    setOnlineNow(res.onlineNow);
  }, []);

  const load = useCallback(
    async (r: TrafficRange) => {
      setLoading(true);
      setError(null);
      const [snap] = await Promise.all([analyticsService.snapshot(r), loadFeed()]);
      if (!mounted.current) return;
      if (snap) {
        setSnapshot(snap);
        setOnlineNow(snap.onlineNow);
      } else {
        setError("Could not load analytics. Make sure you are signed in as an administrator.");
      }
      setLoading(false);
    },
    [loadFeed]
  );

  useEffect(() => {
    mounted.current = true;
    void load(range);
    return () => {
      mounted.current = false;
    };
  }, [range, load]);

  // Live online counter + visitor feed.
  useEffect(() => {
    const id = window.setInterval(() => void loadFeed(), pollMs);
    return () => window.clearInterval(id);
  }, [loadFeed, pollMs]);

  const refresh = useCallback(() => void load(range), [load, range]);

  return { snapshot, range, setRange, loading, error, onlineNow, feed, refresh };
}
