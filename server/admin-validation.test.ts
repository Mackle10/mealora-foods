import { describe, expect, it } from "vitest";
import { canChangeRole, canManageRoles, normalizeModeratorNotes } from "./admin-validation";

describe("admin validation", () => {
  it("only allows admins to manage roles", () => {
    expect(canManageRoles("admin")).toBe(true);
    expect(canManageRoles("user")).toBe(false);
    expect(canManageRoles("restaurant_owner")).toBe(false);
  });

  it("prevents self-demotion while allowing changes to other users", () => {
    expect(canChangeRole(7, 7, "user")).toBe(false);
    expect(canChangeRole(7, 7, "courier")).toBe(false);
    expect(canChangeRole(7, 7, "admin")).toBe(true);
    expect(canChangeRole(7, 8, "user")).toBe(true);
  });

  it("normalizes optional moderator notes", () => {
    expect(normalizeModeratorNotes("  reviewed and dismissed  ")).toBe("reviewed and dismissed");
    expect(normalizeModeratorNotes("   ")).toBeUndefined();
    expect(normalizeModeratorNotes("x".repeat(1100))).toHaveLength(1000);
  });
});
