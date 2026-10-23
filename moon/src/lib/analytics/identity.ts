"use client";

/**
 * Client-side visitor identity — privacy-first.
 *
 * We keep a random, opaque `moon_vid` token in localStorage (not a third-party
 * cookie, not a fingerprint) and a short-lived `moon_sid` session id. Neither
 * contains personal data; the server hashes the token before storing it and
 * rotates the hash daily so a visitor cannot be followed across days.
 */

const VID_KEY = "moon_vid";
const SID_KEY = "moon_sid";
const SESSION_TTL_MS = 30 * 60 * 1000; // a session idle-times out after 30 min
const SID_EXP_KEY = "moon_sid_exp";

function randomToken(): string {
  const c: Crypto | undefined = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (c?.randomUUID) return c.randomUUID().replace(/-/g, "");
  const bytes = new Uint8Array(16);
  if (c?.getRandomValues) {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Stable visitor token (rotated by the server, not here). */
export function getVisitorToken(): string {
  if (typeof window === "undefined") return "";
  let token = window.localStorage.getItem(VID_KEY);
  if (!token) {
    token = randomToken();
    window.localStorage.setItem(VID_KEY, token);
  }
  return token;
}

/** Session id, refreshed after the idle timeout so bursts group sensibly. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const now = Date.now();
  const exp = Number(window.localStorage.getItem(SID_EXP_KEY) ?? 0);
  let sid = window.localStorage.getItem(SID_KEY);
  if (!sid || now > exp) {
    sid = randomToken();
    window.localStorage.setItem(SID_KEY, sid);
  }
  window.localStorage.setItem(SID_EXP_KEY, String(now + SESSION_TTL_MS));
  return sid;
}

export function clearIdentity(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(VID_KEY);
  window.localStorage.removeItem(SID_KEY);
  window.localStorage.removeItem(SID_EXP_KEY);
}

/** Coarse device class derived from the user agent (not a fingerprint). */
export function detectDevice(): "desktop" | "mobile" | "tablet" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return "tablet";
  }
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

/** Best-effort browser name from the user agent. */
export function detectBrowser(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

/** Best-effort OS name from the user agent. */
export function detectOs(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Windows/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}
