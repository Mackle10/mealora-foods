import { describe, expect, it } from "vitest";
import { calculateNextRatingBasis, canReviewOrder, isPublicReviewStatus, isValidCourierPoint } from "./reviews";

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

  it("keeps hidden and pending reviews out of public reads", () => {
    expect(isPublicReviewStatus("visible")).toBe(true);
    expect(isPublicReviewStatus("hidden")).toBe(false);
    expect(isPublicReviewStatus("pending")).toBe(false);
  });

  it("accepts only valid geographic coordinates", () => {
    expect(isValidCourierPoint(0.3266, 32.5825)).toBe(true);
    expect(isValidCourierPoint(91, 32.5825)).toBe(false);
    expect(isValidCourierPoint(0.3266, 181)).toBe(false);
  });
});
