import "server-only";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getSession, type Role, type Session } from "@/lib/auth/session";

const RANK: Record<Role, number> = {
  user: 0,
  editor: 1,
  admin: 2,
  super_admin: 3,
};

export function hasRole(session: Session | null, minimum: Role): boolean {
  if (!session) return false;
  return RANK[session.role] >= RANK[minimum];
}

/**
 * The authoritative access check — layer 2 of the three in §8.1.
 *
 * Two deliberate behaviours:
 *
 * - **Not signed in → redirect to /login.** That is a usability decision; there
 *   is nothing to hide from someone who has not authenticated.
 * - **Signed in but under-privileged → 404, not 403.** A 403 confirms the page
 *   exists. An editor probing /admin/settings should learn nothing from the
 *   response.
 */
export async function requireRole(minimum: Role): Promise<Session> {
  const session = await getSession();

  if (!session) redirect("/login");
  if (!hasRole(session, minimum)) notFound();

  return session;
}

/** Convenience for the common case. */
export async function requireStaff(): Promise<Session> {
  return requireRole("editor");
}
