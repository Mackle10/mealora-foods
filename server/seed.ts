import { fallbackCities, fallbackMenu, fallbackRestaurants } from "@shared/catalog";
import { getDb } from "./db";
import { cities, menuItems, restaurants } from "../drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is not configured");
  const existingCities = await db.select({ id: cities.id }).from(cities).limit(1);
  if (!existingCities.length) {
    await db.insert(cities).values(fallbackCities.map(city => ({ slug: city.slug, name: city.name, country: city.country, region: city.region, imageUrl: city.imageUrl, tagline: city.tagline, isActive: 1 })));
  }
  const existingRestaurants = await db.select({ id: restaurants.id }).from(restaurants).limit(1);
  if (!existingRestaurants.length) {
    await db.insert(restaurants).values(fallbackRestaurants.map(restaurant => ({ cityId: restaurant.cityId, name: restaurant.name, slug: restaurant.slug, cuisine: restaurant.cuisine, description: restaurant.description, imageUrl: restaurant.imageUrl, ratingBasis: Math.round(restaurant.rating * 100), reviewCount: restaurant.reviewCount, deliveryMinutes: restaurant.deliveryMinutes, priceBand: restaurant.priceBand, isOpen: restaurant.isOpen ? 1 : 0 })));
  }
  const existingMenu = await db.select({ id: menuItems.id }).from(menuItems).limit(1);
  if (!existingMenu.length) {
    await db.insert(menuItems).values(fallbackMenu.map(item => ({ restaurantId: item.restaurantId, name: item.name, description: item.description, category: item.category, imageUrl: item.imageUrl, priceCents: item.priceCents, currency: item.currency, isAvailable: item.isAvailable ? 1 : 0 })));
  }
  console.log("Mealora catalog seed complete");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
