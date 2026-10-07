import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale, pick } from "@/lib/i18n";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { pad2 } from "@/lib/utils";
import { getMessages } from "@/messages";
import { getSiteChrome } from "@/server/services/site";
import { getBlock } from "@/server/services/settings";
import { getSeoEntry } from "@/server/services/catalog";
import { PageHero } from "@/components/site/section";
import { Glyph } from "@/components/site/glyphs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { ArrowIcon } from "@/components/ui/icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  const [{ settings, ogImage }, seo] = await Promise.all([getSiteChrome(), getSeoEntry("services")]);
  return buildMetadata({
    locale,
    path: "/services",
    settings,
    title: pick(seo?.title, locale) || t.nav.services,
    description: pick(seo?.description, locale) || undefined,
    image: seo?.ogImage,
    fallbackImage: ogImage,
    noindex: seo?.noindex,
  });
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const [{ settings, services }, home] = await Promise.all([getSiteChrome(), getBlock("home")]);

  return (
    <>
      <PageHero eyebrow={t.sections.services} title={t.sections.servicesTitle} subtitle={pick(home.pillars.subtitle, locale)} />

      <section className="section-y">
        <div className="container-x">
          <ol className="border-t border-line">
            {services.map((s, i) => (
              <li key={s.id} className="border-b border-line" data-reveal style={{ ["--reveal-i" as string]: i % 3 }}>
                <Link
                  href={href(locale, `/services/${s.slug}`)}
                  className="group grid gap-6 py-10 md:grid-cols-12 md:items-start md:gap-8 md:py-14"
                >
                  <div className="flex items-center gap-5 md:col-span-5">
                    <span className="t-latin w-8 text-sm font-medium text-ink-400">{pad2(i + 1)}</span>
                    <Glyph name={s.icon} size={40} className="shrink-0 text-navy-900 transition-colors duration-300 group-hover:text-orange-500" />
                    <h2 className="t-h3 text-navy-900 transition-colors group-hover:text-orange-700">{pick(s.title, locale)}</h2>
                  </div>
                  <div className="md:col-span-6">
                    <p className="text-lg text-ink-600">{pick(s.shortDescription, locale)}</p>
                    {s.subServices.length > 0 && (
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {s.subServices.map((sub, j) => (
                          <li key={j} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-navy-900">
                            {pick(sub.title, locale)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden size-12 items-center justify-center justify-self-end rounded-full border border-line text-navy-900 transition-all duration-300 group-hover:border-orange-500 group-hover:bg-orange-500 md:col-span-1 md:inline-flex"
                  >
                    <ArrowIcon size={20} className="flip-rtl" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand
        locale={locale}
        settings={settings}
        title={pick(home.finalCta.title, locale)}
        subtitle={pick(home.finalCta.subtitle, locale)}
        cta="services-index"
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: href(locale) },
          { name: t.nav.services, path: href(locale, "/services") },
        ])}
      />
    </>
  );
}
