import { Check, Minus } from "lucide-react";

import { requireRole } from "@/lib/auth/guards";
import { ROLES, ROLE_LABELS, roleAtLeast, type Role } from "@/lib/auth/roles";
import { adminEnabled } from "@/config/server-env";
import { serverEnv } from "@/config/server-env";
import { adminNav } from "@/components/admin/nav";
import { listActivity } from "@/lib/db/repositories";
import { formatDateTime, relativeTime } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import {
  Callout,
  DataTable,
  KeyValue,
  PageHeader,
  Panel,
  Td,
  Th,
} from "@/components/admin/ui";

/**
 * What each role can reach, and how sign-in currently works.
 *
 * There is no user list because there are no user accounts yet: this instance
 * authenticates with a single shared password from the environment and issues
 * a `super_admin` session. Saying that plainly is the point of the screen —
 * an admin panel that implies per-user accounts it does not have is worse than
 * one that documents the stopgap it is running.
 */
export default async function AdminAccessPage() {
  const session = await requireRole("admin");
  const activity = await listActivity();

  const signIns = activity.filter((entry) => entry.action === "auth.login").slice(0, 8);
  const expiresAt = new Date(session.exp * 1000).toISOString();

  const capabilities: Array<{ label: string; minRole: Role }> = [
    ...adminNav.flatMap((group) =>
      group.items.map((item) => ({ label: item.label, minRole: item.minRole })),
    ),
    { label: "Publish and hide calculators", minRole: "admin" },
    { label: "Create, edit and delete guides", minRole: "editor" },
    { label: "Create, edit and delete pages", minRole: "editor" },
    { label: "Edit categories", minRole: "admin" },
    { label: "Change site settings", minRole: "super_admin" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Access"
        description="Which role reaches which screen, and how this instance authenticates."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your session">
          <KeyValue
            rows={[
              { label: "Role", value: <Badge tone="brand">{ROLE_LABELS[session.role]}</Badge> },
              {
                label: "Session ID",
                value: <span className="font-mono text-xs">{session.sub}</span>,
              },
              { label: "Expires", value: `${formatDateTime(expiresAt)} (${relativeTime(expiresAt)})` },
              { label: "Cookie", value: "httpOnly, sameSite=lax, HMAC-signed" },
            ]}
          />
        </Panel>

        <Panel title="Authentication">
          <KeyValue
            rows={[
              {
                label: "Admin enabled",
                value: adminEnabled ? (
                  <Badge tone="positive">Yes</Badge>
                ) : (
                  <Badge tone="critical">No</Badge>
                ),
              },
              {
                label: "ADMIN_PASSWORD",
                value: serverEnv.ADMIN_PASSWORD ? (
                  <Badge tone="positive">Set</Badge>
                ) : (
                  <Badge tone="critical">Missing</Badge>
                ),
              },
              {
                label: "AUTH_SECRET",
                value: serverEnv.AUTH_SECRET ? (
                  <Badge tone="positive">Set</Badge>
                ) : (
                  <Badge tone="critical">Missing</Badge>
                ),
              },
              { label: "Session lifetime", value: "8 hours" },
              { label: "Failed sign-in limit", value: "8 per 15 minutes, per client" },
            ]}
          />
        </Panel>
      </div>

      <Panel
        title="Permissions"
        description="Roles are cumulative: every role includes everything below it."
      >
        <DataTable
          head={
            <>
              <Th>Capability</Th>
              {ROLES.map((role) => (
                <Th key={role} align="right">
                  {ROLE_LABELS[role]}
                </Th>
              ))}
            </>
          }
          minWidth="44rem"
        >
          {capabilities.map((capability) => (
            <tr key={capability.label}>
              <Td>{capability.label}</Td>
              {ROLES.map((role) => (
                <Td key={role} align="right">
                  {roleAtLeast(role, capability.minRole) ? (
                    <>
                      <Check aria-hidden="true" className="inline size-4 text-positive" />
                      <span className="sr-only">Allowed</span>
                    </>
                  ) : (
                    <>
                      <Minus aria-hidden="true" className="inline size-4 text-rule-strong" />
                      <span className="sr-only">Not allowed</span>
                    </>
                  )}
                </Td>
              ))}
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Recent sign-ins"
        description="Taken from the audit log, which records every successful sign-in."
      >
        {signIns.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">No sign-ins recorded yet.</p>
        ) : (
          <ul className="divide-y divide-rule">
            {signIns.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline gap-x-3 px-5 py-3 text-sm"
              >
                <span className="text-ink">Signed in as {entry.actor.replace("_", " ")}</span>
                <time
                  dateTime={entry.createdAt}
                  className="ml-auto text-xs tabular-nums text-muted"
                >
                  {formatDateTime(entry.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Callout tone="caution" title="There are no user accounts on this instance yet">
        Sign-in is one shared password read from <code className="font-mono">ADMIN_PASSWORD</code>,
        and it issues a super_admin session. The role model above is real — every screen and
        every mutation checks it server-side — but there is currently only one role to hand
        out. Supabase Auth replaces this with per-user accounts, at which point the roles
        become assignable and this screen grows a user list. Until then: treat the password
        as the credential it is, and do not share it.
      </Callout>

      <Callout title="Three layers, on purpose">
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-5">
          <li>
            <strong className="font-medium text-ink">Proxy.</strong> Redirects anyone without a
            session cookie to the login screen. It runs at the edge with no signing secret, so
            it is convenience, not security — a forged cookie passes it.
          </li>
          <li>
            <strong className="font-medium text-ink">Layout.</strong> Verifies the cookie
            signature server-side. Every page under /admin inherits it, and a forged cookie
            dies here.
          </li>
          <li>
            <strong className="font-medium text-ink">Each action.</strong> Re-checks the role
            before mutating anything, because a server action is reachable by POST without
            ever loading a page.
          </li>
        </ul>
      </Callout>
    </div>
  );
}
