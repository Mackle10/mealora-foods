export const adminRoles = ["user", "admin", "courier", "restaurant_owner"] as const;
export type AdminRole = typeof adminRoles[number];

export function canManageRoles(role: string) { return role === "admin"; }
export function normalizeModeratorNotes(notes?: string) { const value = notes?.trim(); return value ? value.slice(0, 1000) : undefined; }
