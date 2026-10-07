import type { Metadata } from "next";
import Link from "next/link";
import { desc, ilike, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { leads, projects, services } from "@/server/db/schema";
import { formatDate, pick } from "@/lib/i18n";
import { leadStatusMeta } from "@/lib/lead-status";
import { PageHeader } from "@/components/admin/shell";
import { Badge, Card, EmptyState } from "@/components/admin/fields";
import { SearchIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "بحث" };

export default async function SearchPage({ searchParams }: PageProps<"/admin/search">) {
  const { q: raw } = await searchParams;
  const q = typeof raw === "string" ? raw.trim().slice(0, 100) : "";
  if (!q) return <EmptyState icon={<SearchIcon size={30} />} title="اكتب كلمة للبحث" body="ابحث في الطلبات والمشاريع والخدمات من شريط البحث بالأعلى." />;

  const term = `%${q.replace(/[%_]/g, "")}%`;
  const [leadRows, projectRows, serviceRows] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(or(ilike(leads.name, term), ilike(leads.company, term), ilike(leads.whatsapp, term), ilike(leads.email, term), ilike(leads.message, term)))
      .orderBy(desc(leads.createdAt))
      .limit(20),
    db
      .select({ id: projects.id, title: projects.title, status: projects.status })
      .from(projects)
      .where(or(sql`${projects.title}->>'ar' ilike ${term}`, sql`${projects.title}->>'en' ilike ${term}`, ilike(projects.clientName, term), ilike(projects.slug, term)))
      .limit(20),
    db
      .select({ id: services.id, title: services.title })
      .from(services)
      .where(or(sql`${services.title}->>'ar' ilike ${term}`, sql`${services.title}->>'en' ilike ${term}`, ilike(services.slug, term)))
      .limit(20),
  ]);
  const total = leadRows.length + projectRows.length + serviceRows.length;

  return (
    <>
      <PageHeader title={`نتائج البحث عن «${q}»`} description={`${total} نتيجة`} />
      {total === 0 ? (
        <EmptyState icon={<SearchIcon size={30} />} title="لا توجد نتائج" body="جرّب كلمة أخرى أو جزءًا من الاسم أو الرقم." />
      ) : (
        <div className="space-y-6">
          {leadRows.length > 0 && (
            <Card title={`الطلبات (${leadRows.length})`}>
              <ul className="-my-2 divide-y divide-line">
                {leadRows.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/leads/${l.id}`} className="flex flex-wrap items-center gap-3 py-2.5 hover:text-orange-700">
                      <span className="flex-1 font-semibold">{l.name}</span>
                      <span className="t-latin text-sm text-ink-600" dir="ltr">{l.whatsapp}</span>
                      <Badge tone={leadStatusMeta[l.status].tone}>{leadStatusMeta[l.status].label}</Badge>
                      <span className="text-xs text-ink-600">{formatDate(l.createdAt, "ar")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {projectRows.length > 0 && (
            <Card title={`المشاريع (${projectRows.length})`}>
              <ul className="-my-2 divide-y divide-line">
                {projectRows.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/work/${p.id}`} className="flex items-center gap-3 py-2.5 hover:text-orange-700">
                      <span className="flex-1 font-semibold">{pick(p.title, "ar")}</span>
                      <Badge tone={p.status === "published" ? "success" : "neutral"}>{p.status === "published" ? "منشور" : "مسودة"}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {serviceRows.length > 0 && (
            <Card title={`الخدمات (${serviceRows.length})`}>
              <ul className="-my-2 divide-y divide-line">
                {serviceRows.map((s) => (
                  <li key={s.id}>
                    <Link href={`/admin/services/${s.id}`} className="block py-2.5 font-semibold hover:text-orange-700">
                      {pick(s.title, "ar")}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
