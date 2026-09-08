export type City = {
  id: number;
  slug: string;
  name: string;
  country: string;
  region: string;
  imageUrl: string;
  tagline: string;
};

export type Restaurant = {
  id: number;
  cityId: number;
  name: string;
  slug: string;
  cuisine: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  deliveryMinutes: number;
  priceBand: string;
  isOpen: boolean;
};

export type MenuItem = {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  priceCents: number;
  currency: string;
  isAvailable: boolean;
};

export type TrackingStatus = {
  status: "placed" | "confirmed" | "preparing" | "picked_up" | "on_the_way" | "delivered";
  label: string;
  detail: string;
  etaMinutes: number;
  courierName: string;
  courierLat: number;
  courierLng: number;
  updatedAt: number;
};

const asset = "/manus-storage/";

export const fallbackCities: City[] = [
  { id: 1, slug: "lagos", name: "Lagos", country: "Nigeria", region: "West Africa", imageUrl: `${asset}mealora-dish_8a7e9543.jpg`, tagline: "Jollof, suya & the pulse of the city" },
  { id: 2, slug: "tokyo", name: "Tokyo", country: "Japan", region: "East Asia", imageUrl: `${asset}mealora-global-hero_3f739ae9.jpg`, tagline: "Ramen, sushi & late-night izakaya" },
  { id: 3, slug: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe", imageUrl: `${asset}mealora-market_ea07f1eb.jpg`, tagline: "Pastéis, coastal plates & good light" },
  { id: 4, slug: "accra", name: "Accra", country: "Ghana", region: "West Africa", imageUrl: `${asset}mealora-hero_9bb0f524.jpg`, tagline: "Waakye, kelewele & beachside bites" },
];

export const fallbackRestaurants: Restaurant[] = [
  { id: 1, cityId: 1, name: "Kora Kitchen", slug: "kora-kitchen", cuisine: "West African", description: "Smoky grains, bright pepper sauces and the comfort of a full table.", imageUrl: `${asset}mealora-dish_8a7e9543.jpg`, rating: 4.8, reviewCount: 328, deliveryMinutes: 24, priceBand: "$$", isOpen: true },
  { id: 2, cityId: 2, name: "Hikari House", slug: "hikari-house", cuisine: "Japanese", description: "Hand-rolls, ramen and small plates made for slow evenings.", imageUrl: `${asset}mealora-global-hero_3f739ae9.jpg`, rating: 4.9, reviewCount: 521, deliveryMinutes: 29, priceBand: "$$$", isOpen: true },
  { id: 3, cityId: 3, name: "The Green Table", slug: "the-green-table", cuisine: "Plant-forward", description: "Seasonal produce, bright bowls and a little more green in your day.", imageUrl: `${asset}mealora-market_ea07f1eb.jpg`, rating: 4.7, reviewCount: 198, deliveryMinutes: 31, priceBand: "$$", isOpen: true },
  { id: 4, cityId: 4, name: "Moyo Bakery", slug: "moyo-bakery", cuisine: "Bakery & coffee", description: "Slow-fermented bread, morning pastries and very good coffee.", imageUrl: `${asset}mealora-hero_9bb0f524.jpg`, rating: 4.8, reviewCount: 410, deliveryMinutes: 18, priceBand: "$", isOpen: true },
];

export const fallbackMenu: MenuItem[] = [
  { id: 1, restaurantId: 1, name: "Kora Jollof Bowl", description: "Party jollof, grilled chicken, sweet plantain and herb salad.", category: "Signature", imageUrl: `${asset}mealora-dish_8a7e9543.jpg`, priceCents: 1850, currency: "USD", isAvailable: true },
  { id: 2, restaurantId: 1, name: "Pepper Prawns", description: "Charred prawns, citrus pepper sauce and toasted coconut.", category: "Small plates", imageUrl: `${asset}mealora-dish_8a7e9543.jpg`, priceCents: 1450, currency: "USD", isAvailable: true },
  { id: 3, restaurantId: 2, name: "Hikari Ramen", description: "Miso broth, noodles, greens, egg and roasted sesame.", category: "Bowls", imageUrl: `${asset}mealora-global-hero_3f739ae9.jpg`, priceCents: 2200, currency: "USD", isAvailable: true },
  { id: 4, restaurantId: 3, name: "Green Market Bowl", description: "Roasted vegetables, grains, herbs and tahini citrus dressing.", category: "Bowls", imageUrl: `${asset}mealora-market_ea07f1eb.jpg`, priceCents: 1700, currency: "USD", isAvailable: true },
  { id: 5, restaurantId: 4, name: "Morning Bun Box", description: "Four seasonal pastries baked fresh each morning.", category: "Bakery", imageUrl: `${asset}mealora-hero_9bb0f524.jpg`, priceCents: 1200, currency: "USD", isAvailable: true },
];

export const fallbackTracking: TrackingStatus = {
  status: "on_the_way",
  label: "Your courier is on the way",
  detail: "Kofi has picked up your order from Kora Kitchen.",
  etaMinutes: 18,
  courierName: "Kofi",
  courierLat: 5.5722,
  courierLng: -0.1938,
  updatedAt: Date.now(),
};
