import type { User, UserRole } from "@/lib/types";
import {
  ADMIN_EMAIL,
  isReservedEmail,
  type PublicRole,
} from "@/lib/auth/credentials";
import { api, hasBackend } from "./api";

const USER_KEY = "moon_news_user";
const TOKEN_KEY = "moon_news_token";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  /** Account type chosen at sign-up. Defaults to a reader account. */
  role?: PublicRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  journalist: "Journalist",
  reader: "Reader",
  advertiser: "Advertiser",
  station: "Station",
};

/** The administrator sign-in address (kept out of every public UI surface). */
export { ADMIN_EMAIL };

/** Minimum password length enforced on registration. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * True when e-mail/password match the administrator account. Used to keep the
 * admin credentials out of the register form even before hitting the service.
 */
export function isAdminEmail(email: string): boolean {
  return isReservedEmail(email);
}

/**
 * Role labels shown in demo hints. Credentials themselves are intentionally
 * NOT exported — the administrator password must never reach the client bundle.
 */
export const DEMO_ROLES: UserRole[] = ["editor", "journalist", "reader", "advertiser"];

export function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function storeUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

function storeToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const authService = {
  async login({ email, password }: LoginPayload): Promise<AuthResponse> {
    if (!hasBackend) {
      throw new Error("Sign-in is unavailable because the authentication service is not configured.");
    }
    const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
    storeUser(res.user);
    storeToken(res.token);
    return res;
  },

  async register({
    name,
    email,
    password,
    role = "reader",
  }: RegisterPayload): Promise<AuthResponse> {
    // Administrator accounts are provisioned, never self-registered.
    if (isReservedEmail(email)) {
      throw new Error("This e-mail address cannot be registered.");
    }
    if (hasBackend) {
      const res = await api.post<AuthResponse>("/api/auth/register", {
        name,
        email,
        password,
        role,
      });
      storeUser(res.user);
      storeToken(res.token);
      return res;
    }
    throw new Error("Registration is unavailable because the authentication service is not configured.");
  },

  async logout(): Promise<void> {
    if (hasBackend) await api.post("/api/auth/logout").catch(() => undefined);
    storeUser(null);
    storeToken(null);
  },

  currentUser(): User | null {
    return readStoredUser();
  },
};

export function canAccessAdmin(user: User | null): boolean {
  return !!user && ["admin", "editor", "journalist"].includes(user.role);
}

/** Advertisers get their own self-service dashboard, not the newsroom panel. */
export function canAccessAdvertiser(user: User | null): boolean {
  return !!user && (user.role === "advertiser" || canAccessAdmin(user));
}

/** Any staff member who can write and manage their own stories. */
export function canAccessAuthor(user: User | null): boolean {
  return !!user && ["admin", "editor", "journalist"].includes(user.role);
}

/**
 * Any authenticated account (including readers) can reach the reader
 * dashboard. Readers have no staff privileges, so this is intentionally the
 * broadest gate — it only requires a signed-in user.
 */
export function canAccessReader(user: User | null): boolean {
  return !!user;
}

/**
 * The single source of truth for where each role lands after signing in.
 *
 * Centralised so the login form, register form and header can never drift out
 * of sync: admin/editor -> newsroom admin, journalist -> author studio,
 * reader -> their own dashboard.
 */
export function dashboardRouteFor(user: User | null): string {
  if (!user) return "/login";
  if (user.role === "reader") return "/reader";
  if (user.role === "advertiser") return "/advertiser";
  if (user.role === "station") return "/station";
  if (user.role === "journalist") return "/author";
  return "/admin";
}
