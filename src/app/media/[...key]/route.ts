import { readLocalFile, readLocalRange, statLocalFile } from "@/server/storage";

const TYPES: Record<string, string> = {
  webp: "image/webp",
  avif: "image/avif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  ico: "image/x-icon",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

// Max chunk served per range request (keeps memory flat for large videos).
const MAX_CHUNK = 2 * 1024 * 1024;

export async function GET(request: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const storageKey = key.join("/");
  const file = await statLocalFile(storageKey);
  if (!file) return new Response("Not found", { status: 404 });

  const ext = storageKey.split(".").pop()?.toLowerCase() ?? "";
  const headers: Record<string, string> = {
    "Content-Type": TYPES[ext] ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };

  // Byte ranges so videos can seek / stream (required by iOS Safari).
  const match = request.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (match) {
    const start = match[1] ? Number(match[1]) : Math.max(0, file.size - Number(match[2] || 0));
    let end = match[1] && match[2] ? Number(match[2]) : file.size - 1;
    end = Math.min(end, file.size - 1, start + MAX_CHUNK - 1);
    if (start > end || start >= file.size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${file.size}` } });
    }
    const chunk = await readLocalRange(file.path, start, end);
    return new Response(new Uint8Array(chunk), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${file.size}`, "Content-Length": String(chunk.length) },
    });
  }

  if (headers["Content-Type"]!.startsWith("video/") && file.size > MAX_CHUNK) {
    // Browsers request videos with ranges; serve the first chunk if they don't.
    const chunk = await readLocalRange(file.path, 0, MAX_CHUNK - 1);
    return new Response(new Uint8Array(chunk), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes 0-${MAX_CHUNK - 1}/${file.size}`, "Content-Length": String(chunk.length) },
    });
  }

  const data = await readLocalFile(file.path);
  return new Response(new Uint8Array(data), { headers: { ...headers, "Content-Length": String(file.size) } });
}
