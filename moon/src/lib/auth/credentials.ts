"use client";

/**
 * Local credential vault used when the app runs without the API backend
 * (`NEXT_PUBLIC_API_URL` unset).
 *
 * Security rules enforced here:
 *  - Plain-text passwords are NEVER stored. Only a salted, 10 000-round
 *    SHA-256 digest is persisted (`{iterations}:{salt}:{hash}`).
 *  - The administrator account is provisioned by this module and its password
 *    is hashed exactly like every other account, so a stored record can never
 *    be read back as the original password.
 *  - The administrator e-mail is reserved: `registerAccount` refuses it, which
 *    keeps the public register form from creating or hijacking the admin.
 *
 * With a backend configured, bcrypt on the server is the source of truth and
 * this vault is not used.
 */

import type { User, UserRole } from "@/lib/types";

const VAULT_KEY = "moon_news_credentials";
/**
 * Version of the built-in account list. Bumping it re-provisions the staff
 * accounts once for existing browsers (their own sign-ups are kept).
 */
const VAULT_VERSION = "3";
const VAULT_VERSION_KEY = "moon_news_credentials_version";
const HASH_ITERATIONS = 10000;

/** Public roles a visitor may self-register. Staff roles are provisioned. */
export type PublicRole = Extract<UserRole, "reader" | "advertiser">;

export interface StoredCredential {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  /** Salted SHA-256 digest — never the plain password. */
  passwordHash: string;
  createdAt: string;
}

/* ----------------------------- Password hashing ---------------------------- */

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createSalt(): string {
  return randomSalt();
}

/**
 * Derives a salted digest of `password`. Uses Web Crypto (PBKDF2-based key
 * derivation through repeated SHA-256) and is only ever run in the browser.
 */
export async function hashPassword(password: string, salt = createSalt()): Promise<string> {
  const encoder = new TextEncoder();
  let data = encoder.encode(`moon-news:${salt}:${password}`);
  for (let i = 0; i < HASH_ITERATIONS; i++) {
    data = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  }
  return `${HASH_ITERATIONS}:${salt}:${toHex(data.buffer as ArrayBuffer)}`;
}

/** Constant-time-ish comparison of two hashes. */
export function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [iterations, salt, expected] = stored.split(":");
  if (!iterations || !salt || !expected) return Promise.resolve(false);
  return hashPassword(password, salt).then((computed) => {
    const actual = computed.split(":")[2] ?? "";
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

/* ------------------------------- The vault --------------------------------- */

/** Deterministic user id derived from an e-mail (same email → same account). */
export function stableUserId(email: string): string {
  let hash = 0;
  const normalized = email.trim().toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return `u-${hash.toString(36)}`;
}

/** Administrator sign-in address. Self-registration for this e-mail is blocked. */
export const ADMIN_EMAIL = "nshimiyimanadominique4@gmail.com";
const ADMIN_NAME = "Dominique Nshimiyimana";
const ADMIN_PASSWORD = "Dominique@2006";

/** Staff sign-in for the author studio. */
export const AUTHOR_EMAIL = "authormoonnews@gmail.com";
/** Advertiser sign-in for the self-service advertiser dashboard. */
export const ADVERTISER_EMAIL = "advertisermoonnews@gmail.com";

export function isReservedEmail(email: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

function readVault(): StoredCredential[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VAULT_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredCredential[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeVault(credentials: StoredCredential[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VAULT_KEY, JSON.stringify(credentials));
}

function findCredential(email: string): StoredCredential | undefined {
  const normalized = email.trim().toLowerCase();
  return readVault().find((c) => c.email === normalized);
}

/**
 * Seeds the built-in accounts once per browser. Passwords are hashed at seed
 * time, so no plain-text password is left in storage afterwards.
 */
const BUILT_IN_ACCOUNTS: { email: string; name: string; password: string; role: UserRole }[] = [
  { email: ADMIN_EMAIL, name: ADMIN_NAME, password: ADMIN_PASSWORD, role: "admin" },
  { email: AUTHOR_EMAIL, name: "Moon News Author", password: "Author01", role: "journalist" },
  {
    email: ADVERTISER_EMAIL,
    name: "Moon News Advertiser",
    password: "advertiser02",
    role: "advertiser",
  },
  { email: "editor@moonnews.rw", name: "Moon News Editor", password: "editor123", role: "editor" },
  { email: "reader@moonnews.rw", name: "Moon News Reader", password: "reader123", role: "reader" },
];

let seeding: Promise<void> | null = null;

/** Ensures the built-in accounts exist; safe to call on every auth request. */
export async function ensureVaultSeeded(): Promise<void> {
  if (seeding) return seeding;
  seeding = (async () => {
    const vault = readVault();
    const version = typeof window === "undefined" ? null : window.localStorage.getItem(VAULT_VERSION_KEY);
    const stale = version !== VAULT_VERSION;

    // (Re-)provision any built-in account that is missing or outdated. Accounts
    // created by the visitor themselves are left untouched.
    const seeded = [...vault];
    let changed = vault.length === 0 || stale;
    for (const account of BUILT_IN_ACCOUNTS) {
      const email = account.email.toLowerCase();
      const index = seeded.findIndex((c) => c.email === email);
      const existing = index >= 0 ? seeded[index] : undefined;
      const matches =
        !!existing &&
        existing.role === account.role &&
        (await verifyPassword(account.password, existing.passwordHash));
      if (matches) continue;
      const credential: StoredCredential = {
        userId: stableUserId(email),
        email,
        name: account.name,
        role: account.role,
        passwordHash: await hashPassword(account.password),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      if (index >= 0) seeded[index] = credential;
      else seeded.push(credential);
      changed = true;
    }

    if (changed) {
      writeVault(seeded);
      if (typeof window !== "undefined") window.localStorage.setItem(VAULT_VERSION_KEY, VAULT_VERSION);
    }
  })();
  return seeding;
}

/** Checks e-mail + password against the stored hash. */
export async function checkCredentials(
  email: string,
  password: string
): Promise<StoredCredential | null> {
  await ensureVaultSeeded();
  const credential = findCredential(email);
  if (!credential) return null;
  return (await verifyPassword(password, credential.passwordHash)) ? credential : null;
}

/**
 * Creates a new self-service account. Admin/staff roles and the reserved admin
 * e-mail are rejected — those accounts are provisioned, not registered.
 */
export async function createCredential(input: {
  name: string;
  email: string;
  password: string;
  role?: PublicRole;
}): Promise<StoredCredential> {
  await ensureVaultSeeded();
  const email = input.email.trim().toLowerCase();

  if (!email) throw new Error("E-mail is required.");
  if (!input.password || input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  if (isReservedEmail(email)) {
    throw new Error("This e-mail address cannot be registered. Sign in instead.");
  }
  if (findCredential(email)) {
    throw new Error("Email already in use.");
  }

  const credential: StoredCredential = {
    userId: stableUserId(email),
    email,
    name: input.name.trim(),
    role: input.role ?? "reader",
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  writeVault([...readVault(), credential]);
  return credential;
}

/** Turns a stored credential into the public `User` shape (no hash leaked). */
export function credentialToUser(credential: StoredCredential): User {
  return {
    id: credential.userId,
    name: credential.name,
    email: credential.email,
    role: credential.role,
    createdAt: credential.createdAt,
  };
}

/** Removes every stored credential (used by "reset demo data"). */
export function clearVault() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(VAULT_KEY);
  window.localStorage.removeItem(VAULT_VERSION_KEY);
  seeding = null;
}
