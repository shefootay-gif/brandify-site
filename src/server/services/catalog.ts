import "server-only";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import {
  categories,
  clients,
  faqs,
  projectCategories,
  projectMedia,
  projectServices,
  projects,
  seoEntries,
  services,
  teamMembers,
  testimonials,
} from "@/server/db/schema";
import type { Localized } from "@/server/db/schema/types";
import { cached, tags } from "@/server/cache";
import { getMediaMap, type PublicMedia } from "./media";

// Public (cached) reads used by the website. Admin screens query directly.

export type ServiceRecord = typeof services.$inferSelect;
export type ProjectRecord = typeof projects.$inferSelect;
export type CategoryRecord = typeof categories.$inferSelect;

export const getPublicServices = cached(
  async () => {
    const rows = await db.select().from(services).where(eq(services.visible, true)).orderBy(asc(services.sortOrder));
    const mediaMap = await getMediaMap(rows.map((r) => r.coverMediaId));
    return rows.map((s) => ({ ...s, cover: s.coverMediaId ? mediaMap.get(s.coverMediaId) ?? null : null }));
  },
  "public:services",
  [tags.services, tags.media],
);
export type PublicService = Awaited<ReturnType<typeof getPublicServices>>[number];

export const getPublicCategories = cached(
  async () =>
    db.select().from(categories).where(eq(categories.visible, true)).orderBy(asc(categories.sortOrder)),
  "public:categories",
  [tags.categories],
);

export type ProjectCard = {
  id: string;
  slug: string;
  title: Localized;
  clientName: string;
  industry: Localized;
  summary: Localized;
  isConcept: boolean;
  isFeatured: boolean;
  hasCaseStudy: boolean;
  accentColor: string | null;
  cover: PublicMedia | null;
  categorySlugs: string[];
  serviceIds: string[];
};

export const getPublicProjects = cached(
  async (): Promise<ProjectCard[]> => {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(asc(projects.sortOrder), desc(projects.publishedAt));
    if (!rows.length) return [];
    const ids = rows.map((r) => r.id);
    const [cats, svcs, mediaMap] = await Promise.all([
      db
        .select({ projectId: projectCategories.projectId, slug: categories.slug })
        .from(projectCategories)
        .innerJoin(categories, eq(categories.id, projectCategories.categoryId))
        .where(inArray(projectCategories.projectId, ids)),
      db.select().from(projectServices).where(inArray(projectServices.projectId, ids)),
      getMediaMap(rows.map((r) => r.coverMediaId)),
    ]);
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      clientName: p.clientName,
      industry: p.industry,
      summary: p.summary,
      isConcept: p.isConcept,
      isFeatured: p.isFeatured,
      hasCaseStudy: p.hasCaseStudy,
      accentColor: p.accentColor,
      cover: p.coverMediaId ? mediaMap.get(p.coverMediaId) ?? null : null,
      categorySlugs: cats.filter((c) => c.projectId === p.id).map((c) => c.slug),
      serviceIds: svcs.filter((s) => s.projectId === p.id).map((s) => s.serviceId),
    }));
  },
  "public:projects",
  [tags.projects, tags.categories, tags.media],
);

export const getPublicProject = cached(
  async (slug: string) => {
    const [p] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, "published")));
    if (!p) return null;
    const [gallery, cats, svcs, quotes] = await Promise.all([
      db.select().from(projectMedia).where(eq(projectMedia.projectId, p.id)).orderBy(asc(projectMedia.sortOrder)),
      db
        .select({ slug: categories.slug, name: categories.name })
        .from(projectCategories)
        .innerJoin(categories, eq(categories.id, projectCategories.categoryId))
        .where(eq(projectCategories.projectId, p.id)),
      db
        .select({ id: services.id, slug: services.slug, title: services.title })
        .from(projectServices)
        .innerJoin(services, eq(services.id, projectServices.serviceId))
        .where(and(eq(projectServices.projectId, p.id), eq(services.visible, true))),
      db
        .select()
        .from(testimonials)
        .where(and(eq(testimonials.projectId, p.id), eq(testimonials.status, "published"))),
    ]);
    const mediaMap = await getMediaMap([p.coverMediaId, ...gallery.map((g) => g.mediaId), ...quotes.map((q) => q.photoMediaId)]);
    return {
      ...p,
      cover: p.coverMediaId ? mediaMap.get(p.coverMediaId) ?? null : null,
      gallery: gallery
        .map((g) => ({ id: g.id, caption: g.caption, media: mediaMap.get(g.mediaId) }))
        .filter((g): g is { id: string; caption: Localized; media: PublicMedia } => Boolean(g.media)),
      categories: cats,
      services: svcs,
      testimonials: quotes.map((q) => ({ ...q, photo: q.photoMediaId ? mediaMap.get(q.photoMediaId) ?? null : null })),
    };
  },
  "public:project",
  [tags.projects, tags.categories, tags.services, tags.testimonials, tags.media],
);

export const getPublicTestimonials = cached(
  async () => {
    const rows = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.status, "published"))
      .orderBy(asc(testimonials.sortOrder));
    const mediaMap = await getMediaMap(rows.map((r) => r.photoMediaId));
    return rows.map((t) => ({ ...t, photo: t.photoMediaId ? mediaMap.get(t.photoMediaId) ?? null : null }));
  },
  "public:testimonials",
  [tags.testimonials, tags.media],
);
export type PublicTestimonial = Awaited<ReturnType<typeof getPublicTestimonials>>[number];

export const getPublicClients = cached(
  async () => {
    const rows = await db.select().from(clients).where(eq(clients.visible, true)).orderBy(asc(clients.sortOrder));
    const mediaMap = await getMediaMap(rows.map((r) => r.logoMediaId));
    return rows
      .map((c) => ({ ...c, logo: c.logoMediaId ? mediaMap.get(c.logoMediaId) ?? null : null }))
      .filter((c) => c.logo);
  },
  "public:clients",
  [tags.clients, tags.media],
);

export const getPublicTeam = cached(
  async () => {
    const rows = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.visible, true))
      .orderBy(desc(teamMembers.isFounder), asc(teamMembers.sortOrder));
    const mediaMap = await getMediaMap(rows.flatMap((r) => [r.photoMediaId, r.videoMediaId]));
    return rows.map((m) => ({
      ...m,
      photo: m.photoMediaId ? mediaMap.get(m.photoMediaId) ?? null : null,
      video: m.videoMediaId ? mediaMap.get(m.videoMediaId) ?? null : null,
    }));
  },
  "public:team",
  [tags.team, tags.media],
);
export type PublicTeamMember = Awaited<ReturnType<typeof getPublicTeam>>[number];

export const getPublicFaqs = cached(
  async (scope: { home?: boolean; serviceId?: string; general?: boolean }) => {
    const where = and(
      eq(faqs.visible, true),
      scope.home ? eq(faqs.showOnHome, true) : undefined,
      scope.serviceId ? eq(faqs.serviceId, scope.serviceId) : undefined,
      scope.general ? isNull(faqs.serviceId) : undefined,
    );
    return db.select().from(faqs).where(where).orderBy(asc(faqs.sortOrder));
  },
  "public:faqs",
  [tags.faqs],
);

export const getMediaByIds = cached(
  async (ids: string[]) => {
    const map = await getMediaMap(ids);
    return ids.map((id) => map.get(id)).filter((m): m is PublicMedia => Boolean(m));
  },
  "public:media-by-ids",
  [tags.media],
);

export const getSeoEntry = cached(
  async (routeKey: string) => {
    const [row] = await db.select().from(seoEntries).where(eq(seoEntries.routeKey, routeKey));
    if (!row) return null;
    const mediaMap = await getMediaMap([row.ogImageId]);
    return { ...row, ogImage: row.ogImageId ? mediaMap.get(row.ogImageId) ?? null : null };
  },
  "public:seo",
  [tags.seo, tags.media],
);
