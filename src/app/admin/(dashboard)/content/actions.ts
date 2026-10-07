"use server";

import { z } from "zod";
import { runAction } from "@/server/admin/action";
import { tags } from "@/server/cache";
import { saveBlock } from "@/server/services/settings";
import { logActivity } from "@/server/services/activity";
import { sanitizeLocalizedHtml } from "@/server/sanitize";
import type { BlockKey } from "@/content/blocks";

const keys = z.enum(["home", "process", "about", "legal.privacy", "legal.terms"]);
const labels: Record<BlockKey, string> = {
  home: "الصفحة الرئيسية",
  process: "طريقة العمل",
  about: "من نحن",
  "legal.privacy": "سياسة الخصوصية",
  "legal.terms": "الشروط والأحكام",
};

export async function saveBlockAction(key: BlockKey, data: unknown) {
  return runAction({ tags: [tags.content] }, async (user) => {
    const k = keys.parse(key);
    let input = data as Record<string, unknown>;
    if (k.startsWith("legal.") && input && typeof input === "object") {
      input = { ...input, body: sanitizeLocalizedHtml(input.body as { ar: string; en: string }) };
    }
    await saveBlock(k, input, user.id);
    await logActivity({ userId: user.id, action: "update", entityType: "content", entityId: k, summary: `تعديل محتوى: ${labels[k]}` });
  });
}
