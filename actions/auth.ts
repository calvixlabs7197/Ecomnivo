"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { headers } from "next/headers";
import { createHash } from "node:crypto";

import { adminEnabled } from "@/config/server-env";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth/session";
import { logActivity } from "@/lib/db/repositories";

/**
 * In-memory login throttle.
 *
 * Enough to stop an unattended script grinding through guesses against a local
 * instance. It resets when the process restarts, which is an acceptable
 * limitation for a stopgap that Supabase Auth replaces — a real deployment
 * gets rate limiting at the edge and account lockout from the auth provider.
 */
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function clientKey(forwardedFor: string | null): string {
  // Hashed, never stored raw — the same rule the contact form follows.
  return createHash("sha256").update(forwardedFor ?? "local").digest("hex").slice(0, 16);
}

function throttled(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export interface LoginState {
  error?: string;
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminEnabled) {
    return { error: "Admin is not configured on this instance." };
  }

  const headerList = await headers();
  const key = clientKey(headerList.get("x-forwarded-for"));

  if (throttled(key)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !verifyPassword(password)) {
    recordFailure(key);
    // One message for every failure mode. Distinguishing "wrong password" from
    // "no such user" is how enumeration attacks get their footing.
    return { error: "Incorrect password." };
  }

  attempts.delete(key);

  const token = createSessionToken("super_admin");
  if (!token) return { error: "Admin is not configured on this instance." };

  await setSessionCookie(token);
  await logActivity({
    actor: "admin",
    action: "auth.login",
    entityType: "session",
    entityId: "-",
    summary: "Signed in",
  });

  // Only ever redirect to an /admin path. An open redirect here would let a
  // crafted login link bounce a freshly authenticated admin to another origin.
  const next = formData.get("next");
  const destination =
    typeof next === "string" && next.startsWith("/admin") && !next.startsWith("//")
      ? (next as Route)
      : ("/admin" as Route);

  redirect(destination);
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
