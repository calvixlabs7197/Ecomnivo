import { describe, expect, it } from "vitest";
import { bucketByDay } from "@/lib/admin/metrics";
import { firstParam, matchesQuery, resultLabel } from "@/lib/admin/filters";
import { ROLES, roleAtLeast } from "@/lib/auth/roles";
import { adminNav, activeNavItem, adminNavItems, navFor } from "@/components/admin/nav";

describe("bucketByDay", () => {
  const now = new Date("2026-08-13T12:00:00.000Z");

  it("returns one bucket per day, oldest first", () => {
    const days = bucketByDay([], 7, now);

    expect(days).toHaveLength(7);
    expect(days[0]?.date).toBe("2026-08-07");
    expect(days.at(-1)?.date).toBe("2026-08-13");
  });

  it("keeps quiet days as zeroes rather than dropping them", () => {
    const days = bucketByDay(["2026-08-13T09:00:00.000Z"], 3, now);

    expect(days.map((day) => day.count)).toEqual([0, 0, 1]);
  });

  it("counts several entries on the same day together", () => {
    const days = bucketByDay(
      ["2026-08-12T01:00:00.000Z", "2026-08-12T23:59:00.000Z"],
      2,
      now,
    );

    expect(days[0]?.count).toBe(2);
  });

  it("ignores timestamps outside the window and unparseable ones", () => {
    const days = bucketByDay(["2020-01-01T00:00:00.000Z", "not a date"], 3, now);

    expect(days.every((day) => day.count === 0)).toBe(true);
  });
});

describe("filter params", () => {
  it("takes the first value when a param repeats", () => {
    expect(firstParam(["draft", "published"])).toBe("draft");
    expect(firstParam(undefined)).toBe("");
    expect(firstParam("  spaced  ")).toBe("spaced");
  });

  it("matches case-insensitively across every field it is given", () => {
    expect(matchesQuery("ROAS", "Break-even ROAS calculator")).toBe(true);
    expect(matchesQuery("margin", undefined, "profit-margin-calculator")).toBe(true);
    expect(matchesQuery("nothing", "Break-even ROAS calculator")).toBe(false);
  });

  it("matches everything when the query is empty", () => {
    expect(matchesQuery("   ", "anything")).toBe(true);
  });

  it("labels results, and says so only when filtered", () => {
    expect(resultLabel(22, 22, "calculator")).toBe("22 calculators");
    expect(resultLabel(3, 22, "calculator")).toBe("3 of 22 calculators");
    expect(resultLabel(1, 1, "guide")).toBe("1 guide");
  });
});

describe("roles", () => {
  it("is cumulative", () => {
    expect(roleAtLeast("super_admin", "editor")).toBe(true);
    expect(roleAtLeast("editor", "admin")).toBe(false);
    expect(roleAtLeast(null, "user")).toBe(false);
  });

  it("orders every role from least to most privileged", () => {
    for (let index = 1; index < ROLES.length; index += 1) {
      expect(roleAtLeast(ROLES[index]!, ROLES[index - 1]!)).toBe(true);
    }
  });
});

describe("admin navigation", () => {
  it("has unique hrefs", () => {
    const hrefs = adminNavItems.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("shows an editor the content screens and hides the privileged ones", () => {
    const visible = navFor("editor").flatMap((group) => group.items.map((item) => item.href));

    expect(visible).toContain("/admin/guides");
    expect(visible).not.toContain("/admin/settings");
    expect(visible).not.toContain("/admin/tools");
  });

  it("shows a super_admin everything", () => {
    expect(navFor("super_admin").flatMap((group) => group.items)).toHaveLength(
      adminNavItems.length,
    );
  });

  it("drops groups that end up empty rather than rendering a bare heading", () => {
    expect(navFor("user")).toEqual([]);
    expect(navFor("editor").length).toBeLessThan(adminNav.length);
  });

  it("resolves a detail URL to its section, not to the dashboard", () => {
    expect(activeNavItem("/admin/tools/roas-calculator")?.href).toBe("/admin/tools");
    expect(activeNavItem("/admin")?.href).toBe("/admin");
    expect(activeNavItem("/admin/nowhere")).toBeUndefined();
  });
});
