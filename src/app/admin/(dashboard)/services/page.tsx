import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/server/db";
import { services } from "@/server/db/schema";
import { PageHeader } from "@/components/admin/shell";
import { buttonClasses } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { ServicesList } from "./services-list";

export const metadata: Metadata = { title: "الخدمات" };

export default async function ServicesAdminPage() {
  const rows = await db.select().from(services).orderBy(asc(services.sortOrder));
  return (
    <>
      <PageHeader
        title="الخدمات"
        description="كل خدمة لها صفحة خاصة في الموقع. الترتيب هنا هو ترتيبها في الموقع والقوائم."
        actions={
          <Link href="/admin/services/new" className={buttonClasses("primary", "md")}>
            <PlusIcon size={18} /> خدمة جديدة
          </Link>
        }
      />
      <ServicesList
        items={rows.map((s) => ({ id: s.id, slug: s.slug, icon: s.icon, title: s.title.ar, titleEn: s.title.en, visible: s.visible, subCount: s.subServices.length }))}
      />
    </>
  );
}
