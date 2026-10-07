import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { pad2 } from "@/lib/utils";
import { getMessages } from "@/messages";
import { getSiteChrome } from "@/server/services/site";
import { getPublicFaqs, getPublicProjects } from "@/server/services/catalog";
import { PageHero, SectionHeading } from "@/components/site/section";
import { Glyph } from "@/components/site/glyphs";
import { WhatsAppLink } from "@/components/site/whatsapp-link";
import { ProjectCard } from "@/components/site/project-card";
import { FaqList } from "@/components/site/faq-list";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { buttonClasses } from "@/components/ui/button";
import { ArrowIcon, CheckIcon } from "@/components/ui/icons";
import { Picture } from "@/components/ui/picture";

async function load(locale: Locale, slug: string) {
  const { services } = await getSiteChrome();
  return services.find((s) => s.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [{ settings, ogImage }, service] = await Promise.all([getSiteChrome(), load(locale, slug)]);
  if (!service) return {};
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    settings,
    title: pick(service.seoTitle, locale) || pick(service.title, locale),
    description: pick(service.seoDescription, locale) || pick(service.shortDescription, locale),
    image: service.cover,
    fallbackImage: ogImage,
  });
}

export default async function ServicePage({ params }: PageProps<"/[locale]/services/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const service = await load(locale, slug);
  if (!service) notFound();

  const t = getMessages(locale);
  const [{ settings, services }, projects, faqs] = await Promise.all([
    getSiteChrome(),
    getPublicProjects(),
    getPublicFaqs({ serviceId: service.id }),
  ]);
  const title = pick(service.title, locale);
  const waMessage = pick(service.whatsappMessage, locale) || pick(settings.cta.whatsappMessage, locale);
  const related = projects.filter((p) => p.serviceIds.includes(service.id)).slice(0, 3);
  const others = services.filter((s) => s.id !== service.id);
  const faqItems = faqs.map((f) => ({ id: f.id, q: pick(f.question, locale), a: pick(f.answer, locale) }));

  return (
    <>
      <PageHero eyebrow={t.sections.services} title={title} subtitle={pick(service.shortDescription, locale)}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WhatsAppLink
            number={settings.contact.whatsapp}
            message={waMessage}
            label={pick(service.ctaLabel, locale) || pick(settings.cta.whatsappLabel, locale)}
            cta={`service-hero:${service.slug}`}
            size="lg"
            magnetic
          />
          <Link href={`${href(locale, "/start-project")}?service=${service.id}`} className={buttonClasses("outline-light", "lg")}>
            {pick(settings.cta.formLabel, locale)}
          </Link>
        </div>
      </PageHero>

      {/* Intro + what's included */}
      <section className="section-y">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]" data-reveal>
              <Glyph name={service.icon} size={56} className="text-orange-500" />
              <p className="mt-8 text-xl leading-relaxed text-navy-900">{pick(service.body, locale)}</p>
              {service.cover && (
                <div className="shape-bubble mt-10 aspect-[4/3] overflow-hidden">
                  <Picture media={service.cover} locale={locale} sizes="(min-width: 1024px) 40vw, 100vw" />
                </div>
              )}
            </div>
          </div>
          {service.subServices.length > 0 && (
            <div className="lg:col-span-7">
              <h2 className="t-eyebrow mb-6 text-orange-700">{t.sections.whatsIncluded}</h2>
              <ol className="border-t border-line">
                {service.subServices.map((sub, i) => (
                  <li key={i} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-7" data-reveal style={{ ["--reveal-i" as string]: i % 3 }}>
                    <span className="t-latin pt-1 text-sm text-ink-400">{pad2(i + 1)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-navy-900">{pick(sub.title, locale)}</h3>
                      <p className="mt-2 text-ink-600">{pick(sub.description, locale)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* Benefits + deliverables */}
      {(service.benefits.length > 0 || service.deliverables.length > 0) && (
        <section className="section-y bg-white">
          <div className="container-x grid gap-16 lg:grid-cols-12">
            {service.benefits.length > 0 && (
              <div className="lg:col-span-7">
                <SectionHeading eyebrow={t.sections.benefits} title={title} />
                <div className="mt-10 grid gap-8 sm:grid-cols-2">
                  {service.benefits.map((b, i) => (
                    <div key={i} data-reveal style={{ ["--reveal-i" as string]: i % 2 }}>
                      <span aria-hidden="true" className="block h-0.5 w-10 bg-orange-500" />
                      <h3 className="mt-5 text-xl font-bold text-navy-900">{pick(b.title, locale)}</h3>
                      <p className="mt-2 text-ink-600">{pick(b.description, locale)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {service.deliverables.length > 0 && (
              <div className="lg:col-span-5">
                <div className="shape-bubble bg-navy-900 p-8 text-white md:p-10" data-surface="dark" data-reveal>
                  <h2 className="t-eyebrow text-orange-500">{t.sections.deliverables}</h2>
                  <ul className="mt-6 space-y-4">
                    {service.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckIcon size={20} className="mt-1 shrink-0 text-orange-500" />
                        <span>{pick(d, locale)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Process */}
      {service.process.length > 0 && (
        <section className="section-y">
          <div className="container-x">
            <SectionHeading eyebrow={t.sections.process} title={t.nav.process} />
            <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {service.process.map((p, i) => (
                <li key={i} className="bg-paper p-7" data-reveal style={{ ["--reveal-i" as string]: i }}>
                  <span className="t-latin text-4xl font-extralight text-orange-600">{pad2(i + 1)}</span>
                  <h3 className="mt-4 text-lg font-bold text-navy-900">{pick(p.title, locale)}</h3>
                  <p className="mt-2 text-ink-600">{pick(p.description, locale)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section-y bg-white">
          <div className="container-x">
            <SectionHeading eyebrow={t.nav.work} title={t.sections.relatedWork} />
            <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={i}
                  locale={locale}
                  conceptLabel={t.common.concept}
                  caseStudyLabel={t.common.caseStudy}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {faqItems.length > 0 && (
        <section className="section-y">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow={t.sections.faq} title={title} />
            </div>
            <div className="lg:col-span-8">
              <FaqList items={faqItems} />
            </div>
          </div>
          <JsonLd data={faqJsonLd(faqItems)} />
        </section>
      )}

      {others.length > 0 && (
        <section className="border-t border-line py-16">
          <div className="container-x">
            <h2 className="t-eyebrow mb-6 text-ink-600">{t.sections.otherServices}</h2>
            <ul className="flex flex-wrap gap-3">
              {others.map((s) => (
                <li key={s.id}>
                  <Link
                    href={href(locale, `/services/${s.slug}`)}
                    className="group inline-flex items-center gap-2.5 rounded-full border border-line bg-white px-5 py-3 font-semibold text-navy-900 transition-colors hover:border-orange-500"
                  >
                    <Glyph name={s.icon} size={20} className="text-orange-600" />
                    {pick(s.title, locale)}
                    <ArrowIcon size={16} className="flip-rtl transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand
        locale={locale}
        settings={settings}
        title={pick(service.ctaLabel, locale) || title}
        subtitle={pick(service.shortDescription, locale)}
        message={waMessage}
        cta={`service-final:${service.slug}`}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: title,
          description: pick(service.shortDescription, locale),
          serviceType: title,
          provider: { "@id": `${absoluteUrl("/")}#organization` },
          areaServed: { "@type": "Country", name: "Egypt" },
          url: absoluteUrl(href(locale, `/services/${service.slug}`)),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: href(locale) },
          { name: t.nav.services, path: href(locale, "/services") },
          { name: title, path: href(locale, `/services/${service.slug}`) },
        ])}
      />
    </>
  );
}
