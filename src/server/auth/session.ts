import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./index";

export type Role = "admin" | "editor";
export type SessionUser = { id: string; name: string; email: string; role: Role; image: string | null };

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as typeof session.user & { role?: string };
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === "admin" ? "admin" : "editor",
    image: u.image ?? null,
  };
});

/** Use in admin pages: redirects to the login page when signed out. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

export class AuthError extends Error {
  constructor(public code: "unauthorized" | "forbidden") {
    super(code);
  }
}

/**
 * Use in server actions and route handlers. Every mutation must call this —
 * the proxy cookie check is only an optimistic redirect, not authorization.
 */
export async function assertRole(min: Role = "editor"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError("unauthorized");
  if (min === "admin" && user.role !== "admin") throw new AuthError("forbidden");
  return user;
}
