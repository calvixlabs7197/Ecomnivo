import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

/**
 * Content modules import `siteConfig`, which validates NEXT_PUBLIC_SITE_URL at
 * load time and throws if it is missing. That is deliberate in the app — a bad
 * site URL silently poisons every canonical — but it means tests need the
 * variable too.
 *
 * `.env.local` is used when present, with a deterministic fallback so the suite
 * runs in CI and on a fresh clone without one.
 */
const fileEnv = loadEnv("test", process.cwd(), "");

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      NEXT_PUBLIC_SITE_URL: fileEnv.NEXT_PUBLIC_SITE_URL ?? "https://ecomnivo.test",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // Server modules guard themselves with `import "server-only"`, which
      // throws outside a React Server Component. Tests exercise those modules
      // directly, so the marker is stubbed to a no-op here.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
});
