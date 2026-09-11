import { describe, expect, it } from "vitest";
import { canReportReview, isVerifiedRestaurantOwner } from "./access";

describe("owner and review access", () => {
  it("requires verified owner access", () => {
    expect(isVerifiedRestaurantOwner("restaurant_owner", 1)).toBe(true);
    expect(isVerifiedRestaurantOwner("restaurant_owner", 0)).toBe(false);
    expect(isVerifiedRestaurantOwner("user", 1)).toBe(false);
    expect(isVerifiedRestaurantOwner("admin", 1)).toBe(true);
  });

  it("does not allow reporting your own review", () => {
    expect(canReportReview(2, 4)).toBe(true);
    expect(canReportReview(4, 4)).toBe(false);
  });
});
