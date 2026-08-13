import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { adminConfigProblem } from "@/config/server-env";
import { getSession } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
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
    <div className="aurora grid-veil relative flex min-h-screen flex-col justify-center py-16">
      <Container>
        <div className="animate-fade-up mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mx-auto flex w-fit rounded-sm transition-transform duration-200 ease-soft hover:scale-[1.03]"
          >
            <Logo />
          </Link>

          {/*
            A card rather than bare text on the page. This screen has no site
            header — it brings its own shell, like the admin does — so the
            container is what tells the reader the page has finished loading and
            this is the whole of it.
          */}
          <div className="mt-8 rounded-lg border border-rule bg-page p-6 shadow-md sm:p-8">
            <h1 className="text-h2">Sign in</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Admin access for editing tools, guides, pages and settings.
            </p>

            <LoginForm next={next} configProblem={adminConfigProblem()} />
          </div>

          <p className="mt-6 text-center text-sm">
            <Link
              href="/"
              className="text-muted transition-colors duration-150 ease-soft hover:text-ink"
            >
              &larr; Back to the site
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
