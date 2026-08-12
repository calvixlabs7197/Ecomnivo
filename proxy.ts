import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Layer 1 of the three admin defences (§8.1) — and the weakest by design.
 *
 * This only checks that a session cookie is *present*, because proxy code runs
 * at the edge where the signing secret and Node crypto are not available. It
 * is a redirect for people who are not signed in, not a security boundary: a
 * forged cookie gets past it and is then rejected by the server-side role
 * check in `app/admin/layout.tsx`.
 *
 * Next 16 renamed the `middleware` convention to `proxy`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
