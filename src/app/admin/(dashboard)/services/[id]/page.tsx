import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { faqs, services } from "@/server/db/schema";
import { mediaFor } from "@/server/admin/common";
import { PageHeader } from "@/components/admin/shell";
import { ServiceForm, type ServiceFormValue } from "../service-form";

export const metadata: Metadata = { title: "تعديل خدمة" };

const L = () => ({ ar: "", en: "" });

export default async function ServiceEditPage({ params }: PageProps<"/admin/services/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  let initial: ServiceFormValue = {
    slug: "",
    icon: "bubble",
    title: L(),
    shortDescription: L(),
    body: L(),
    subServices: [],
    benefits: [],
    deliverables: [],
    process: [],
    ctaLabel: L(),
    whatsappMessage: L(),
    cover: null,
    seoTitle: L(),
    seoDescription: L(),
    visible: true,
  };
  let faqCount = 0;

  if (!isNew) {
    const [s] = await db.select().from(services).where(eq(services.id, id));
    if (!s) notFound();
    const [media, [fc]] = await Promise.all([mediaFor([s.coverMediaId]), db.select({ n: count() }).from(faqs).where(eq(faqs.serviceId, id))]);
    faqCount = fc?.n ?? 0;
    initial = {
      slug: s.slug,
      icon: (["bubble", "play", "tag"] as const).find((x) => x === s.icon) ?? "bubble",
      title: s.title,
      shortDescription: s.shortDescription,
      body: s.body,
      subServices: s.subServices,
      benefits: s.benefits,
      deliverables: s.deliverables,
      process: s.process,
      ctaLabel: s.ctaLabel,
      whatsappMessage: s.whatsappMessage,
      cover: s.coverMediaId ? media[s.coverMediaId] ?? null : null,
      seoTitle: s.seoTitle,
      seoDescription: s.seoDescription,
      visible: s.visible,
    };
  }

  return (
    <>
      <PageHeader back={{ href: "/admin/services", label: "الخدمات" }} title={isNew ? "خدمة جديدة" : initial.title.ar} />
      <ServiceForm key={id} id={isNew ? null : id} initial={initial} faqCount={faqCount} />
    </>
  );
}
