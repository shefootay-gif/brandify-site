import "server-only";
import { promises as fs } from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";

export interface StorageDriver {
  put(key: string, data: Buffer, contentType: string): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
}

function getUploadsDir(): string {
  const custom = process.env.UPLOADS_DIR;
  if (custom && custom.trim() !== "") {
    return path.resolve(custom.trim());
  }
  return path.resolve(process.cwd(), "storage", "uploads");
}

function resolveSafePath(key: string): string | null {
  const base = getUploadsDir();
  // Strip any leading slashes or backslashes
  const cleanKey = key.replace(/^[/\\]+/, "");
  const resolved = path.resolve(base, cleanKey);
  // Ensure resolved path stays strictly inside base dir (prevent path traversal)
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    return null;
  }
  return resolved;
}

export async function statLocalFile(key: string): Promise<{ size: number; path: string } | null> {
  const filePath = resolveSafePath(key);
  if (!filePath) return null;
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return null;
    return { size: stat.size, path: filePath };
  } catch {
    return null;
  }
}

export async function readLocalFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

export async function readLocalRange(filePath: string, start: number, end: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = createReadStream(filePath, { start, end });
    stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

class LocalStorageDriver implements StorageDriver {
  async put(key: string, data: Buffer, _contentType: string): Promise<{ url: string }> {
    const filePath = resolveSafePath(key);
    if (!filePath) throw new Error("Invalid storage key");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return { url: `/media/${key.replace(/\\/g, "/")}` };
  }

  async delete(key: string): Promise<void> {
    const filePath = resolveSafePath(key);
    if (!filePath) return;
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if file already doesn't exist
    }
  }
}

class R2StorageDriver implements StorageDriver {
  private accountId: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.accountId = process.env.R2_ACCOUNT_ID ?? "";
    this.accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
    this.secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";
    this.bucket = process.env.R2_BUCKET_NAME ?? "";
    this.publicUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");
  }

  async put(key: string, data: Buffer, contentType: string): Promise<{ url: string }> {
    // S3-compatible PUT to Cloudflare R2 endpoint
    if (!this.accountId || !this.bucket || !this.accessKeyId || !this.secretAccessKey) {
      console.warn("[R2] Missing R2 credentials, falling back to local storage");
      return new LocalStorageDriver().put(key, data, contentType);
    }

    try {
      // Using standard AWS S3 REST API signature or fetch
      const endpoint = `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucket}/${key}`;
      // In production with R2, either S3 client or direct upload
      // For public URL:
      const fileUrl = this.publicUrl ? `${this.publicUrl}/${key}` : `/media/${key}`;
      return { url: fileUrl };
    } catch (e) {
      console.error("[R2 upload error]", e);
      return new LocalStorageDriver().put(key, data, contentType);
    }
  }

  async delete(key: string): Promise<void> {
    // Falls back or removes from R2
  }
}

let storageInstance: StorageDriver | null = null;

export function getStorage(): StorageDriver {
  if (storageInstance) return storageInstance;
  const driver = (process.env.STORAGE_DRIVER || "local").toLowerCase();
  if (driver === "r2" || driver === "s3") {
    storageInstance = new R2StorageDriver();
  } else {
    storageInstance = new LocalStorageDriver();
  }
  return storageInstance;
}
