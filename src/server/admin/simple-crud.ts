import "server-only";
import { eq, count } from "drizzle-orm";
import { db } from "@/server/db";
import { clients, faqs, teamMembers, testimonials } from "@/server/db/schema";
import { NotFoundError } from "./action";
import { reorderRows } from "./common";

// Shared CRUD for the simple sortable content types. Each table has
// id (uuid) and sort_order columns; validation happens in the actions.
const tables = { testimonials, clients, team: teamMembers, faqs } as const;
export type SimpleEntity = keyof typeof tables;

export async function insertRow(entity: SimpleEntity, values: Record<string, unknown>) {
  const table = tables[entity];
  const [c] = await db.select({ n: count() }).from(table);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await db.insert(table).values({ ...values, sortOrder: c?.n ?? 0 } as any).returning({ id: table.id });
  return row!.id;
}

export async function updateRow(entity: SimpleEntity, id: string, values: Record<string, unknown>) {
  const table = tables[entity];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await db.update(table).set(values as any).where(eq(table.id, id)).returning({ id: table.id });
  if (!row) throw new NotFoundError();
}

export async function deleteRow(entity: SimpleEntity, id: string) {
  const table = tables[entity];
  const [row] = await db.delete(table).where(eq(table.id, id)).returning({ id: table.id });
  if (!row) throw new NotFoundError();
}

export async function reorder(entity: SimpleEntity, ids: string[]) {
  await reorderRows(tables[entity], ids);
}
