import { desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { moderationActions, partnerApplications, reviewReports, users } from "../drizzle/schema";
import { canChangeRole, type AdminRole } from "./admin-validation";

export async function getReviewReportHistory() { const db = await getDb(); return db ? db.select().from(reviewReports).orderBy(desc(reviewReports.createdAt)).limit(200) : []; }
export async function getModerationHistory() { const db = await getDb(); return db ? db.select().from(moderationActions).orderBy(desc(moderationActions.createdAt)).limit(200) : []; }
export async function addModerationAction(input: { reportId?: number; reviewId?: number; moderatorId: number; action: string; notes?: string }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.insert(moderationActions).values(input); return { success: true as const }; }
export async function getPartnerApplications() { const db = await getDb(); return db ? db.select().from(partnerApplications).orderBy(desc(partnerApplications.createdAt)).limit(200) : []; }
export async function getAdminUsers() { const db = await getDb(); return db ? db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(200) : []; }
export async function updateUserRole(input: { userId: number; role: AdminRole; actorId: number }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); if (!canChangeRole(input.actorId, input.userId, input.role)) throw new Error("You cannot remove your own admin access"); await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId)); return { success: true as const }; }
export async function reviewPartnerApplication(input: { applicationId: number; status: "reviewing" | "approved" | "declined" }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.update(partnerApplications).set({ status: input.status, updatedAt: new Date() }).where(eq(partnerApplications.id, input.applicationId)); return { success: true as const }; }
