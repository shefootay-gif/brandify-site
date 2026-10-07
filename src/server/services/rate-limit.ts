import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import { rateLimit } from "@/server/db/schema";

/**
 * Fixed-window rate limiter backed by Postgres (works across multiple server
 * instances). Returns true when the request is allowed.
 */
export async function consumeRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const [row] = await db
    .insert(rateLimit)
    .values({ id: randomUUID(), key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`case when ${rateLimit.lastRequest} < ${windowStart} then 1 else ${rateLimit.count} + 1 end`,
        lastRequest: sql`case when ${rateLimit.lastRequest} < ${windowStart} then ${now} else ${rateLimit.lastRequest} end`,
      },
    })
    .returning({ count: rateLimit.count });
  return (row?.count ?? 1) <= max;
}

/** Best-effort client IP from proxy headers. */
export function clientIp(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}
