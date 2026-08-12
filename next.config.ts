import type { NextConfig } from "next";

/**
 * Baseline security headers.
 *
 * A Content-Security-Policy is deliberately absent until Phase 7, when the
 * analytics and advertising origins are known. Shipping a CSP now would either
 * be so permissive it means nothing, or so strict it breaks on the first
 * third-party script we add.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Statically typed <Link href>. A link to a route that does not exist is a
  // build error, which is how we guarantee no dead internal links.
  typedRoutes: true,

  // Do not advertise the framework.
  poweredByHeader: false,

  // Trailing slashes create duplicate URLs; canonical form is without.
  trailingSlash: false,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    /**
     * Cap build parallelism.
     *
     * Next spawns one worker per CPU by default. Each is a full Node process,
     * and ours loads the markdown pipeline and Satori for the OG images — on an
     * 8-core machine that is seven processes competing for RAM, which reliably
     * aborted the build with a V8 "Zone Allocation failed" / "Allocation
     * failed - JavaScript heap out of memory" abort when free memory was
     * around 1 GB.
     *
     * `cpus` caps both the page-data and static-generation phases;
     * `staticGenerationMinPagesPerWorker` alone did not, because it only
     * governs the second of them.
     *
     * Two workers builds this site in a few seconds more and finishes
     * reliably. That is the right trade: CI runners are frequently more
     * memory-constrained than laptops, not less. Raise it if builds are slow
     * on a machine with memory to spare.
     */
    cpus: 2,
    staticGenerationMinPagesPerWorker: 40,
    /** One retry absorbs a transient worker failure instead of failing the build. */
    staticGenerationRetryCount: 1,
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
