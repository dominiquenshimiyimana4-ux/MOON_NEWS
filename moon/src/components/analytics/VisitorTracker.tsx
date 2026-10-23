"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { analyticsService } from "@/lib/services/analyticsService";
import {
  detectBrowser,
  detectDevice,
  detectOs,
  getSessionId,
  getVisitorToken,
} from "@/lib/analytics/identity";

/** How often an active visitor sends a heartbeat (keeps "Online now" accurate). */
const HEARTBEAT_MS = 45_000;
/** Idle visitors stop counting as online after this (matches the server window). */
const IDLE_MS = 120_000;

/**
 * Records a visit whenever the visitor opens or navigates the site.
 *
 * Mounted once at the app root. It:
 *   - sends a pageview on the first load and on every client-side navigation,
 *   - de-duplicates refreshes (the server also guards this per page/window),
 *   - sends heartbeats only while the visitor is actually interacting, so the
 *     "Online now" counter reflects real activity and drops idle visitors,
 *   - pauses entirely when the tab is hidden (backgrounded visitors expire).
 */
export function VisitorTracker() {
  const pathname = usePathname();
  const lastActivity = useRef<number>(Date.now());
  const lastPath = useRef<string>("");

  // Track interaction so heartbeats only fire for genuinely active visitors.
  useEffect(() => {
    const mark = () => {
      lastActivity.current = Date.now();
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll", "mousemove", "touchstart"];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, mark));
  }, []);

  // Send a pageview on load and on every route change.
  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;
    lastActivity.current = Date.now();

    void analyticsService.track({
      visitorToken: getVisitorToken(),
      sessionId: getSessionId(),
      page: pathname,
      source: document.referrer || "direct",
      device: detectDevice(),
      browser: detectBrowser(),
      os: detectOs(),
      kind: "pageview",
    });
  }, [pathname]);

  // Heartbeat loop: only while the tab is visible and the visitor is active.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastActivity.current > IDLE_MS) return;
      void analyticsService.track({
        visitorToken: getVisitorToken(),
        sessionId: getSessionId(),
        page: lastPath.current || "/",
        device: detectDevice(),
        browser: detectBrowser(),
        os: detectOs(),
        kind: "heartbeat",
      });
    };
    const id = window.setInterval(tick, HEARTBEAT_MS);
    // A quick heartbeat on becoming visible again so the count recovers fast.
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
