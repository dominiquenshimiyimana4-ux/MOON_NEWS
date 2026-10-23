"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalyticsSnapshot, TrafficRange } from "@/lib/types";
import { analyticsService } from "@/lib/services/analyticsService";

interface UseAnalyticsResult {
  snapshot: AnalyticsSnapshot | null;
  range: TrafficRange;
  setRange: (range: TrafficRange) => void;
  loading: boolean;
  error: string | null;
  /** Polls a cheap endpoint and merges the fresh online count into the snapshot. */
  onlineNow: number;
  refresh: () => void;
}

/**
 * Loads the analytics snapshot for the admin dashboard and keeps the "online
 * now" number live by polling the lightweight endpoint on a short interval.
 */
export function useAnalytics(initialRange: TrafficRange = "7d", pollMs = 15_000): UseAnalyticsResult {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [range, setRange] = useState<TrafficRange>(initialRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineNow, setOnlineNow] = useState(0);
  const mounted = useRef(true);

  const load = useCallback(async (r: TrafficRange) => {
    setLoading(true);
    setError(null);
    const snap = await analyticsService.snapshot(r);
    if (!mounted.current) return;
    if (snap) {
      setSnapshot(snap);
      setOnlineNow(snap.onlineNow);
    } else {
      setError("Could not load analytics. Make sure you are signed in as an administrator.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load(range);
    return () => {
      mounted.current = false;
    };
  }, [range, load]);

  // Live online counter.
  useEffect(() => {
    const id = window.setInterval(async () => {
      const res = await analyticsService.online();
      if (mounted.current && res) setOnlineNow(res.onlineNow);
    }, pollMs);
    return () => window.clearInterval(id);
  }, [pollMs]);

  const refresh = useCallback(() => void load(range), [load, range]);

  return { snapshot, range, setRange, loading, error, onlineNow, refresh };
}
