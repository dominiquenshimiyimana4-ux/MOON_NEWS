import type { UserRole } from "@/lib/types";

/** Public roles a visitor may self-register. Staff roles are provisioned. */
export type PublicRole = Extract<UserRole, "reader" | "advertiser" | "station">;

function env(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** Administrator sign-in address. Self-registration for this e-mail is blocked. */
export const ADMIN_EMAIL = env(
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  "dominiquenshimiyimana4@gmail.com"
).toLowerCase();

const AUTHOR_EMAIL = env(
  process.env.NEXT_PUBLIC_AUTHOR_EMAIL,
  "authormoonnews@gmail.com"
).toLowerCase();

export const ADVERTISER_EMAIL = env(
  process.env.NEXT_PUBLIC_ADVERTISER_EMAIL,
  "advertiser01@gmail.com"
).toLowerCase();

const RESERVED_EMAILS = [ADMIN_EMAIL, AUTHOR_EMAIL, ADVERTISER_EMAIL];

export function isReservedEmail(email: string): boolean {
  return RESERVED_EMAILS.includes(email.trim().toLowerCase());
}
