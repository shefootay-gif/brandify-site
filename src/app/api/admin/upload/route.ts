import { AuthError, assertRole } from "@/server/auth/session";
import { storeUpload, UploadError, MEDIA_LIMITS } from "@/server/services/media";
import { logActivity } from "@/server/services/activity";
import { invalidate, tags } from "@/server/cache";
import { consumeRateLimit } from "@/server/services/rate-limit";

export const runtime = "nodejs";

/** Authenticated multipart upload (one file per request so progress is per file). */
export async function POST(request: Request) {
  let user;
  try {
    user = await assertRole("editor");
  } catch (e) {
    const code = e instanceof AuthError ? e.code : "unauthorized";
    return Response.json({ ok: false, error: code }, { status: code === "forbidden" ? 403 : 401 });
  }

  if (!(await consumeRateLimit(`upload:${user.id}`, 120, 600))) {
    return Response.json({ ok: false, error: "rate" }, { status: 429 });
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MEDIA_LIMITS.videoBytes + 1024 * 1024) {
    return Response.json({ ok: false, error: "size" }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "corrupt" }, { status: 400 });
  }
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "general").replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "general";
  if (!(file instanceof File) || file.size === 0) return Response.json({ ok: false, error: "type" }, { status: 400 });

  try {
    const row = await storeUpload(file, { folder, userId: user.id });
    invalidate(tags.media);
    await logActivity({ userId: user.id, action: "upload", entityType: "media", entityId: row.id, summary: row.filename });
    return Response.json({
      ok: true,
      media: {
        id: row.id,
        kind: row.kind,
        url: row.url,
        width: row.width,
        height: row.height,
        blurDataUrl: row.blurDataUrl,
        variants: row.variants,
        alt: row.alt,
        mime: row.mime,
        filename: row.filename,
        size: row.size,
        folder: row.folder,
      },
    });
  } catch (e) {
    if (e instanceof UploadError) return Response.json({ ok: false, error: e.code }, { status: 400 });
    console.error("[upload]", e);
    return Response.json({ ok: false, error: "server" }, { status: 500 });
  }
}
