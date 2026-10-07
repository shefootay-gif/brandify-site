"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { services } from "@/server/db/schema";
import { runAction, NotFoundError } from "@/server/admin/action";
import { reorderRows } from "@/server/admin/common";
import { tags } from "@/server/cache";
import { logActivity } from "@/server/services/activity";
import { reorderInput, serviceInput } from "@/lib/validation/admin";

const serviceTags = [tags.services, tags.projects, tags.faqs];

export async function saveServiceAction(id: string | null, input: unknown) {
  return runAction({ tags: serviceTags }, async (user) => {
    const data = serviceInput.parse(input);
    let sid = id;
    if (sid) {
      const [row] = await db.update(services).set(data).where(eq(services.id, sid)).returning({ id: services.id });
      if (!row) throw new NotFoundError();
    } else {
      const all = await db.select({ id: services.id }).from(services);
      const [row] = await db.insert(services).values({ ...data, sortOrder: all.length }).returning({ id: services.id });
      sid = row!.id;
    }
    await logActivity({ userId: user.id, action: id ? "update" : "create", entityType: "service", entityId: sid, summary: `${id ? "تعديل" : "إضافة"} خدمة: ${data.title.ar}` });
    return { id: sid };
  });
}

export async function setServiceVisibleAction(id: string, visible: boolean) {
  return runAction({ tags: serviceTags }, async () => {
    const [row] = await db.update(services).set({ visible }).where(eq(services.id, z.uuid().parse(id))).returning();
    if (!row) throw new NotFoundError();
  });
}

export async function deleteServiceAction(id: string) {
  return runAction({ role: "admin", tags: serviceTags }, async (user) => {
    const [row] = await db.delete(services).where(eq(services.id, z.uuid().parse(id))).returning();
    if (!row) throw new NotFoundError();
    await logActivity({ userId: user.id, action: "delete", entityType: "service", entityId: id, summary: `حذف خدمة: ${row.title.ar}` });
  });
}

export async function reorderServicesAction(ids: string[]) {
  return runAction({ tags: [tags.services] }, async () => reorderRows(services, reorderInput.parse(ids)));
}
