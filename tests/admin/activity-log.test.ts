import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Regression test for a production outage.
 *
 * On serverless hosting the filesystem is read-only, and the audit write is the
 * only write in the whole sign-in path. When it threw, a correct password
 * returned a 500 and the session cookie was discarded — admin was unreachable
 * in production while every content screen looked fine locally.
 *
 * The rule this pins down: a read-only store must not turn logging an action
 * into failing it. Anything else still throws, because a store that is writable
 * and still refusing writes is a real fault.
 */
vi.mock("@/lib/db/store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/store")>();
  return { ...actual, updateCollection: vi.fn() };
});

const { updateCollection, ReadOnlyStoreError } = await import("@/lib/db/store");
const { logActivity } = await import("@/lib/db/repositories");

const entry = {
  actor: "super_admin",
  action: "auth.login",
  entityType: "session",
  entityId: "-",
  summary: "Signed in",
};

afterEach(() => vi.mocked(updateCollection).mockReset());

describe("logActivity", () => {
  it("writes the entry when the store accepts writes", async () => {
    vi.mocked(updateCollection).mockResolvedValue([]);

    await expect(logActivity(entry)).resolves.toBeUndefined();
    expect(updateCollection).toHaveBeenCalledOnce();
  });

  it("survives a read-only filesystem rather than failing the action", async () => {
    vi.mocked(updateCollection).mockRejectedValue(new ReadOnlyStoreError());
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(logActivity(entry)).resolves.toBeUndefined();
    // Silently is not the same as invisibly — it still reaches the server log.
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it("still raises any other write failure", async () => {
    vi.mocked(updateCollection).mockRejectedValue(new Error("disk full"));

    await expect(logActivity(entry)).rejects.toThrow("disk full");
  });
});
