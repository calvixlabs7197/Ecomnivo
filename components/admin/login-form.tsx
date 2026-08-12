"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LoginForm({
  next,
  configProblem,
}: {
  next: string;
  /** Explains a missing ADMIN_PASSWORD / AUTH_SECRET instead of failing blankly. */
  configProblem: string | null;
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  if (configProblem) {
    return (
      <p className="mt-6 rounded-md border border-caution/30 bg-surface p-4 text-sm leading-relaxed text-ink">
        {configProblem}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "login-error" : undefined}
          className="mt-1.5 h-11 w-full rounded-md border border-rule-strong bg-page px-3 text-base text-ink transition-colors duration-150 ease-soft hover:border-muted"
        />
      </div>

      {state.error ? (
        <p id="login-error" role="alert" className="text-sm text-critical">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
