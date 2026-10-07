import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/server/db";
import { clients } from "@/server/db/schema";
import { mediaFor } from "@/server/admin/common";
import { PageHeader } from "@/components/admin/shell";
import { ClientsManager } from "./manager";

export const metadata: Metadata = { title: "لوجوهات العملاء" };

export default async function ClientsAdminPage() {
  const rows = await db.select().from(clients).orderBy(asc(clients.sortOrder));
  const media = await mediaFor(rows.map((r) => r.logoMediaId));
  return (
    <>
      <PageHeader title="لوجوهات العملاء" description="تظهر في الرئيسية تحت «عملوا معنا» عندما يكون هناك لوجو واحد ظاهر على الأقل." />
      <ClientsManager
        rows={rows.map((c) => {
          const logo = c.logoMediaId ? media[c.logoMediaId] ?? null : null;
          return {
            id: c.id,
            title: c.name,
            subtitle: c.url ?? undefined,
            thumb: logo,
            visible: c.visible,
            badges: logo ? [] : [{ label: "بدون لوجو", tone: "warning" as const }],
            value: { name: c.name, logo, url: c.url ?? "", visible: c.visible },
          };
        })}
      />
    </>
  );
}
