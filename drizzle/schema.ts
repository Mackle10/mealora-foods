import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const signupRequests = mysqlTable("signupRequests", {
  id: int("id").autoincrement().primaryKey(),
  contactType: mysqlEnum("contactType", ["email", "phone"]).notNull(),
  contact: varchar("contact", { length: 320 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["pending", "started"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const cities = mysqlTable("cities", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  country: varchar("country", { length: 120 }).notNull(),
  region: varchar("region", { length: 120 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  tagline: text("tagline").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  cityId: int("cityId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  cuisine: varchar("cuisine", { length: 120 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("imageUrl").notNull(),
  ratingBasis: int("ratingBasis").default(0).notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  deliveryMinutes: int("deliveryMinutes").default(30).notNull(),
  priceBand: varchar("priceBand", { length: 8 }).default("$$").notNull(),
  isOpen: int("isOpen").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const menuItems = mysqlTable("menuItems", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  priceCents: int("priceCents").notNull(),
  currency: varchar("currency", { length: 8 }).default("USD").notNull(),
  isAvailable: int("isAvailable").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  restaurantId: int("restaurantId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ userRestaurantUnique: uniqueIndex("favorites_user_restaurant_unique").on(table.userId, table.restaurantId) }));

export const deliveryAddresses = mysqlTable("deliveryAddresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 60 }).notNull(),
  recipientName: varchar("recipientName", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  instructions: text("instructions"),
  isDefault: int("isDefault").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ userLabelUnique: uniqueIndex("delivery_addresses_user_label_unique").on(table.userId, table.label) }));

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
  userId: int("userId").notNull(),
  restaurantId: int("restaurantId").notNull(),
  status: mysqlEnum("status", ["placed", "confirmed", "preparing", "picked_up", "on_the_way", "delivered", "cancelled"]).default("placed").notNull(),
  subtotalCents: int("subtotalCents").notNull(),
  deliveryFeeCents: int("deliveryFeeCents").notNull(),
  totalCents: int("totalCents").notNull(),
  currency: varchar("currency", { length: 8 }).default("USD").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash_on_delivery", "mtn_momo", "airtel_money", "card"]).default("cash_on_delivery").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "initiated", "paid", "failed"]).default("pending").notNull(),
  mobileMoneyPhone: varchar("mobileMoneyPhone", { length: 40 }),
  mobileMoneyReference: varchar("mobileMoneyReference", { length: 120 }),
  deliveryAddress: text("deliveryAddress").notNull(),
  courierName: varchar("courierName", { length: 120 }),
  courierPhone: varchar("courierPhone", { length: 40 }),
  courierLatE6: int("courierLatE6"),
  courierLngE6: int("courierLngE6"),
  etaMinutes: int("etaMinutes"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 120 }),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  itemName: varchar("itemName", { length: 160 }).notNull(),
  unitPriceCents: int("unitPriceCents").notNull(),
  quantity: int("quantity").notNull(),
});

export const partnerApplications = mysqlTable("partnerApplications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  applicationType: mysqlEnum("applicationType", ["restaurant", "courier", "business"]).notNull(),
  businessName: varchar("businessName", { length: 180 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  details: text("details").notNull(),
  status: mysqlEnum("status", ["new", "reviewing", "approved", "declined"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
