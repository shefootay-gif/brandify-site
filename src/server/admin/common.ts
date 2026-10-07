import "server-only";
import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/server/db";
import { getMediaMap } from "@/server/services/media";
import type { PublicMedia } from "@/server/db/schema/types";

/** Persist a new order for rows with (id uuid, sort_order int). */
export async function reorderRows(table: PgTable, ids: string[]) {
  if (!ids.length) return;
  const cases = sql.join(
    ids.map((id, i) => sql`when ${id}::uuid then ${i}`),
    sql` `,
  );
  const list = sql.join(
    ids.map((id) => sql`${id}::uuid`),
    sql`, `,
  );
  await db.execute(sql`update ${table} set sort_order = case id ${cases} end where id in (${list})`);
}

/** Resolve media ids to client-safe media objects for editors. */
export async function mediaFor(ids: Array<string | null | undefined>): Promise<Record<string, PublicMedia>> {
  const map = await getMediaMap(ids);
  return Object.fromEntries(map);
}
