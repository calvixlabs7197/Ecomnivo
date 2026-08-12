/**
 * Roles, without a server dependency.
 *
 * `lib/auth/session.ts` imports `server-only`, so anything that needs to reason
 * about roles in the browser — the admin sidebar deciding which links to show,
 * the access screen drawing the permission matrix — cannot import from it.
 * The vocabulary lives here instead, and the session module re-exports it so
 * there is still one name for a role.
 *
 * The names match the `app_role` enum in the Supabase migrations.
 */
export type Role = "user" | "editor" | "admin" | "super_admin";

export const ROLE_RANK: Record<Role, number> = {
  user: 0,
  editor: 1,
  admin: 2,
  super_admin: 3,
};

export const ROLE_LABELS: Record<Role, string> = {
  user: "User",
  editor: "Editor",
  admin: "Admin",
  super_admin: "Super admin",
};

/** Ordered from least to most privileged, for tables that list every role. */
export const ROLES: readonly Role[] = ["user", "editor", "admin", "super_admin"];

export function roleAtLeast(role: Role | null | undefined, minimum: Role): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
