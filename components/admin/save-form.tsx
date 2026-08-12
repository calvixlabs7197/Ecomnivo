"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/actions/admin";

/**
 * Wraps an admin form so every screen reports success and failure the same way.
 *
 * The fields inside are plain server-rendered inputs; this is the only client
 * component in the form, and it exists solely to surface the action's result.
 */
export function SaveForm({
  action,
  children,
  submitLabel = "Save",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {children}

      <div className="sticky bottom-0 flex flex-wrap items-center gap-4 border-t border-rule bg-page py-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>

        {state.error ? (
          <p role="alert" className="text-sm text-critical">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="text-sm text-positive">
            {state.success}
          </p>
        ) : null}
      </div>
    </form>
  );
}
