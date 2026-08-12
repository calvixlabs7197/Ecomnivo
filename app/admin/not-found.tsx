import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

/**
 * Also what an under-privileged staff member sees.
 *
 * `requireRole` answers 404 rather than 403 on purpose (see `lib/auth/guards`),
 * so this text has to work for both "no such screen" and "not yours" without
 * confirming which it was.
 */
export default function AdminNotFound() {
  return (
    <div className="max-w-reading rounded-lg border border-rule bg-page p-6">
      <h1 className="text-h3">Not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        This screen does not exist, or your role does not include it. The sidebar shows
        everything available to you.
      </p>
      <Link href="/admin" className={buttonStyles({ size: "sm", className: "mt-5" })}>
        Back to the dashboard
      </Link>
    </div>
  );
}
