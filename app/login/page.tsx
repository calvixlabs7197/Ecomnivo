import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { adminConfigProblem } from "@/config/server-env";
import { getSession } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/container";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to the EcomNivo admin.",
  path: "/login",
  noindex: true,
});

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const raw = params.next;
  const next = (Array.isArray(raw) ? raw[0] : raw) ?? "/admin";

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-sm">
        <h1 className="text-h2">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Admin access for editing tools, guides, pages and settings.
        </p>

        <LoginForm next={next} configProblem={adminConfigProblem()} />
      </div>
    </Container>
  );
}
