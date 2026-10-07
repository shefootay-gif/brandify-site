"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/server/db";
import { account, session, user as userTable } from "@/server/db/schema";
import { auth } from "@/server/auth";
import { runAction, NotFoundError } from "@/server/admin/action";
import { tags } from "@/server/cache";
import { getSettings, saveSettings } from "@/server/services/settings";
import { logActivity } from "@/server/services/activity";
import { lockedFieldKeys, siteSettingsSchema, type SiteSettings } from "@/content/settings";
import { passwordInput } from "@/lib/validation/admin";

const sections = ["brand", "contact", "social", "cta", "form", "tracking", "seo", "footer"] as const;
type Section = (typeof sections)[number];
const labels: Record<Section, string> = {
  brand: "الهوية",
  contact: "بيانات التواصل",
  social: "السوشيال ميديا",
  cta: "أزرار الدعوة",
  form: "نموذج الطلب",
  tracking: "التتبع",
  seo: "SEO الافتراضي",
  footer: "الفوتر",
};

export async function saveSettingsSection(section: Section, value: unknown) {
  return runAction({ role: "admin", tags: [tags.settings, tags.media] }, async (user) => {
    const s = z.enum(sections).parse(section);
    const current = await getSettings();
    const next = { ...current, [s]: value } as SiteSettings;
    // Locked form fields (name, whatsapp) must stay enabled and required.
    if (s === "form") {
      next.form.fields = next.form.fields.map((f) => (lockedFieldKeys.includes(f.key as never) ? { ...f, enabled: true, required: true } : f));
      for (const key of lockedFieldKeys) {
        if (!next.form.fields.some((f) => f.key === key)) throw new z.ZodError([{ code: "custom", path: ["form", "fields"], message: "locked", input: key }]);
      }
    }
    // Validate the whole document, but report errors relative to the section.
    const parsed = siteSettingsSchema.safeParse(next);
    if (!parsed.success) {
      throw new z.ZodError(parsed.error.issues.map((i) => ({ ...i, path: i.path[0] === s ? i.path.slice(1) : i.path })));
    }
    await saveSettings(parsed.data);
    await logActivity({ userId: user.id, action: "update", entityType: "settings", entityId: s, summary: `الإعدادات: ${labels[s]}` });
  });
}

export async function changePasswordAction(input: unknown) {
  return runAction({}, async (user) => {
    const data = passwordInput.parse(input);
    try {
      await auth.api.changePassword({
        body: { currentPassword: data.currentPassword, newPassword: data.newPassword, revokeOtherSessions: true },
        headers: await headers(),
      });
    } catch {
      throw new z.ZodError([{ code: "custom", path: ["currentPassword"], message: "wrong_password", input: "" }]);
    }
    await logActivity({ userId: user.id, action: "update", entityType: "user", entityId: user.id, summary: "تغيير كلمة المرور" });
  });
}

export async function updateProfileAction(input: unknown) {
  return runAction({}, async (user) => {
    const { name } = z.object({ name: z.string().trim().min(2, "required").max(80) }).parse(input);
    await db.update(userTable).set({ name, updatedAt: new Date() }).where(eq(userTable.id, user.id));
  });
}

// ─── Users (admins only) ────────────────────────────────────
const newUserInput = z.object({
  name: z.string().trim().min(2, "required").max(80),
  email: z.email("email").trim().toLowerCase(),
  role: z.enum(["admin", "editor"]),
  password: z.string().min(10, "min10").max(128),
});

export async function createUserAction(input: unknown) {
  return runAction({ role: "admin" }, async (actor) => {
    const data = newUserInput.parse(input);
    const [exists] = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, data.email));
    if (exists) throw new z.ZodError([{ code: "custom", path: ["email"], message: "duplicate", input: data.email }]);
    const id = randomUUID();
    await db.transaction(async (tx) => {
      await tx.insert(userTable).values({ id, name: data.name, email: data.email, emailVerified: true, role: data.role });
      await tx.insert(account).values({ id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: await hashPassword(data.password) });
    });
    await logActivity({ userId: actor.id, action: "create", entityType: "user", entityId: id, summary: `إضافة مستخدم: ${data.email}` });
  });
}

export async function setUserRoleAction(id: string, role: "admin" | "editor") {
  return runAction({ role: "admin" }, async (actor) => {
    const uid = z.string().min(1).parse(id);
    if (uid === actor.id) throw new z.ZodError([{ code: "custom", path: ["role"], message: "self", input: role }]);
    const [row] = await db.update(userTable).set({ role: z.enum(["admin", "editor"]).parse(role) }).where(eq(userTable.id, uid)).returning();
    if (!row) throw new NotFoundError();
  });
}

export async function deleteUserAction(id: string) {
  return runAction({ role: "admin" }, async (actor) => {
    const uid = z.string().min(1).parse(id);
    if (uid === actor.id) throw new z.ZodError([{ code: "custom", path: ["id"], message: "self", input: id }]);
    const [row] = await db.delete(userTable).where(and(eq(userTable.id, uid), ne(userTable.id, actor.id))).returning();
    if (!row) throw new NotFoundError();
    await db.delete(session).where(eq(session.userId, uid));
    await logActivity({ userId: actor.id, action: "delete", entityType: "user", entityId: uid, summary: `حذف مستخدم: ${row.email}` });
  });
}
