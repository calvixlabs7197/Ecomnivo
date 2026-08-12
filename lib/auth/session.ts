import "server-only";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { serverEnv, adminEnabled } from "@/config/server-env";

export const SESSION_COOKIE = "ecomnivo_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

/**
 * Roles live in `lib/auth/roles.ts` so client components can reason about them
 * without importing this server-only module. Re-exported here because this is
 * where callers expect to find them.
 */
export type { Role } from "@/lib/auth/roles";
import type { Role } from "@/lib/auth/roles";

export interface Session {
  sub: string;
  role: Role;
  /** Unix seconds. */
  exp: number;
}

const base64url = {
  encode: (input: string) => Buffer.from(input, "utf8").toString("base64url"),
  decode: (input: string) => Buffer.from(input, "base64url").toString("utf8"),
};

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Constant-time comparison.
 *
 * `===` on a signature leaks how many leading bytes matched, which is enough
 * to forge one given enough attempts. `timingSafeEqual` throws on differing
 * lengths, so the length check comes first.
 */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function createSessionToken(role: Role): string | null {
  const secret = serverEnv.AUTH_SECRET;
  if (!secret) return null;

  const session: Session = {
    sub: randomUUID(),
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const payload = base64url.encode(JSON.stringify(session));
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Verifies a token and returns the session, or null.
 *
 * Every failure path returns null rather than throwing or distinguishing
 * between "tampered", "expired" and "malformed" — the caller has no legitimate
 * use for the difference and an attacker does.
 */
export function verifySessionToken(token: string | undefined): Session | null {
  const secret = serverEnv.AUTH_SECRET;
  if (!secret || !token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, sign(payload, secret))) return null;

  try {
    const session = JSON.parse(base64url.decode(payload)) as Session;
    if (typeof session.exp !== "number" || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** The current session, read from the cookie. */
export async function getSession(): Promise<Session | null> {
  if (!adminEnabled) return null;
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Verifies the supplied password.
 *
 * Compared in constant time, and always against a same-length buffer so that
 * a wrong-length guess does not return measurably faster than a wrong-value
 * one.
 */
export function verifyPassword(candidate: string): boolean {
  const expected = serverEnv.ADMIN_PASSWORD;
  if (!expected) return false;

  const a = Buffer.from(candidate.padEnd(expected.length).slice(0, expected.length));
  const b = Buffer.from(expected);
  return timingSafeEqual(a, b) && candidate.length === expected.length;
}
