import { COOKIE_NAME } from "@shared/const";
import { fallbackCities, fallbackMenu, fallbackRestaurants, fallbackTracking } from "@shared/catalog";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createOrderForUser, createPartnerApplication, getCitiesFromDb, getDb, getFavoritesForUser, getMenuFromDb, getOrdersForUser, getRestaurantsFromDb, toggleFavorite } from "./db";
import { and, eq } from "drizzle-orm";
import { orders } from "../drizzle/schema";
import { z } from "zod";

const textFromResponse = (content: unknown) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(part => typeof part === "string" ? part : "text" in part ? part.text : "").join(" ");
  return "";
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  marketplace: router({
    cities: publicProcedure.query(async () => {
      const dbRows = await getCitiesFromDb();
      return dbRows.length ? dbRows.map(row => ({ ...row, isActive: Boolean(row.isActive) })) : fallbackCities;
    }),
    restaurants: publicProcedure.input(z.object({ citySlug: z.string().optional(), cuisine: z.string().optional(), query: z.string().optional() }).optional()).query(async ({ input }) => {
      const dbRows = await getRestaurantsFromDb();
      const source = dbRows.length ? dbRows.map(row => ({ ...row, rating: row.ratingBasis / 100, priceBand: row.priceBand.startsWith("UGX") ? row.priceBand : `UGX ${row.priceBand}`, isOpen: Boolean(row.isOpen) })) : fallbackRestaurants;
      const city = input?.citySlug?.toLowerCase();
      const cityId = city ? fallbackCities.find(entry => entry.slug === city)?.id : undefined;
      const query = input?.query?.toLowerCase();
      return source.filter(restaurant => (!query || `${restaurant.name} ${restaurant.cuisine} ${restaurant.description}`.toLowerCase().includes(query)) && (!input?.cuisine || input.cuisine === "All cuisines" || restaurant.cuisine.toLowerCase().includes(input.cuisine.toLowerCase())) && (!cityId || restaurant.cityId === cityId));
    }),
    menu: publicProcedure.input(z.object({ restaurantId: z.number() })).query(async ({ input }) => {
      const dbRows = await getMenuFromDb(input.restaurantId);
      return dbRows.length ? dbRows.map(row => ({ ...row, isAvailable: Boolean(row.isAvailable) })) : fallbackMenu.filter(item => item.restaurantId === input.restaurantId);
    }),
  }),
  ai: router({
    suggest: publicProcedure.input(z.object({ query: z.string().min(2).max(240) })).mutation(async ({ input }) => {
      const fallback = {
        intent: input.query,
        cuisines: input.query.toLowerCase().includes("spicy") ? ["Ugandan", "East African", "Lakeside grill"] : input.query.toLowerCase().includes("healthy") ? ["Lakeside grill", "Ugandan", "Coffee & bakery"] : ["Ugandan", "Street food", "Lakeside grill"],
        meals: input.query.toLowerCase().includes("breakfast") ? ["Kampala rolex", "chapati", "highland coffee"] : input.query.toLowerCase().includes("date") ? ["Lake Victoria tilapia", "local small plates", "passion fruit drink"] : ["matoke & grilled chicken", "Jinja street box", "Lake Victoria tilapia"],
        explanation: "Curated from Uganda's local flavours, then refined by what is open nearby.",
      };
      try {
        const response = await invokeLLM({
          model: "gpt-5-mini",
          messages: [
            { role: "system", content: "You are Mealora Uganda's food concierge. Convert natural language cravings into concise suggestions using Ugandan and East African food, local restaurants, drinks, and delivery context. Return valid JSON only." },
            { role: "user", content: input.query },
          ],
          response_format: { type: "json_schema", json_schema: { name: "meal_suggestions", strict: true, schema: { type: "object", properties: { intent: { type: "string" }, cuisines: { type: "array", items: { type: "string" } }, meals: { type: "array", items: { type: "string" } }, explanation: { type: "string" } }, required: ["intent", "cuisines", "meals", "explanation"], additionalProperties: false } } },
          max_tokens: 500,
        });
        const content = textFromResponse(response.choices[0]?.message.content);
        return { ...fallback, ...JSON.parse(content) };
      } catch {
        return fallback;
      }
    }),
  }),
  favorites: router({
    list: protectedProcedure.query(({ ctx }) => getFavoritesForUser(ctx.user.id)),
    toggle: protectedProcedure.input(z.object({ restaurantId: z.number() })).mutation(({ ctx, input }) => toggleFavorite(ctx.user.id, input.restaurantId)),
  }),
  orders: router({
    list: protectedProcedure.query(({ ctx }) => getOrdersForUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({ restaurantId: z.number(), deliveryAddress: z.string().min(5), items: z.array(z.object({ menuItemId: z.number(), quantity: z.number().int().min(1).max(20) })).min(1) })).mutation(({ ctx, input }) => createOrderForUser({ ...input, userId: ctx.user.id })),
    track: protectedProcedure.input(z.object({ orderId: z.number().optional() }).optional()).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || !input?.orderId) return fallbackTracking;
      const row = await db.select().from(orders).where(and(eq(orders.id, input.orderId), eq(orders.userId, ctx.user.id))).limit(1);
      if (!row[0]) return fallbackTracking;
      const order = row[0];
      return { ...fallbackTracking, status: order.status, label: order.status === "delivered" ? "Delivered" : `Order ${order.status.replace("_", " ")}`, etaMinutes: order.etaMinutes ?? 18, courierName: order.courierName ?? "Moses", courierLat: (order.courierLatE6 ?? 326600) / 1e6, courierLng: (order.courierLngE6 ?? 32582500) / 1e6, updatedAt: Date.now() };
    }),
  }),
  partners: router({
    submitApplication: protectedProcedure.input(z.object({ applicationType: z.enum(["restaurant", "courier", "business"]), businessName: z.string().min(2), contactEmail: z.string().email(), city: z.string().min(2), details: z.string().min(12) })).mutation(({ ctx, input }) => createPartnerApplication({ ...input, userId: ctx.user.id })),
  }),
});

export type AppRouter = typeof appRouter;
