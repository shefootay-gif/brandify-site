import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { activityLog, user } from "@/server/db/schema";

export async function logActivity(entry: {
  userId?: string | null;
  action: "create" | "update" | "delete" | "publish" | "unpublish" | "status" | "login" | "upload" | "lead";
  entityType: string;
  entityId?: string | null;
  summary: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await db.insert(activityLog).values({
      userId: entry.userId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      summary: entry.summary.slice(0, 300),
      meta: entry.meta ?? {},
    });
  } catch (error) {
    // Activity is best-effort; never block the main operation.
    console.error("[activity] failed to log", error);
  }
}

export async function recentActivity(limit = 10) {
  return db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      summary: activityLog.summary,
      createdAt: activityLog.createdAt,
      userName: user.name,
    })
    .from(activityLog)
    .leftJoin(user, eq(activityLog.userId, user.id))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}
