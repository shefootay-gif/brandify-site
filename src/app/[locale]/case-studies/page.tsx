import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { href, isLocale, pick } from "@/lib/i18n";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getMessages } from "@/messages";
import { getSiteChrome } from "@/server/services/site";
import { getPublicCategories, getPublicProjects, getSeoEntry } from "@/server/services/catalog";
import { PageHero } from "@/components/site/section";
import { WorkGrid } from "@/components/site/work-grid";
import { WorkTabs } from "@/components/site/work-tabs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { getBlock } from "@/server/services/settings";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/case-studies">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { category } = await searchParams;
  const t = getMessages(locale);
  const [{ settings, ogImage }, seo, projects] = await Promise.all([getSiteChrome(), getSeoEntry("case-studies"), getPublicProjects()]);
  return buildMetadata({
    locale,
    path: "/case-studies",
    settings,
    title: pick(seo?.title, locale) || t.work.caseStudiesTitle,
    description: pick(seo?.description, locale) || t.work.caseStudiesSubtitle,
    image: seo?.ogImage,
    fallbackImage: ogImage,
    noindex: seo?.noindex || Boolean(category) || !projects.some((p) => p.hasCaseStudy),
  });
}

export default async function CaseStudiesPage({ params, searchParams }: PageProps<"/[locale]/case-studies">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { category } = await searchParams;
  const t = getMessages(locale);
  const [{ settings }, all, categories, home] = await Promise.all([
    getSiteChrome(),
    getPublicProjects(),
    getPublicCategories(),
    getBlock("home"),
  ]);
  const projects = all.filter((p) => p.hasCaseStudy);
  const active = typeof category === "string" && categories.some((c) => c.slug === category) ? category : null;

  return (
    <>
      <PageHero eyebrow={t.nav.work} title={t.work.caseStudiesTitle} subtitle={t.work.caseStudiesSubtitle} />
      <section className="section-y !pt-10 md:!pt-14">
        <div className="container-x">
          <WorkTabs locale={locale} t={t} current="case-studies" hasCaseStudies />
          <WorkGrid
            locale={locale}
            t={t}
            projects={projects}
            categories={categories}
            active={active}
            basePath="/case-studies"
            emptyText={t.work.caseStudiesEmpty}
            whatsapp={{
              number: settings.contact.whatsapp,
              message: pick(settings.cta.whatsappMessage, locale),
              label: pick(settings.cta.whatsappLabel, locale),
            }}
          />
        </div>
      </section>
      <CtaBand
        locale={locale}
        settings={settings}
        title={pick(home.finalCta.title, locale)}
        subtitle={pick(home.finalCta.subtitle, locale)}
        cta="case-studies-final"
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: href(locale) },
          { name: t.nav.caseStudies, path: href(locale, "/case-studies") },
        ])}
      />
    </>
  );
}
