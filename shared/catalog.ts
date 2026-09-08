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
  { id: 1, slug: "kampala", name: "Kampala", country: "Uganda", region: "Central Uganda", imageUrl: `${asset}mealora-dish_8a7e9543.jpg`, tagline: "Rolex, matoke & the energy of the city" },
  { id: 2, slug: "entebbe", name: "Entebbe", country: "Uganda", region: "Lake Victoria", imageUrl: `${asset}mealora-global-hero_3f739ae9.jpg`, tagline: "Lakeside plates, fresh fruit & easy afternoons" },
  { id: 3, slug: "jinja", name: "Jinja", country: "Uganda", region: "Eastern Uganda", imageUrl: `${asset}mealora-market_ea07f1eb.jpg`, tagline: "Nile views, local bites & weekend energy" },
  { id: 4, slug: "mbarara", name: "Mbarara", country: "Uganda", region: "Western Uganda", imageUrl: `${asset}mealora-hero_9bb0f524.jpg`, tagline: "Hearty plates, highland coffee & warm welcomes" },
];

export const fallbackRestaurants: Restaurant[] = [
  { id: 1, cityId: 1, name: "Kampala Plate", slug: "kampala-plate", cuisine: "Ugandan classics", description: "Matoke, grilled meats and bright local flavours made for a full Kampala table.", imageUrl: `${asset}mealora-dish_8a7e9543.jpg`, rating: 4.8, reviewCount: 328, deliveryMinutes: 24, priceBand: "UGX 15k–35k", isOpen: true },
  { id: 2, cityId: 2, name: "Lake Victoria Kitchen", slug: "lake-victoria-kitchen", cuisine: "Lakeside grill", description: "Fresh fish, garden salads and relaxed plates inspired by the lake.", imageUrl: `${asset}mealora-global-hero_3f739ae9.jpg`, rating: 4.9, reviewCount: 521, deliveryMinutes: 29, priceBand: "UGX 20k–45k", isOpen: true },
  { id: 3, cityId: 3, name: "Nile Street Bites", slug: "nile-street-bites", cuisine: "Street food", description: "Rolex, samosas and loaded street plates for Jinja days and late nights.", imageUrl: `${asset}mealora-market_ea07f1eb.jpg`, rating: 4.7, reviewCount: 198, deliveryMinutes: 31, priceBand: "UGX 8k–25k", isOpen: true },
  { id: 4, cityId: 4, name: "Ankole Coffee House", slug: "ankole-coffee-house", cuisine: "Coffee & bakery", description: "Highland coffee, soft chapati and fresh pastries from morning onwards.", imageUrl: `${asset}mealora-hero_9bb0f524.jpg`, rating: 4.8, reviewCount: 410, deliveryMinutes: 18, priceBand: "UGX 6k–20k", isOpen: true },
];

export const fallbackMenu: MenuItem[] = [
  { id: 1, restaurantId: 1, name: "Kampala Rolex", description: "Fresh chapati rolled with eggs, tomato, onion and a little local heat.", category: "Signature", imageUrl: `${asset}mealora-dish_8a7e9543.jpg`, priceCents: 12000, currency: "UGX", isAvailable: true },
  { id: 2, restaurantId: 1, name: "Matoke & Grilled Chicken", description: "Steamed matoke, grilled chicken, greens and groundnut sauce.", category: "Local plates", imageUrl: `${asset}mealora-dish_8a7e9543.jpg`, priceCents: 28000, currency: "UGX", isAvailable: true },
  { id: 3, restaurantId: 2, name: "Lake Victoria Tilapia", description: "Whole grilled tilapia, lemon, seasonal salad and cassava chips.", category: "Lakeside grill", imageUrl: `${asset}mealora-global-hero_3f739ae9.jpg`, priceCents: 42000, currency: "UGX", isAvailable: true },
  { id: 4, restaurantId: 3, name: "Jinja Street Box", description: "Rolex bites, samosas, chips and a chilled passion fruit drink.", category: "Street food", imageUrl: `${asset}mealora-market_ea07f1eb.jpg`, priceCents: 18000, currency: "UGX", isAvailable: true },
  { id: 5, restaurantId: 4, name: "Ankole Coffee & Bun", description: "Fresh highland coffee with a soft cinnamon bun, baked this morning.", category: "Bakery", imageUrl: `${asset}mealora-hero_9bb0f524.jpg`, priceCents: 10000, currency: "UGX", isAvailable: true },
];

export const fallbackTracking: TrackingStatus = {
  status: "on_the_way",
  label: "Your boda courier is on the way",
  detail: "Moses has picked up your order from Kampala Plate.",
  etaMinutes: 18,
  courierName: "Moses",
  courierLat: 0.3266,
  courierLng: 32.5825,
  updatedAt: Date.now(),
};
