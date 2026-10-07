import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { categories, projectCategories, projectMedia, projects, projectServices, services } from "@/server/db/schema";
import { mediaFor } from "@/server/admin/common";
import { pick } from "@/lib/i18n";
import type { ProjectFormValue } from "./project-form";

const L = () => ({ ar: "", en: "" });

export async function loadProjectOptions() {
  const [cats, svcs] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(services).orderBy(asc(services.sortOrder)),
  ]);
  return {
    categories: cats.map((c) => ({ value: c.id, label: pick(c.name, "ar") })),
    services: svcs.map((s) => ({ value: s.id, label: pick(s.title, "ar") })),
  };
}

export function emptyProject(): ProjectFormValue {
  return {
    slug: "",
    title: L(),
    clientName: "",
    industry: L(),
    summary: L(),
    description: L(),
    challenge: L(),
    solution: L(),
    results: L(),
    tools: [],
    tags: [],
    year: new Date().getFullYear(),
    isConcept: false,
    isFeatured: false,
    hasCaseStudy: false,
    caseStudy: { strategy: L(), creative: L(), execution: L() },
    accentColor: "navy",
    cover: null,
    seoTitle: L(),
    seoDescription: L(),
    status: "draft",
    categoryIds: [],
    serviceIds: [],
    gallery: [],
  };
}

export async function loadProject(id: string): Promise<ProjectFormValue | null> {
  const [p] = await db.select().from(projects).where(eq(projects.id, id));
  if (!p) return null;
  const [cats, svcs, gallery] = await Promise.all([
    db.select().from(projectCategories).where(eq(projectCategories.projectId, id)),
    db.select().from(projectServices).where(eq(projectServices.projectId, id)),
    db.select().from(projectMedia).where(eq(projectMedia.projectId, id)).orderBy(asc(projectMedia.sortOrder)),
  ]);
  const media = await mediaFor([p.coverMediaId, ...gallery.map((g) => g.mediaId)]);
  const theme = (["navy", "midnight", "ocean", "orange", "paper"] as const).find((t) => t === p.accentColor) ?? "navy";
  return {
    slug: p.slug,
    title: p.title,
    clientName: p.clientName,
    industry: p.industry,
    summary: p.summary,
    description: p.description,
    challenge: p.challenge,
    solution: p.solution,
    results: p.results,
    tools: p.tools,
    tags: p.tags,
    year: p.year,
    isConcept: p.isConcept,
    isFeatured: p.isFeatured,
    hasCaseStudy: p.hasCaseStudy,
    caseStudy: p.caseStudy ?? { strategy: L(), creative: L(), execution: L() },
    accentColor: theme,
    cover: p.coverMediaId ? media[p.coverMediaId] ?? null : null,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    status: p.status,
    categoryIds: cats.map((c) => c.categoryId),
    serviceIds: svcs.map((s) => s.serviceId),
    gallery: gallery.filter((g) => media[g.mediaId]).map((g) => ({ media: media[g.mediaId]!, caption: g.caption })),
  };
}
