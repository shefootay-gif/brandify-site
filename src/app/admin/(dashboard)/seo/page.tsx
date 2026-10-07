import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/server/db";
import { seoEntries } from "@/server/db/schema";
import { mediaFor } from "@/server/admin/common";
import { getSettings } from "@/server/services/settings";
import { seoRouteKeys } from "@/lib/validation/admin";
import { siteUrl } from "@/lib/seo";
import { pick } from "@/lib/i18n";
import { getMessages } from "@/messages";
import { PageHeader } from "@/components/admin/shell";
import { InfoIcon } from "@/components/ui/icons";
import { SeoEditor, type SeoRow } from "./seo-editor";

export const metadata: Metadata = { title: "SEO" };

export default async function SeoAdminPage() {
  const [rows, settings] = await Promise.all([db.select().from(seoEntries), getSettings()]);
  const media = await mediaFor(rows.map((r) => r.ogImageId));
  const t = getMessages("ar");
  const meta: Record<(typeof seoRouteKeys)[number], { label: string; path: string; title: string }> = {
    home: { label: "الرئيسية", path: "", title: pick(settings.seo.defaultTitle, "ar") },
    services: { label: "الخدمات", path: "/services", title: t.nav.services },
    work: { label: "الأعمال", path: "/work", title: t.work.title },
    "case-studies": { label: "دراسات الحالة", path: "/case-studies", title: t.work.caseStudiesTitle },
    about: { label: "من نحن", path: "/about", title: t.nav.about },
    process: { label: "طريقة العمل", path: "/process", title: t.nav.process },
    contact: { label: "تواصل معنا", path: "/contact", title: t.contact.title },
    "start-project": { label: "ابدأ مشروعك", path: "/start-project", title: t.contact.startTitle },
    testimonials: { label: "آراء العملاء", path: "/testimonials", title: t.testimonials.title },
  };
  const template = pick(settings.seo.titleTemplate, "ar") || "%s";
  const items: SeoRow[] = seoRouteKeys.map((key) => {
    const r = rows.find((x) => x.routeKey === key);
    const m = meta[key];
    return {
      routeKey: key,
      label: m.label,
      path: m.path,
      title: r?.title ?? { ar: "", en: "" },
      description: r?.description ?? { ar: "", en: "" },
      ogImage: r?.ogImageId ? media[r.ogImageId] ?? null : null,
      noindex: r?.noindex ?? false,
      fallbackTitle: key === "home" ? m.title : template.replace("%s", m.title),
      fallbackDescription: pick(settings.seo.defaultDescription, "ar"),
    };
  });

  return (
    <>
      <PageHeader title="SEO" description="عناوين وأوصاف الصفحات في جوجل وصور المشاركة. صفحات الخدمات والمشاريع لها إعدادات SEO داخل كل خدمة ومشروع." />
      <div className="mb-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-line bg-white p-4 text-sm">
        <InfoIcon size={20} className="shrink-0 text-info" />
        <div>
          <p className="text-navy-900">
            الإعدادات الافتراضية (قالب العنوان، الوصف العام، صورة المشاركة العامة) في{" "}
            <Link href="/admin/settings?tab=seo" className="font-semibold text-orange-700 hover:underline">
              الإعدادات ← SEO
            </Link>
            .
          </p>
          <p className="mt-1 text-ink-600">
            خريطة الموقع تتحدث تلقائيًا:{" "}
            <a href="/sitemap.xml" target="_blank" rel="noopener" className="t-latin font-semibold text-orange-700 hover:underline" dir="ltr">
              /sitemap.xml
            </a>
          </p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {items.map((row) => (
          <SeoEditor key={row.routeKey} row={row} siteUrl={siteUrl()} />
        ))}
      </div>
    </>
  );
}
