import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/server/db";
import { projects, testimonials } from "@/server/db/schema";
import { mediaFor } from "@/server/admin/common";
import { pick } from "@/lib/i18n";
import { PageHeader } from "@/components/admin/shell";
import { TestimonialsManager } from "./manager";

export const metadata: Metadata = { title: "آراء العملاء" };

export default async function TestimonialsAdminPage() {
  const [rows, projs] = await Promise.all([
    db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)),
    db.select({ id: projects.id, title: projects.title }).from(projects).orderBy(asc(projects.sortOrder)),
  ]);
  const media = await mediaFor(rows.map((r) => r.photoMediaId));
  return (
    <>
      <PageHeader title="آراء العملاء" description="الآراء المنشورة تظهر في الرئيسية وصفحة الآراء. المسودات لا تظهر لأي زائر." />
      <TestimonialsManager
        projects={projs.map((p) => ({ value: p.id, label: pick(p.title, "ar") }))}
        rows={rows.map((t) => {
          const photo = t.photoMediaId ? media[t.photoMediaId] ?? null : null;
          return {
            id: t.id,
            title: t.name,
            subtitle: t.quote.ar.slice(0, 80),
            thumb: photo,
            visible: t.status === "published",
            badges: t.rating ? [{ label: "★".repeat(t.rating), tone: "orange" as const }] : [],
            value: {
              name: t.name,
              company: t.company,
              position: t.position,
              quote: t.quote,
              rating: t.rating,
              photo,
              projectId: t.projectId,
              published: t.status === "published",
            },
          };
        })}
      />
    </>
  );
}
