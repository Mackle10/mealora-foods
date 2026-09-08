import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, cities, favorites, menuItems, orderItems, orders, partnerApplications, restaurants, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  (['name', 'email', 'loginMethod'] as const).forEach(field => {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getCitiesFromDb() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cities).where(eq(cities.isActive, 1)).orderBy(cities.name);
}

export async function getRestaurantsFromDb(cityId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = cityId ? and(eq(restaurants.cityId, cityId), eq(restaurants.isOpen, 1)) : eq(restaurants.isOpen, 1);
  return db.select().from(restaurants).where(where).orderBy(desc(restaurants.ratingBasis));
}

export async function getMenuFromDb(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.isAvailable, 1))).orderBy(menuItems.category, menuItems.name);
}

export async function getFavoritesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: favorites.id, restaurantId: favorites.restaurantId, createdAt: favorites.createdAt }).from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
}

export async function toggleFavorite(userId: number, restaurantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.restaurantId, restaurantId))).limit(1);
  if (existing[0]) { await db.delete(favorites).where(eq(favorites.id, existing[0].id)); return { saved: false }; }
  await db.insert(favorites).values({ userId, restaurantId });
  return { saved: true };
}

export async function getOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function createOrderForUser(input: { userId: number; restaurantId: number; deliveryAddress: string; items: Array<{ menuItemId: number; quantity: number }> }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const ids = input.items.map(item => item.menuItemId);
  const menu = await db.select().from(menuItems).where(and(eq(menuItems.restaurantId, input.restaurantId), inArray(menuItems.id, ids), eq(menuItems.isAvailable, 1)));
  if (menu.length !== input.items.length) throw new Error("One or more menu items are unavailable");
  const subtotalCents = input.items.reduce((sum, item) => sum + (menu.find(menuItem => menuItem.id === item.menuItemId)?.priceCents ?? 0) * item.quantity, 0);
  const deliveryFeeCents = subtotalCents >= 2500 ? 0 : 299;
  const totalCents = subtotalCents + deliveryFeeCents;
  const orderNumber = `MEA-${Date.now().toString(36).toUpperCase()}`;
  const inserted = await db.insert(orders).values({ orderNumber, userId: input.userId, restaurantId: input.restaurantId, status: "placed", subtotalCents, deliveryFeeCents, totalCents, currency: "USD", deliveryAddress: input.deliveryAddress, courierName: "Kofi", courierLatE6: 5572200, courierLngE6: -193800, etaMinutes: 24 }).$returningId();
  const orderId = inserted[0]?.id;
  if (!orderId) throw new Error("Order could not be created");
  await db.insert(orderItems).values(input.items.map(item => { const menuItem = menu.find(candidate => candidate.id === item.menuItemId)!; return { orderId, menuItemId: menuItem.id, itemName: menuItem.name, unitPriceCents: menuItem.priceCents, quantity: item.quantity }; }));
  return { orderId, orderNumber, totalCents, currency: "USD", paymentStatus: "payment_setup_required" as const };
}

export async function createPartnerApplication(input: { userId: number; applicationType: "restaurant" | "courier" | "business"; businessName: string; contactEmail: string; city: string; details: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const inserted = await db.insert(partnerApplications).values(input).$returningId();
  return { id: inserted[0]?.id ?? 0, status: "new" as const };
}
