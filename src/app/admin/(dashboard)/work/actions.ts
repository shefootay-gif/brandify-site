"use server";

import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { categories, projectCategories, projectMedia, projects, projectServices } from "@/server/db/schema";
import { runAction, NotFoundError } from "@/server/admin/action";
import { reorderRows } from "@/server/admin/common";
import { tags } from "@/server/cache";
import { logActivity } from "@/server/services/activity";
import { sanitizeLocalizedHtml } from "@/server/sanitize";
import { categoryInput, projectInput, reorderInput } from "@/lib/validation/admin";
import { pick } from "@/lib/i18n";

const projectTags = [tags.projects, tags.categories, tags.testimonials];

export async function saveProjectAction(id: string | null, input: unknown) {
  return runAction({ tags: projectTags }, async (user) => {
    const data = projectInput.parse(input);
    const values = {
      slug: data.slug,
      title: data.title,
      clientName: data.clientName,
      industry: data.industry,
      summary: data.summary,
      description: sanitizeLocalizedHtml(data.description),
      challenge: data.challenge,
      solution: data.solution,
      results: data.results,
      tools: data.tools,
      tags: data.tags,
      year: data.year,
      isConcept: data.isConcept,
      isFeatured: data.isFeatured,
      hasCaseStudy: data.hasCaseStudy,
      caseStudy: data.caseStudy,
      accentColor: data.accentColor,
      coverMediaId: data.coverMediaId,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      status: data.status,
    };

    const savedId = await db.transaction(async (tx) => {
      let pid = id;
      if (pid) {
        const [prev] = await tx.select({ status: projects.status, publishedAt: projects.publishedAt }).from(projects).where(eq(projects.id, pid));
        if (!prev) throw new NotFoundError();
        await tx
          .update(projects)
          .set({ ...values, publishedAt: data.status === "published" ? prev.publishedAt ?? new Date() : prev.publishedAt })
          .where(eq(projects.id, pid));
      } else {
        const [row] = await tx
          .insert(projects)
          .values({ ...values, publishedAt: data.status === "published" ? new Date() : null, sortOrder: 0 })
          .returning({ id: projects.id });
        pid = row!.id;
      }
      await tx.delete(projectCategories).where(eq(projectCategories.projectId, pid));
      await tx.delete(projectServices).where(eq(projectServices.projectId, pid));
      await tx.delete(projectMedia).where(eq(projectMedia.projectId, pid));
      if (data.categoryIds.length) await tx.insert(projectCategories).values(data.categoryIds.map((categoryId) => ({ projectId: pid!, categoryId })));
      if (data.serviceIds.length) await tx.insert(projectServices).values(data.serviceIds.map((serviceId) => ({ projectId: pid!, serviceId })));
      if (data.gallery.length)
        await tx.insert(projectMedia).values(data.gallery.map((g, i) => ({ projectId: pid!, mediaId: g.mediaId, caption: g.caption, sortOrder: i })));
      return pid!;
    });

    await logActivity({
      userId: user.id,
      action: id ? "update" : "create",
      entityType: "project",
      entityId: savedId,
      summary: `${id ? "تعديل" : "إضافة"} مشروع: ${pick(data.title, "ar")}`,
    });
    return { id: savedId };
  });
}

export async function deleteProjectAction(id: string) {
  return runAction({ tags: projectTags }, async (user) => {
    const [row] = await db.delete(projects).where(eq(projects.id, z.uuid().parse(id))).returning();
    if (!row) throw new NotFoundError();
    await logActivity({ userId: user.id, action: "delete", entityType: "project", entityId: id, summary: `حذف مشروع: ${pick(row.title, "ar")}` });
  });
}

export async function setProjectFlagAction(id: string, flag: "status" | "featured", value: boolean) {
  return runAction({ tags: projectTags }, async (user) => {
    const pid = z.uuid().parse(id);
    const [row] =
      flag === "status"
        ? await db
            .update(projects)
            .set({ status: value ? "published" : "draft", ...(value ? { publishedAt: new Date() } : {}) })
            .where(eq(projects.id, pid))
            .returning()
        : await db.update(projects).set({ isFeatured: value }).where(eq(projects.id, pid)).returning();
    if (!row) throw new NotFoundError();
    if (flag === "status")
      await logActivity({ userId: user.id, action: value ? "publish" : "unpublish", entityType: "project", entityId: pid, summary: `${value ? "نشر" : "إخفاء"} مشروع: ${pick(row.title, "ar")}` });
  });
}

export async function reorderProjectsAction(ids: string[]) {
  return runAction({ tags: [tags.projects] }, async () => reorderRows(projects, reorderInput.parse(ids)));
}

export async function slugAvailableAction(slug: string, excludeId: string | null) {
  return runAction({}, async () => {
    const [row] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.slug, slug), excludeId ? ne(projects.id, excludeId) : undefined));
    return !row;
  });
}

// ─── Categories ─────────────────────────────────────────────
export async function saveCategoryAction(id: string | null, input: unknown) {
  return runAction({ tags: [tags.categories, tags.projects] }, async (user) => {
    const data = categoryInput.parse(input);
    if (id) {
      const [row] = await db.update(categories).set(data).where(eq(categories.id, z.uuid().parse(id))).returning();
      if (!row) throw new NotFoundError();
    } else {
      const existing = await db.select({ id: categories.id }).from(categories);
      await db.insert(categories).values({ ...data, sortOrder: existing.length });
    }
    await logActivity({ userId: user.id, action: id ? "update" : "create", entityType: "category", summary: `تصنيف: ${data.name.ar}` });
  });
}

export async function deleteCategoryAction(id: string) {
  return runAction({ tags: [tags.categories, tags.projects] }, async () => {
    const [row] = await db.delete(categories).where(eq(categories.id, z.uuid().parse(id))).returning();
    if (!row) throw new NotFoundError();
  });
}

export async function reorderCategoriesAction(ids: string[]) {
  return runAction({ tags: [tags.categories] }, async () => reorderRows(categories, reorderInput.parse(ids)));
}
