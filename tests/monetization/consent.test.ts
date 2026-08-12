import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The consent module is a client module that reads `window.localStorage`.
 * These tests exercise the read/write logic against a stubbed store rather
 * than a real browser — what matters is the default, which is the part with
 * legal consequences.
 */
const store = new Map<string, string>();

vi.stubGlobal("window", {
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  },
  addEventListener: () => {},
  removeEventListener: () => {},
});

const { CONSENT_STORAGE_KEY, readConsent, setConsent } = await import(
  "@/lib/analytics/consent"
);

describe("analytics consent", () => {
  beforeEach(() => {
    store.clear();
  });

  it("defaults to unset, which is treated as no consent", () => {
    expect(readConsent()).toBe("unset");
  });

  it("records a granted choice", () => {
    setConsent("granted");
    expect(readConsent()).toBe("granted");
    expect(store.get(CONSENT_STORAGE_KEY)).toBe("granted");
  });

  it("records a declined choice, so the banner does not reappear", () => {
    setConsent("denied");
    expect(readConsent()).toBe("denied");
  });

  it("treats an unrecognised stored value as unset rather than granted", () => {
    // Fail closed: a corrupted or tampered value must never imply consent.
    store.set(CONSENT_STORAGE_KEY, "yes-please");
    expect(readConsent()).toBe("unset");
  });

  it("treats an empty stored value as unset", () => {
    store.set(CONSENT_STORAGE_KEY, "");
    expect(readConsent()).toBe("unset");
  });
});

/**
 * The measurement ID moved from a build-time environment variable to admin
 * settings, so `track()` no longer checks configuration — it cannot, since the
 * value is only known on the server. The two remaining gates are both runtime
 * facts, and both are checked here: consent, and whether the tag actually
 * loaded.
 */
describe("analytics events", () => {
  it("does nothing without consent, even when the tag has loaded", async () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      gtag,
      localStorage: { getItem: () => "denied", setItem: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {},
    });

    const { track } = await import("@/lib/analytics/events");
    track("tool_calculate", { tool_slug: "roas-calculator", category: "advertising" });

    expect(gtag).not.toHaveBeenCalled();
  });

  it("does nothing when the tag has not loaded, even with consent", async () => {
    vi.stubGlobal("window", {
      localStorage: { getItem: () => "granted", setItem: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {},
    });

    const { track } = await import("@/lib/analytics/events");
    // No gtag on window — must be a silent no-op rather than a TypeError.
    expect(() =>
      track("tool_calculate", { tool_slug: "roas-calculator", category: "advertising" }),
    ).not.toThrow();
  });

  it("sends the event when consent is granted and the tag is present", async () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      gtag,
      localStorage: { getItem: () => "granted", setItem: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {},
    });

    const { track } = await import("@/lib/analytics/events");
    track("tool_copy_results", { tool_slug: "roas-calculator" });

    expect(gtag).toHaveBeenCalledWith("event", "tool_copy_results", {
      tool_slug: "roas-calculator",
    });
  });
});
