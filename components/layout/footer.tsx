import Link from "next/link";
import { footerNav, siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-rule bg-surface">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:pr-8">
            <Link href="/" aria-label={`${siteConfig.name} home`} className="rounded-sm">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.description}
            </p>
          </div>

          {footerNav.map((column) => (
            <nav key={column.heading} aria-labelledby={`footer-${column.heading}`}>
              <h2
                id={`footer-${column.heading}`}
                className="text-eyebrow uppercase text-muted"
              >
                {column.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted transition-colors duration-150 ease-soft hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-rule py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {siteConfig.name}. Free to use, no account required.
          </p>
          <p>
            Educational tools only — not financial, tax or legal advice.
          </p>
        </div>
      </Container>
    </footer>
  );
}
