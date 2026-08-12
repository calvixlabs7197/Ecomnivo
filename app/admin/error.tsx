"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The admin's error boundary.
 *
 * It shows the real message. This is a staff-only area behind an authenticated
 * layout, and an admin who cannot see "data/guides.json is not valid JSON"
 * cannot fix it — the reasons to hide error detail from the public do not apply
 * on this side of the login.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="max-w-reading rounded-lg border border-critical/30 bg-page p-6">
      <div className="flex items-center gap-2 text-critical">
        <AlertTriangle aria-hidden="true" className="size-5" />
        <h1 className="text-h3">Something failed on this screen</h1>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        Nothing was saved. The message below is the underlying error.
      </p>

      <pre className="mt-4 overflow-x-auto rounded-md border border-rule bg-surface p-3 font-mono text-xs text-ink">
        {error.message}
        {error.digest ? `\n\ndigest: ${error.digest}` : ""}
      </pre>

      <div className="mt-5">
        <Button onClick={reset} size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}
