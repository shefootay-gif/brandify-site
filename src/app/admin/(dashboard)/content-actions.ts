"use server";

import { z } from "zod";
import { runAction } from "@/server/admin/action";
import { deleteRow, insertRow, reorder, updateRow, type SimpleEntity } from "@/server/admin/simple-crud";
import { tags, type CacheTag } from "@/server/cache";
import { logActivity } from "@/server/services/activity";
import { clientInput, faqInput, reorderInput, teamInput, testimonialInput } from "@/lib/validation/admin";

// Server actions for testimonials, client logos, team members and FAQs.

const config = {
  testimonials: { schema: testimonialInput, tags: [tags.testimonials, tags.projects] as CacheTag[], label: "رأي عميل", visibleKey: "status" },
  clients: { schema: clientInput, tags: [tags.clients] as CacheTag[], label: "عميل", visibleKey: "visible" },
  team: { schema: teamInput, tags: [tags.team] as CacheTag[], label: "عضو فريق", visibleKey: "visible" },
  faqs: { schema: faqInput, tags: [tags.faqs] as CacheTag[], label: "سؤال شائع", visibleKey: "visible" },
} as const;

const entityInput = z.enum(["testimonials", "clients", "team", "faqs"]);

export async function saveEntityAction(entity: SimpleEntity, id: string | null, input: unknown) {
  const e = entityInput.parse(entity);
  const c = config[e];
  return runAction({ tags: c.tags }, async (user) => {
    const data = c.schema.parse(input) as Record<string, unknown>;
    let rowId = id;
    if (rowId) await updateRow(e, z.uuid().parse(rowId), data);
    else rowId = await insertRow(e, data);
    await logActivity({ userId: user.id, action: id ? "update" : "create", entityType: e, entityId: rowId, summary: `${id ? "تعديل" : "إضافة"} ${c.label}` });
    return { id: rowId };
  });
}

/** Publish/unpublish (testimonials) or show/hide (others). */
export async function setEntityVisibleAction(entity: SimpleEntity, id: string, visible: boolean) {
  const e = entityInput.parse(entity);
  const c = config[e];
  return runAction({ tags: c.tags }, async () => {
    await updateRow(e, z.uuid().parse(id), c.visibleKey === "status" ? { status: visible ? "published" : "draft" } : { visible });
  });
}

export async function deleteEntityAction(entity: SimpleEntity, id: string) {
  const e = entityInput.parse(entity);
  const c = config[e];
  return runAction({ tags: c.tags }, async (user) => {
    await deleteRow(e, z.uuid().parse(id));
    await logActivity({ userId: user.id, action: "delete", entityType: e, entityId: id, summary: `حذف ${c.label}` });
  });
}

export async function reorderEntityAction(entity: SimpleEntity, ids: string[]) {
  const e = entityInput.parse(entity);
  return runAction({ tags: config[e].tags }, async () => reorder(e, reorderInput.parse(ids)));
}
