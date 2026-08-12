import "server-only";
import { z } from "zod";

/**
 * Secrets. Server-only, and enforced as such.
 *
 * `import "server-only"` makes importing this from a Client Component a build
 * error rather than a silent leak. It is deliberately a separate module from
 * `config/env.ts`, which is imported by client code — putting a secret in that
 * file would be one careless import away from shipping it to the browser.
 *
 * None of these are validated eagerly. The public site must build and run with
 * no admin configured at all; the guards below are what fail, and only when
 * someone actually tries to sign in.
 */
const schema = z.object({
  /**
   * The local admin password.
   *
   * A stopgap for local development, replaced by Supabase Auth and real
   * role-based access control when the database is introduced. It is read from
   * the environment and never hardcoded (§15), and admin is simply unavailable
   * when it is unset.
   *
   * The floor is nine characters, lowered from twelve on the owner's decision.
   * It is a length check, not a strength one — the real defences are elsewhere:
   * the login form is throttled to 8 attempts per 15 minutes, every failure
   * returns one identical message, and the comparison is constant-time. A short
   * password still costs you most of the margin those buy, so a long random one
   * remains the right choice for anything public.
   */
  ADMIN_PASSWORD: z.string().min(9).optional(),

  /** HMAC key for the session cookie. Must be long and random. */
  AUTH_SECRET: z.string().min(32).optional(),
});

const parsed = schema.safeParse({
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  AUTH_SECRET: process.env.AUTH_SECRET,
});

export const serverEnv = parsed.success
  ? parsed.data
  : { ADMIN_PASSWORD: undefined, AUTH_SECRET: undefined };

/**
 * Admin is only reachable when both a password and a signing secret exist.
 *
 * Failing closed matters here: a missing secret must disable the panel, never
 * fall back to an unsigned or default-signed cookie.
 */
export const adminEnabled = Boolean(serverEnv.ADMIN_PASSWORD && serverEnv.AUTH_SECRET);

/** Explains the misconfiguration on the login screen instead of a blank 500. */
export function adminConfigProblem(): string | null {
  if (adminEnabled) return null;

  const missing: string[] = [];
  if (!serverEnv.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD (at least 9 characters)");
  if (!serverEnv.AUTH_SECRET) missing.push("AUTH_SECRET (at least 32 characters)");

  return `Admin is disabled. Set ${missing.join(" and ")} in .env.local and restart.`;
}
