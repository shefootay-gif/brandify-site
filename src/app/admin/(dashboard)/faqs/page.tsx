import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { faqs, services } from "@/server/db/schema";
import { pick } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/shell";
import { FaqsManager } from "./manager";

export const metadata: Metadata = { title: "الأسئلة الشائعة" };

export default async function FaqsAdminPage({ searchParams }: PageProps<"/admin/faqs">) {
  const { service } = await searchParams;
  const svcs = await db.select({ id: services.id, title: services.title }).from(services).orderBy(asc(services.sortOrder));
  const active = typeof service === "string" && svcs.some((s) => s.id === service) ? service : null;
  const rows = await db
    .select()
    .from(faqs)
    .where(active ? eq(faqs.serviceId, active) : isNull(faqs.serviceId))
    .orderBy(asc(faqs.sortOrder));

  const tabs = [{ id: null as string | null, label: "أسئلة عامة" }, ...svcs.map((s) => ({ id: s.id as string | null, label: pick(s.title, "ar") }))];

  return (
    <>
      <PageHeader title="الأسئلة الشائعة" description="الأسئلة العامة تظهر في الرئيسية وصفحة التواصل، وأسئلة كل خدمة تظهر في صفحتها." />
      <nav aria-label="مجموعات الأسئلة" className="-mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {tabs.map((t) => (
          <Link
            key={t.id ?? "general"}
            href={t.id ? `/admin/faqs?service=${t.id}` : "/admin/faqs"}
            aria-current={active === t.id ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium",
              active === t.id ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-navy-900 hover:border-navy-600/40",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <FaqsManager
        key={active ?? "general"}
        defaultService={active}
        services={svcs.map((s) => ({ value: s.id, label: pick(s.title, "ar") }))}
        rows={rows.map((f) => ({
          id: f.id,
          title: f.question.ar || f.question.en,
          visible: f.visible,
          badges: f.showOnHome && !f.serviceId ? [{ label: "في الرئيسية", tone: "info" as const }] : [],
          value: { question: f.question, answer: f.answer, serviceId: f.serviceId, showOnHome: f.showOnHome, visible: f.visible },
        }))}
      />
    </>
  );
}
