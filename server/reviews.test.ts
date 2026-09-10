import { describe, expect, it } from "vitest";
import { calculateNextRatingBasis, canReviewOrder } from "./reviews";

describe("restaurant reviews", () => {
  it("only unlocks after delivery", () => {
    expect(canReviewOrder("paid")).toBe(false);
    expect(canReviewOrder("on_the_way")).toBe(false);
    expect(canReviewOrder("delivered")).toBe(true);
  });

  it("updates an existing average without treating the basis as a raw sum", () => {
    expect(calculateNextRatingBasis(480, 120, 5)).toEqual({ ratingBasis: 480, reviewCount: 121 });
    expect(calculateNextRatingBasis(400, 1, 5)).toEqual({ ratingBasis: 450, reviewCount: 2 });
  });
});
