import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db } from "@/server/db";
import { categories, projectCategories, projects } from "@/server/db/schema";
import { mediaFor } from "@/server/admin/common";
import { PageHeader } from "@/components/admin/shell";
import { buttonClasses } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { WorkList } from "./work-list";
import { CategoriesManager } from "./categories-manager";

export const metadata: Metadata = { title: "الأعمال" };

export default async function WorkAdminPage() {
  const [rows, cats, links] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.createdAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(projectCategories),
  ]);
  const media = await mediaFor(rows.map((r) => r.coverMediaId));
  const items = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title.ar || p.title.en,
    industry: p.industry.ar,
    status: p.status,
    isFeatured: p.isFeatured,
    isConcept: p.isConcept,
    hasCaseStudy: p.hasCaseStudy,
    hasResults: Boolean(p.results.ar || p.results.en),
    cover: p.coverMediaId ? media[p.coverMediaId] ?? null : null,
    categories: links.filter((l) => l.projectId === p.id).map((l) => cats.find((c) => c.id === l.categoryId)?.name.ar).filter(Boolean) as string[],
  }));
  const usage = Object.fromEntries(cats.map((c) => [c.id, links.filter((l) => l.categoryId === c.id).length]));

  return (
    <>
      <PageHeader
        title="الأعمال ودراسات الحالة"
        description="أضف مشاريعك وانشرها. فعّل «دراسة حالة» في أي مشروع لعرضه بالتفصيل الكامل. اسحب لتغيير الترتيب في الموقع."
        actions={
          <Link href="/admin/work/new" className={buttonClasses("primary", "md")}>
            <PlusIcon size={18} /> مشروع جديد
          </Link>
        }
      />
      <WorkList items={items} />
      <div className="mt-10">
        <CategoriesManager categories={cats.map((c) => ({ id: c.id, slug: c.slug, name: c.name, visible: c.visible, count: usage[c.id] ?? 0 }))} />
      </div>
    </>
  );
}
