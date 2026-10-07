import "server-only";
import { ZodError } from "zod";
import { AuthError, assertRole, type Role, type SessionUser } from "@/server/auth/session";
import { invalidate, type CacheTag } from "@/server/cache";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: "unauthorized" | "forbidden" | "invalid" | "duplicate" | "not_found" | "in_use" | "server"; fieldErrors?: Record<string, string> };

export class NotFoundError extends Error {}

/**
 * Wraps every dashboard mutation: authorization, validation error mapping,
 * DB constraint mapping, cache invalidation and safe error reporting.
 */
export async function runAction<T>(
  opts: { role?: Role; tags?: CacheTag[] },
  fn: (user: SessionUser) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const user = await assertRole(opts.role ?? "editor");
    const data = await fn(user);
    if (opts.tags?.length) invalidate(...opts.tags);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.code };
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { ok: false, error: "invalid", fieldErrors };
    }
    if (error instanceof NotFoundError) return { ok: false, error: "not_found" };
    const code = (error as { code?: string; cause?: { code?: string } })?.cause?.code ?? (error as { code?: string })?.code;
    if (code === "23505") return { ok: false, error: "duplicate", fieldErrors: { slug: "duplicate" } };
    if (code === "23503") return { ok: false, error: "in_use" };
    console.error("[admin action]", error);
    return { ok: false, error: "server" };
  }
}
