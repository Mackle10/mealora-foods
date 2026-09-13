import { describe, expect, it } from "vitest";
import { canManageRoles, normalizeModeratorNotes } from "./admin-validation";

describe("admin validation", () => {
  it("only allows admins to manage roles", () => {
    expect(canManageRoles("admin")).toBe(true);
    expect(canManageRoles("user")).toBe(false);
    expect(canManageRoles("restaurant_owner")).toBe(false);
  });

  it("normalizes optional moderator notes", () => {
    expect(normalizeModeratorNotes("  reviewed and dismissed  ")).toBe("reviewed and dismissed");
    expect(normalizeModeratorNotes("   ")).toBeUndefined();
    expect(normalizeModeratorNotes("x".repeat(1100))).toHaveLength(1000);
  });
});
