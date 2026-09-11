import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, cities, deliveryAddresses, favorites, menuItems, orderItems, orders, partnerApplications, restaurantReviews, restaurants, reviewReports, signupRequests, smsNotifications, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getOrderNotificationEvent, sendSms } from "./sms";
import { calculateNextRatingBasis, canReviewOrder, isValidCourierPoint } from "./reviews";
import { canReportReview } from "./access";

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

export async function createSignupRequest(input: { contactType: "email" | "phone"; contact: string; name: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const inserted = await db.insert(signupRequests).values(input).$returningId();
  return { id: inserted[0]?.id ?? 0, status: "pending" as const };
}

export async function updateUserProfile(userId: number, input: { name: string; email?: string; phone?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(users).set({ name: input.name, email: input.email || null, phone: input.phone || null }).where(eq(users.id, userId));
  return { success: true as const };
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

export async function getAddressesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryAddresses).where(eq(deliveryAddresses.userId, userId)).orderBy(desc(deliveryAddresses.isDefault), desc(deliveryAddresses.updatedAt));
}

export async function saveAddressForUser(input: { userId: number; label: string; recipientName: string; phone: string; address: string; city: string; instructions?: string; isDefault?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  if (input.isDefault) await db.update(deliveryAddresses).set({ isDefault: 0 }).where(eq(deliveryAddresses.userId, input.userId));
  const inserted = await db.insert(deliveryAddresses).values({ ...input, isDefault: input.isDefault ? 1 : 0 }).$returningId();
  return { id: inserted[0]?.id ?? 0 };
}

export async function deleteAddressForUser(userId: number, addressId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.delete(deliveryAddresses).where(and(eq(deliveryAddresses.id, addressId), eq(deliveryAddresses.userId, userId)));
  return { success: true as const };
}

export async function getOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getCourierOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(inArray(orders.status, ["placed", "confirmed", "preparing", "picked_up", "on_the_way"])).orderBy(desc(orders.updatedAt));
}

export async function getVerifiedRestaurantsForOwner(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurants).where(and(eq(restaurants.ownerId, userId), eq(restaurants.ownerVerified, 1)));
}

export async function getOwnerMenu(userId: number, restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  const owner = (await db.select({ id: restaurants.id }).from(restaurants).where(and(eq(restaurants.id, restaurantId), eq(restaurants.ownerId, userId), eq(restaurants.ownerVerified, 1))).limit(1))[0];
  if (!owner) throw new Error("Verified restaurant owner access required");
  return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)).orderBy(desc(menuItems.updatedAt));
}

export async function getOwnerOrders(userId: number, restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  const owner = (await db.select({ id: restaurants.id }).from(restaurants).where(and(eq(restaurants.id, restaurantId), eq(restaurants.ownerId, userId), eq(restaurants.ownerVerified, 1))).limit(1))[0];
  if (!owner) throw new Error("Verified restaurant owner access required");
  return db.select().from(orders).where(eq(orders.restaurantId, restaurantId)).orderBy(desc(orders.updatedAt)).limit(100);
}

export async function saveOwnerMenuItem(input: { userId: number; restaurantId: number; menuItemId?: number; name: string; description: string; category: string; imageUrl: string; priceCents: number; isAvailable: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const owner = (await db.select({ id: restaurants.id }).from(restaurants).where(and(eq(restaurants.id, input.restaurantId), eq(restaurants.ownerId, input.userId), eq(restaurants.ownerVerified, 1))).limit(1))[0];
  if (!owner) throw new Error("Verified restaurant owner access required");
  const values = { restaurantId: input.restaurantId, name: input.name, description: input.description, category: input.category, imageUrl: input.imageUrl, priceCents: input.priceCents, currency: "UGX", isAvailable: input.isAvailable ? 1 : 0 };
  if (input.menuItemId) await db.update(menuItems).set(values).where(and(eq(menuItems.id, input.menuItemId), eq(menuItems.restaurantId, input.restaurantId)));
  else await db.insert(menuItems).values(values);
  return { success: true as const };
}

export async function getReviewReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviewReports).where(eq(reviewReports.status, "open")).orderBy(desc(reviewReports.createdAt)).limit(100);
}

export async function reportRestaurantReview(input: { userId: number; reviewId: number; reason: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const review = (await db.select({ id: restaurantReviews.id, userId: restaurantReviews.userId }).from(restaurantReviews).where(eq(restaurantReviews.id, input.reviewId)).limit(1))[0];
  if (!review) throw new Error("Review not found");
  if (!canReportReview(input.userId, review.userId)) throw new Error("You cannot report your own review");
  await db.insert(reviewReports).values({ reviewId: input.reviewId, reporterId: input.userId, reason: input.reason });
  return { success: true as const };
}

export async function resolveReviewReport(reportId: number, status: "dismissed" | "actioned") {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(reviewReports).set({ status, resolvedAt: new Date() }).where(eq(reviewReports.id, reportId));
  return { success: true as const };
}

export async function updateOwnerOrderState(input: { userId: number; orderId: number; status: "placed" | "confirmed" | "preparing" | "picked_up" | "on_the_way" | "delivered" | "cancelled" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const owned = (await db.select({ id: orders.id }).from(orders).innerJoin(restaurants, eq(restaurants.id, orders.restaurantId)).where(and(eq(orders.id, input.orderId), eq(restaurants.ownerId, input.userId), eq(restaurants.ownerVerified, 1))).limit(1))[0];
  if (!owned) throw new Error("Verified restaurant owner access required");
  return updateOrderState({ orderId: input.orderId, status: input.status });
}

export async function createOrderForUser(input: { userId: number; restaurantId: number; deliveryAddress: string; specialInstructions?: string; paymentMethod: "cash_on_delivery" | "mtn_momo" | "airtel_money" | "card"; mobileMoneyPhone?: string; items: Array<{ menuItemId: number; quantity: number }> }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const ids = input.items.map(item => item.menuItemId);
  const menu = await db.select().from(menuItems).where(and(eq(menuItems.restaurantId, input.restaurantId), inArray(menuItems.id, ids), eq(menuItems.isAvailable, 1)));
  if (menu.length !== input.items.length) throw new Error("One or more menu items are unavailable");
  const subtotalCents = input.items.reduce((sum, item) => sum + (menu.find(menuItem => menuItem.id === item.menuItemId)?.priceCents ?? 0) * item.quantity, 0);
  const deliveryFeeCents = subtotalCents >= 35000 ? 0 : 3000;
  const totalCents = subtotalCents + deliveryFeeCents;
  const customer = (await db.select({ phone: users.phone }).from(users).where(eq(users.id, input.userId)).limit(1))[0];
  const orderNumber = `MEA-${Date.now().toString(36).toUpperCase()}`;
  const mobileMoneyReference = input.paymentMethod === "mtn_momo" || input.paymentMethod === "airtel_money" ? `MM-${Date.now().toString(36).toUpperCase()}` : undefined;
  const inserted = await db.insert(orders).values({ orderNumber, userId: input.userId, restaurantId: input.restaurantId, status: "placed", subtotalCents, deliveryFeeCents, totalCents, currency: "UGX", paymentMethod: input.paymentMethod, paymentStatus: input.paymentMethod === "cash_on_delivery" ? "pending" : "initiated", mobileMoneyPhone: input.mobileMoneyPhone, mobileMoneyReference, smsPhone: input.mobileMoneyPhone ?? customer?.phone, deliveryAddress: input.deliveryAddress, specialInstructions: input.specialInstructions, courierName: "Moses", courierLatE6: 326600, courierLngE6: 32582500, etaMinutes: 24 }).$returningId();
  const orderId = inserted[0]?.id;
  if (!orderId) throw new Error("Order could not be created");
  await db.insert(orderItems).values(input.items.map(item => { const menuItem = menu.find(candidate => candidate.id === item.menuItemId)!; return { orderId, menuItemId: menuItem.id, itemName: menuItem.name, unitPriceCents: menuItem.priceCents, quantity: item.quantity }; }));
  return { orderId, orderNumber, totalCents, currency: "UGX", paymentMethod: input.paymentMethod, mobileMoneyReference, paymentStatus: input.paymentMethod === "cash_on_delivery" ? "pending" as const : "mobile_money_initiated" as const };
}

export async function createPartnerApplication(input: { userId: number; applicationType: "restaurant" | "courier" | "business"; businessName: string; contactEmail: string; city: string; details: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const inserted = await db.insert(partnerApplications).values(input).$returningId();
  return { id: inserted[0]?.id ?? 0, status: "new" as const };
}


export async function getReorderForUser(userId: number, orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const order = (await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1))[0];
  if (!order) throw new Error("Order not found");
  const items = await db.select({ menuItemId: orderItems.menuItemId, itemName: orderItems.itemName, unitPriceCents: orderItems.unitPriceCents, quantity: orderItems.quantity }).from(orderItems).where(eq(orderItems.orderId, orderId));
  return { restaurantId: order.restaurantId, deliveryAddress: order.deliveryAddress, specialInstructions: order.specialInstructions ?? undefined, paymentMethod: "cash_on_delivery" as const, items };
}

export async function getReviewsForRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurantReviews).where(and(eq(restaurantReviews.restaurantId, restaurantId), eq(restaurantReviews.moderationStatus, "visible"))).orderBy(desc(restaurantReviews.createdAt)).limit(20);
}

export async function getReviewsForModeration() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurantReviews).where(inArray(restaurantReviews.moderationStatus, ["visible", "pending", "hidden"])).orderBy(desc(restaurantReviews.createdAt)).limit(100);
}

export async function replyToRestaurantReview(input: { userId: number; reviewId: number; reply: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const review = (await db.select({ id: restaurantReviews.id, restaurantId: restaurantReviews.restaurantId }).from(restaurantReviews).where(eq(restaurantReviews.id, input.reviewId)).limit(1))[0];
  if (!review) throw new Error("Review not found");
  const restaurant = (await db.select({ ownerId: restaurants.ownerId }).from(restaurants).where(and(eq(restaurants.id, review.restaurantId), eq(restaurants.ownerId, input.userId))).limit(1))[0];
  if (!restaurant) throw new Error("Only the restaurant owner can reply");
  await db.update(restaurantReviews).set({ reply: input.reply, repliedAt: new Date() }).where(eq(restaurantReviews.id, input.reviewId));
  return { success: true as const };
}

export async function getReviewsForOwner(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: restaurantReviews.id, restaurantId: restaurantReviews.restaurantId, rating: restaurantReviews.rating, comment: restaurantReviews.comment, reply: restaurantReviews.reply, moderationStatus: restaurantReviews.moderationStatus, createdAt: restaurantReviews.createdAt }).from(restaurantReviews).innerJoin(restaurants, eq(restaurants.id, restaurantReviews.restaurantId)).where(eq(restaurants.ownerId, userId)).orderBy(desc(restaurantReviews.createdAt)).limit(100);
}

export async function moderateRestaurantReview(input: { reviewId: number; moderationStatus: "visible" | "hidden" | "pending" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(restaurantReviews).set({ moderationStatus: input.moderationStatus }).where(eq(restaurantReviews.id, input.reviewId));
  return { success: true as const };
}

export async function updateCourierLocation(input: { orderId: number; userId: number; lat: number; lng: number; sharing: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  if (!isValidCourierPoint(input.lat, input.lng)) throw new Error("Invalid courier coordinates");
  const courier = (await db.select({ name: users.name }).from(users).where(eq(users.id, input.userId)).limit(1))[0];
  const result = await db.update(orders).set({ courierId: input.userId, courierName: courier?.name ?? "Mealora courier", courierLatE6: Math.round(input.lat * 1e6), courierLngE6: Math.round(input.lng * 1e6), courierLocationUpdatedAt: new Date(), courierSharing: input.sharing ? 1 : 0 }).where(eq(orders.id, input.orderId));
  return { success: true as const, result };
}

export async function createRestaurantReview(input: { userId: number; restaurantId: number; orderId: number; rating: number; comment?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const order = (await db.select().from(orders).where(and(eq(orders.id, input.orderId), eq(orders.userId, input.userId), eq(orders.restaurantId, input.restaurantId))).limit(1))[0];
  if (!order || !canReviewOrder(order.status)) throw new Error("Reviews unlock after this order is delivered");
  const existing = await db.select({ id: restaurantReviews.id }).from(restaurantReviews).where(eq(restaurantReviews.orderId, input.orderId)).limit(1);
  if (existing[0]) throw new Error("You already reviewed this order");
  await db.insert(restaurantReviews).values(input);
  const restaurant = (await db.select({ ratingBasis: restaurants.ratingBasis, reviewCount: restaurants.reviewCount }).from(restaurants).where(eq(restaurants.id, input.restaurantId)).limit(1))[0];
  if (restaurant) {
    const nextRating = calculateNextRatingBasis(restaurant.ratingBasis, restaurant.reviewCount, input.rating);
    await db.update(restaurants).set(nextRating).where(eq(restaurants.id, input.restaurantId));
  }
  return { success: true as const };
}

export async function updateOrderState(input: { orderId: number; status?: "placed" | "confirmed" | "preparing" | "picked_up" | "on_the_way" | "delivered" | "cancelled"; paymentStatus?: "pending" | "initiated" | "paid" | "failed" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const order = (await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1))[0];
  if (!order) throw new Error("Order not found");
  await db.update(orders).set({ status: input.status ?? order.status, paymentStatus: input.paymentStatus ?? order.paymentStatus }).where(eq(orders.id, input.orderId));
  const event = getOrderNotificationEvent({ previousPaymentStatus: order.paymentStatus, nextPaymentStatus: input.paymentStatus ?? order.paymentStatus, previousStatus: order.status, nextStatus: input.status ?? order.status });
  if (!event) return { success: true as const, smsStatus: "not_required" as const };
  const eventKey = `${order.id}-${event}`;
  const existing = await db.select({ id: smsNotifications.id }).from(smsNotifications).where(eq(smsNotifications.eventKey, eventKey)).limit(1);
  if (existing[0]) return { success: true as const, smsStatus: "already_sent" as const };
  const phone = order.smsPhone ?? order.mobileMoneyPhone;
  if (!phone) return { success: true as const, smsStatus: "missing_phone" as const };
  const message = event === "paid" ? `MEALORA: Payment received for ${order.orderNumber}. We are preparing your order.` : `MEALORA: Order ${order.orderNumber} has been delivered. Enjoy your meal!`;
  await db.insert(smsNotifications).values({ orderId: order.id, eventKey, phone, message, status: "queued" });
  const result = await sendSms({ to: phone, message });
  await db.update(smsNotifications).set({ status: result.sent ? "sent" : "failed", providerReference: result.providerReference, errorMessage: result.errorMessage, sentAt: result.sent ? new Date() : undefined }).where(eq(smsNotifications.eventKey, eventKey));
  return { success: true as const, smsStatus: result.sent ? "sent" as const : "queued" as const };
}
