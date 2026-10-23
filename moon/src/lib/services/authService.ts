import type { User, UserRole } from "@/lib/types";
import { users } from "@/lib/data/admin";
import { api, hasBackend, setToken, simulateLatency } from "./api";

const USER_KEY = "moon_news_user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  /** Account type chosen at sign-up. Defaults to a reader account. */
  role?: Extract<UserRole, "reader" | "advertiser">;
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
};

/** Demo credentials accepted by the local (no-backend) auth service. */
export const DEMO_ACCOUNTS: { email: string; password: string; role: UserRole }[] = [
  { email: "kajipo tefu", password: "kajipo123", role: "admin" },
  { email: "editor@moonnews.rw", password: "editor123", role: "editor" },
  { email: "author@moonnews.rw", password: "author123", role: "journalist" },
  { email: "reader@moonnews.rw", password: "reader123", role: "reader" },
  { email: "ads@bk.rw", password: "ads123", role: "advertiser" },
];

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

function fakeToken(user: User): string {
  // Demo-only token. Never use this shape in production; the backend issues real JWTs.
  const payload = btoa(JSON.stringify({ sub: user.id, role: user.role, iat: Date.now() }));
  return `demo.${payload}.signature`;
}

/**
 * Deterministic user id derived from an email address.
 *
 * Demo accounts that are not in the users directory (for example a business
 * signing in with its own advertising credentials) need an id that stays the
 * same across logins — otherwise the advertiser account they registered would
 * be orphaned every time they sign back in.
 */
function stableUserId(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return `u-${hash.toString(36)}`;
}

export const authService = {
  async login({ email, password }: LoginPayload): Promise<AuthResponse> {
    if (hasBackend) {
      const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
      setToken(res.token);
      storeUser(res.user);
      return res;
    }
    await simulateLatency(500);
    const demo = DEMO_ACCOUNTS.find(
      (d) => d.email.toLowerCase() === email.trim().toLowerCase()
    );
    const known = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!demo || demo.password !== password) {
      throw new Error("Invalid email or password.");
    }
    const user: User =
      known ?? {
        // Deterministic id: the same email always resolves to the same account,
        // so a business registered on first login is still found on the next.
        id: stableUserId(email.trim().toLowerCase()),
        name: email.split("@")[0],
        email: email.trim(),
        role: demo.role,
        createdAt: new Date().toISOString(),
      };
    const token = fakeToken(user);
    setToken(token);
    storeUser(user);
    return { token, user };
  },

  async register({ name, email, password, role = "reader" }: RegisterPayload): Promise<AuthResponse> {
    if (hasBackend) {
      const res = await api.post<AuthResponse>("/api/auth/register", {
        name,
        email,
        password,
        role,
      });
      setToken(res.token);
      storeUser(res.user);
      return res;
    }
    await simulateLatency(500);
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    const user: User = {
      id: stableUserId(email.trim().toLowerCase()),
      name: name.trim(),
      email: email.trim(),
      role,
      createdAt: new Date().toISOString(),
    };
    const token = fakeToken(user);
    setToken(token);
    storeUser(user);
    return { token, user };
  },

  async logout(): Promise<void> {
    if (hasBackend) await api.post("/api/auth/logout").catch(() => undefined);
    setToken(null);
    storeUser(null);
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
  if (user.role === "journalist") return "/author";
  return "/admin";
}
