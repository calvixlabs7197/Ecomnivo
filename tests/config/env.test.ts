import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `config/env.ts` validates at module load and throws, so every case here has
 * to stub the environment and then import it fresh.
 *
 * What is being pinned down: a deployment always knows its own address. A
 * preview build with no `NEXT_PUBLIC_SITE_URL` used to fail the whole build at
 * this file — which is a bad trade when the platform has already published the
 * URL the deployment is being served from.
 */
async function loadEnv() {
  vi.resetModules();
  return import("@/config/env");
}

afterEach(() => vi.unstubAllEnvs());

describe("site URL resolution", () => {
  it("prefers an explicit NEXT_PUBLIC_SITE_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ecomnivo.com");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL", "ecomnivo.vercel.app");

    expect((await loadEnv()).env.SITE_URL).toBe("https://ecomnivo.com");
  });

  it("falls back to the project's production URL on Vercel", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL", "ecomnivo.vercel.app");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "ecomnivo-abc123-calvix-labs.vercel.app");

    // The per-deployment URL loses on purpose: a preview must not claim to be
    // canonical, or it competes with production in the index.
    expect((await loadEnv()).env.SITE_URL).toBe("https://ecomnivo.vercel.app");
  });

  it("falls back to this deployment's own URL when there is nothing else", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "ecomnivo-abc123-calvix-labs.vercel.app");

    expect((await loadEnv()).env.SITE_URL).toBe(
      "https://ecomnivo-abc123-calvix-labs.vercel.app",
    );
  });

  it("still fails loudly off-platform with nothing configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "");

    await expect(loadEnv()).rejects.toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("strips a trailing slash so new URL(path, origin) is safe", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ecomnivo.vercel.app/");

    expect((await loadEnv()).env.SITE_URL).toBe("https://ecomnivo.vercel.app");
  });
});
