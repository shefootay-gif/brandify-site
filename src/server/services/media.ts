import "server-only";
import { randomUUID } from "node:crypto";
type Metadata = import("sharp").Metadata;
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { media } from "@/server/db/schema";
import type { MediaVariant, PublicMedia } from "@/server/db/schema/types";
import { getStorage } from "@/server/storage";

export type { PublicMedia };

export const MEDIA_LIMITS = {
  imageBytes: 15 * 1024 * 1024,
  videoBytes: 120 * 1024 * 1024,
  maxImageWidth: 2400,
  variantWidths: [480, 960, 1600],
} as const;

// SVG is intentionally excluded (can carry scripts).
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const VIDEO_TYPES: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };

export type MediaRecord = typeof media.$inferSelect;

export class UploadError extends Error {
  constructor(public code: "type" | "size" | "corrupt") {
    super(code);
  }
}

function datePrefix() {
  const d = new Date();
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Validate, optimise and store an uploaded file. Images are re-encoded to
 * WebP (EXIF stripped, auto-rotated) with responsive width variants and a
 * tiny blur placeholder. Videos are stored as-is within the size limit.
 */
export async function storeUpload(file: File, opts: { folder: string; userId: string; altAr?: string; altEn?: string }) {
  const storage = getStorage();
  const id = randomUUID();
  const base = `${datePrefix()}/${id}`;
  const buf = Buffer.from(await file.arrayBuffer());

  // Trust content, not the client-provided type: sniff images with sharp.
  if (IMAGE_TYPES.has(file.type)) {
    if (buf.length > MEDIA_LIMITS.imageBytes) throw new UploadError("size");
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default;
    let meta: Metadata;
    try {
      meta = await sharp(buf).metadata();
    } catch {
      throw new UploadError("corrupt");
    }
    if (!meta.format || !["jpeg", "png", "webp", "avif", "gif", "heif"].includes(meta.format)) {
      throw new UploadError("type");
    }
    const animated = (meta.pages ?? 1) > 1;
    const pipeline = sharp(buf, { animated }).rotate();
    const main = await pipeline
      .clone()
      .resize({ width: MEDIA_LIMITS.maxImageWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
    const { url } = await storage.put(`${base}.webp`, main.data, "image/webp");

    const variants: MediaVariant[] = [];
    if (!animated) {
      for (const w of MEDIA_LIMITS.variantWidths) {
        if (w >= main.info.width) continue;
        const v = await pipeline.clone().resize({ width: w }).webp({ quality: 78 }).toBuffer();
        const put = await storage.put(`${base}-${w}.webp`, v, "image/webp");
        variants.push({ width: w, url: put.url });
      }
    }
    variants.push({ width: main.info.width, url });

    const blur = await sharp(buf).rotate().resize(16).webp({ quality: 40 }).toBuffer();

    const [row] = await db
      .insert(media)
      .values({
        id,
        kind: "image",
        filename: file.name.slice(0, 200),
        storageKey: `${base}.webp`,
        url,
        mime: "image/webp",
        size: main.data.length,
        width: main.info.width,
        height: main.info.height,
        blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
        variants,
        alt: { ar: opts.altAr ?? "", en: opts.altEn ?? "" },
        folder: opts.folder,
        uploadedBy: opts.userId,
      })
      .returning();
    return row!;
  }

  const ext = VIDEO_TYPES[file.type];
  if (ext) {
    if (buf.length > MEDIA_LIMITS.videoBytes) throw new UploadError("size");
    if (!looksLikeVideo(buf)) throw new UploadError("type");
    const key = `${base}.${ext}`;
    const { url } = await storage.put(key, buf, file.type);
    const [row] = await db
      .insert(media)
      .values({
        id,
        kind: "video",
        filename: file.name.slice(0, 200),
        storageKey: key,
        url,
        mime: file.type,
        size: buf.length,
        alt: { ar: opts.altAr ?? "", en: opts.altEn ?? "" },
        folder: opts.folder,
        uploadedBy: opts.userId,
      })
      .returning();
    return row!;
  }

  throw new UploadError("type");
}

/** MP4/MOV have an "ftyp" box at offset 4; WebM starts with the EBML magic. */
function looksLikeVideo(buf: Buffer) {
  if (buf.length < 12) return false;
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") return true;
  return buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3;
}

export async function listMedia(opts: { folder?: string; kind?: string; q?: string; limit?: number; offset?: number }) {
  const where = and(
    opts.folder ? eq(media.folder, opts.folder) : undefined,
    opts.kind === "image" || opts.kind === "video" ? eq(media.kind, opts.kind) : undefined,
    opts.q ? ilike(media.filename, `%${opts.q.replace(/[%_]/g, "")}%`) : undefined,
  );
  const [items, [count]] = await Promise.all([
    db
      .select()
      .from(media)
      .where(where)
      .orderBy(desc(media.createdAt))
      .limit(opts.limit ?? 48)
      .offset(opts.offset ?? 0),
    db.select({ n: sql<number>`count(*)::int` }).from(media).where(where),
  ]);
  return { items, total: count?.n ?? 0 };
}

export async function listFolders(): Promise<string[]> {
  const rows = await db.selectDistinct({ folder: media.folder }).from(media).orderBy(media.folder);
  return rows.map((r) => r.folder);
}

export async function getMediaMap(ids: Array<string | null | undefined>): Promise<Map<string, PublicMedia>> {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!unique.length) return new Map();
  const rows = await db
    .select({
      id: media.id,
      kind: media.kind,
      url: media.url,
      width: media.width,
      height: media.height,
      blurDataUrl: media.blurDataUrl,
      variants: media.variants,
      alt: media.alt,
      mime: media.mime,
    })
    .from(media)
    .where(inArray(media.id, unique));
  return new Map(rows.map((r) => [r.id, r]));
}

export async function deleteMedia(id: string) {
  const [row] = await db.delete(media).where(eq(media.id, id)).returning();
  if (!row) return null;
  const storage = getStorage();
  const keys = [row.storageKey, ...row.variants.map((v) => v.url.replace(/^\/media\//, ""))];
  await Promise.all([...new Set(keys)].map((k) => storage.delete(k).catch(() => {})));
  return row;
}

export async function updateMediaMeta(id: string, data: { alt: { ar: string; en: string }; folder: string }) {
  const [row] = await db.update(media).set(data).where(eq(media.id, id)).returning();
  return row ?? null;
}
