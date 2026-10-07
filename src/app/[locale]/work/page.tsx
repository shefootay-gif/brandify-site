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

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/work">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { category } = await searchParams;
  const t = getMessages(locale);
  const [{ settings, ogImage }, seo] = await Promise.all([getSiteChrome(), getSeoEntry("work")]);
  return {
    ...buildMetadata({
      locale,
      path: "/work",
      settings,
      title: pick(seo?.title, locale) || t.work.title,
      description: pick(seo?.description, locale) || t.work.subtitle,
      image: seo?.ogImage,
      fallbackImage: ogImage,
      // Filtered views canonicalise to the main page.
      noindex: seo?.noindex || Boolean(category),
    }),
  };
}

export default async function WorkPage({ params, searchParams }: PageProps<"/[locale]/work">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { category } = await searchParams;
  const t = getMessages(locale);
  const [{ settings }, projects, categories, home] = await Promise.all([
    getSiteChrome(),
    getPublicProjects(),
    getPublicCategories(),
    getBlock("home"),
  ]);
  const active = typeof category === "string" && categories.some((c) => c.slug === category) ? category : null;

  return (
    <>
      <PageHero eyebrow={t.nav.work} title={t.work.title} subtitle={t.work.subtitle} />
      <section className="section-y !pt-10 md:!pt-14">
        <div className="container-x">
          <WorkTabs locale={locale} t={t} current="work" hasCaseStudies={projects.some((p) => p.hasCaseStudy)} />
          <WorkGrid
            locale={locale}
            t={t}
            projects={projects}
            categories={categories}
            active={active}
            basePath="/work"
            emptyText={t.work.emptyAll}
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
        cta="work-final"
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: href(locale) },
          { name: t.nav.work, path: href(locale, "/work") },
        ])}
      />
    </>
  );
}
