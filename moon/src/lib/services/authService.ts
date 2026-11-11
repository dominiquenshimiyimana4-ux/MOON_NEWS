import type { User, UserRole } from "@/lib/types";
import {
  ADMIN_EMAIL,
  checkCredentials,
  createCredential,
  credentialToUser,
  isReservedEmail,
  type PublicRole,
} from "@/lib/auth/credentials";
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

function fakeToken(user: User): string {
  // Demo-only token. Never use this shape in production; the backend issues real JWTs.
  const payload = btoa(JSON.stringify({ sub: user.id, role: user.role, iat: Date.now() }));
  return `demo.${payload}.signature`;
}

export const authService = {
  async login({ email, password }: LoginPayload): Promise<AuthResponse> {
    if (hasBackend) {
      const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
      setToken(res.token);
      storeUser(res.user);
      return res;
    }
    await simulateLatency(300);
    // Passwords are compared against a salted SHA-256 digest, never plain text.
    const credential = await checkCredentials(email, password);
    if (!credential) {
      throw new Error("Invalid email or password.");
    }
    const user = credentialToUser(credential);
    const token = fakeToken(user);
    setToken(token);
    storeUser(user);
    return { token, user };
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
      setToken(res.token);
      storeUser(res.user);
      return res;
    }
    await simulateLatency(300);
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    const credential = await createCredential({ name, email, password, role });
    const user = credentialToUser(credential);
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
