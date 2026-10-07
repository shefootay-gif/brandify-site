import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { href, isLocale, pick } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { pad2 } from "@/lib/utils";
import { getMessages } from "@/messages";
import { getBlock } from "@/server/services/settings";
import { getSiteChrome } from "@/server/services/site";
import { getSeoEntry } from "@/server/services/catalog";
import { PageHero } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";

export async function generateMetadata({ params }: PageProps<"/[locale]/process">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [{ settings, ogImage }, seo, process] = await Promise.all([getSiteChrome(), getSeoEntry("process"), getBlock("process")]);
  return buildMetadata({
    locale,
    path: "/process",
    settings,
    title: pick(seo?.title, locale) || pick(process.title, locale),
    description: pick(seo?.description, locale) || pick(process.subtitle, locale),
    image: seo?.ogImage,
    fallbackImage: ogImage,
    noindex: seo?.noindex,
  });
}

export default async function ProcessPage({ params }: PageProps<"/[locale]/process">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const [{ settings }, process, home] = await Promise.all([getSiteChrome(), getBlock("process"), getBlock("home")]);

  return (
    <>
      <PageHero eyebrow={t.nav.process} title={pick(process.title, locale)} subtitle={pick(process.subtitle, locale)} />

      <section className="section-y">
        <div className="container-x">
          <ol className="relative mx-auto max-w-4xl">
            <span aria-hidden="true" className="absolute inset-y-4 start-6 w-px bg-line md:start-10" />
            {process.steps.map((step, i) => (
              <li key={i} className="relative grid grid-cols-[3rem_1fr] gap-6 pb-14 last:pb-0 md:grid-cols-[5rem_1fr] md:gap-10 md:pb-20" data-reveal>
                <span className="t-latin relative z-[1] inline-flex size-12 items-center justify-center rounded-full bg-navy-900 font-semibold text-white md:size-20 md:text-2xl">
                  {pad2(i + 1)}
                </span>
                <div className="pt-2 md:pt-5">
                  <h2 className="t-h2 text-navy-900">{pick(step.title, locale)}</h2>
                  <p className="mt-4 max-w-2xl text-lg text-ink-600">{pick(step.description, locale)}</p>
                </div>
              </li>
            ))}
          </ol>
          {pick(process.promise, locale) && (
            <p className="shape-bubble mx-auto mt-20 max-w-3xl bg-orange-50 p-8 text-center text-xl font-semibold text-navy-900 md:p-10" data-reveal>
              {pick(process.promise, locale)}
            </p>
          )}
        </div>
      </section>

      <CtaBand
        locale={locale}
        settings={settings}
        title={pick(home.finalCta.title, locale)}
        subtitle={pick(home.finalCta.subtitle, locale)}
        cta="process-final"
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: href(locale) },
          { name: t.nav.process, path: href(locale, "/process") },
        ])}
      />
    </>
  );
}
