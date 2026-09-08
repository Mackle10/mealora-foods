import { describe, expect, it } from "vitest";
import { fallbackCities, fallbackMenu, fallbackRestaurants, fallbackTracking } from "@shared/catalog";

describe("Mealora catalog", () => {
  it("contains city, restaurant, and menu records for discovery", () => {
    expect(fallbackCities.length).toBeGreaterThanOrEqual(4);
    expect(fallbackRestaurants.length).toBeGreaterThanOrEqual(4);
    expect(fallbackMenu.length).toBeGreaterThanOrEqual(5);
    expect(new Set(fallbackCities.map(city => city.slug)).size).toBe(fallbackCities.length);
    expect(fallbackRestaurants.every(restaurant => restaurant.rating >= 4.5 && restaurant.deliveryMinutes > 0)).toBe(true);
  });

  it("keeps menu relationships and prices valid", () => {
    const restaurantIds = new Set(fallbackRestaurants.map(restaurant => restaurant.id));
    expect(fallbackMenu.every(item => restaurantIds.has(item.restaurantId))).toBe(true);
    expect(fallbackMenu.every(item => item.priceCents > 0 && item.isAvailable)).toBe(true);
  });

  it("has a courier-ready live tracking baseline", () => {
    expect(fallbackTracking.status).toBe("on_the_way");
    expect(fallbackTracking.courierName).toBeTruthy();
    expect(fallbackTracking.etaMinutes).toBeGreaterThan(0);
    expect(fallbackTracking.courierLat).toBeGreaterThan(-90);
    expect(fallbackTracking.courierLng).toBeGreaterThan(-180);
  });
});
