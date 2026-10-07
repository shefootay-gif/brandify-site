"use server";

import { runAction } from "@/server/admin/action";
import { tags } from "@/server/cache";
import { db } from "@/server/db";
import { seoEntries } from "@/server/db/schema";
import { logActivity } from "@/server/services/activity";
import { seoInput } from "@/lib/validation/admin";

export async function saveSeoAction(input: unknown) {
  return runAction({ tags: [tags.seo] }, async (user) => {
    const data = seoInput.parse(input);
    await db
      .insert(seoEntries)
      .values(data)
      .onConflictDoUpdate({ target: seoEntries.routeKey, set: { title: data.title, description: data.description, ogImageId: data.ogImageId, noindex: data.noindex } });
    await logActivity({ userId: user.id, action: "update", entityType: "seo", entityId: data.routeKey, summary: `SEO: ${data.routeKey}` });
  });
}
