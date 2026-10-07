import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";
import { getPublicProjects, getPublicServices, getPublicTestimonials } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [services, projects, testimonials] = await Promise.all([
    getPublicServices(),
    getPublicProjects(),
    getPublicTestimonials(),
  ]);

  const paths: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/work", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/process", priority: 0.6 },
    { path: "/contact", priority: 0.8 },
    { path: "/start-project", priority: 0.7 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
    ...(projects.some((p) => p.hasCaseStudy) ? [{ path: "/case-studies", priority: 0.7 }] : []),
    ...(testimonials.length ? [{ path: "/testimonials", priority: 0.5 }] : []),
    ...services.map((s) => ({ path: `/services/${s.slug}`, priority: 0.8 })),
    ...projects.map((p) => ({ path: `/work/${p.slug}`, priority: 0.6 })),
  ];

  return paths.flatMap(({ path, priority }) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l === "ar" ? "ar-EG" : "en", `${base}/${l}${path}`])),
      },
    })),
  );
}
