"use server";

import { z } from "zod";
import { runAction } from "@/server/admin/action";
import { tags } from "@/server/cache";
import { deleteMedia, listFolders, listMedia, updateMediaMeta } from "@/server/services/media";
import { logActivity } from "@/server/services/activity";
import { localized } from "@/lib/validation/common";

const listInput = z.object({
  folder: z.string().max(40).optional(),
  kind: z.enum(["image", "video", "all"]).optional(),
  q: z.string().max(100).optional(),
  offset: z.number().int().min(0).max(100000).optional(),
});

export async function listMediaAction(input: z.input<typeof listInput>) {
  return runAction({}, async () => {
    const f = listInput.parse(input);
    const [res, folders] = await Promise.all([
      listMedia({ folder: f.folder || undefined, kind: f.kind === "all" ? undefined : f.kind, q: f.q, offset: f.offset, limit: 48 }),
      listFolders(),
    ]);
    return {
      folders,
      total: res.total,
      items: res.items.map((m) => ({
        id: m.id,
        kind: m.kind,
        url: m.url,
        width: m.width,
        height: m.height,
        blurDataUrl: m.blurDataUrl,
        variants: m.variants,
        alt: m.alt,
        mime: m.mime,
        filename: m.filename,
        size: m.size,
        folder: m.folder,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  });
}

const metaInput = z.object({
  id: z.uuid(),
  alt: localized(300),
  folder: z.string().trim().regex(/^[a-z0-9-]{1,40}$/i, "slug"),
});

export async function updateMediaAction(input: z.input<typeof metaInput>) {
  return runAction({ tags: [tags.media] }, async () => {
    const data = metaInput.parse(input);
    await updateMediaMeta(data.id, { alt: data.alt, folder: data.folder.toLowerCase() });
  });
}

export async function deleteMediaAction(id: string) {
  return runAction({ tags: [tags.media, tags.projects, tags.services, tags.testimonials, tags.clients, tags.team] }, async (user) => {
    const row = await deleteMedia(z.uuid().parse(id));
    if (row) await logActivity({ userId: user.id, action: "delete", entityType: "media", entityId: id, summary: row.filename });
  });
}
