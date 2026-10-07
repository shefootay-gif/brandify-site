import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale, pick } from "@/lib/i18n";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { getMessages } from "@/messages";
import { getBlock } from "@/server/services/settings";
import { getSiteChrome } from "@/server/services/site";
import {
  getMediaByIds,
  getPublicClients,
  getPublicFaqs,
  getPublicProjects,
  getPublicTeam,
  getPublicTestimonials,
  getSeoEntry,
} from "@/server/services/catalog";
import { HomeHero } from "@/components/home/hero";
import { ServicesTicker } from "@/components/home/services-ticker";
import { Pillars } from "@/components/home/pillars";
import { FeaturedWork } from "@/components/home/featured-work";
import { Industries } from "@/components/home/industries";
import { Reels } from "@/components/home/reels";
import { SectionHeading } from "@/components/site/section";
import { ProcessSteps } from "@/components/site/process-steps";
import { FounderSpotlight } from "@/components/site/founder";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { FaqList } from "@/components/site/faq-list";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Picture } from "@/components/ui/picture";
import { buttonClasses } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/icons";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [{ settings, ogImage }, seo] = await Promise.all([getSiteChrome(), getSeoEntry("home")]);
  return buildMetadata({
    locale,
    path: "/",
    settings,
    title: pick(seo?.title, locale) || undefined,
    description: pick(seo?.description, locale) || undefined,
    image: seo?.ogImage,
    fallbackImage: ogImage,
    noindex: seo?.noindex,
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);

  const [{ settings, services }, home, process, projects, testimonials, clients, team, faqs] = await Promise.all([
    getSiteChrome(),
    getBlock("home"),
    getBlock("process"),
    getPublicProjects(),
    getPublicTestimonials(),
    getPublicClients(),
    getPublicTeam(),
    getPublicFaqs({ home: true }),
  ]);
  const reels = home.reels.mediaIds.length ? await getMediaByIds(home.reels.mediaIds) : [];
  const founder = team.find((m) => m.isFounder && pick(m.name, locale));
  const faqItems = faqs.map((f) => ({ id: f.id, q: pick(f.question, locale), a: pick(f.answer, locale) }));

  return (
    <>
      <HomeHero content={home.hero} settings={settings} locale={locale} />
      <ServicesTicker services={services} locale={locale} />
      <Reels content={home.reels} items={reels} locale={locale} t={t} />
      <Pillars content={home.pillars} services={services} locale={locale} eyebrow={t.nav.services} />
      <FeaturedWork content={home.work} projects={projects} locale={locale} t={t} />
      <Industries content={home.industries} locale={locale} eyebrow={t.sections.industries} />

      <section data-surface="dark" className="section-y bg-navy-900">
        <div className="container-x">
          <SectionHeading
            tone="dark"
            eyebrow={t.nav.process}
            title={pick(home.process.title, locale)}
            subtitle={pick(home.process.subtitle, locale)}
            action={
              <Link href={href(locale, "/process")} className={buttonClasses("outline-light", "md", "group/p")}>
                {t.common.learnMore}
                <ArrowIcon size={18} className="flip-rtl transition-transform group-hover/p:translate-x-1 rtl:group-hover/p:-translate-x-1" />
              </Link>
            }
          />
          <div className="mt-14 md:mt-20">
            <ProcessSteps steps={process.steps} locale={locale} />
          </div>
        </div>
      </section>

      {founder && (
        <FounderSpotlight
          founder={founder}
          title={pick(home.founder.title, locale)}
          quote={pick(home.founder.quote, locale)}
          locale={locale}
          t={t}
        />
      )}

      {testimonials.length > 0 && (
        <section className="section-y bg-paper-2">
          <div className="container-x">
            <SectionHeading
              eyebrow={t.nav.testimonials}
              title={pick(home.testimonials.title, locale)}
              subtitle={pick(home.testimonials.subtitle, locale)}
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((item, i) => (
                <TestimonialCard key={item.id} item={item} locale={locale} t={t.common} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {clients.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container-x">
            <h2 className="t-eyebrow text-center text-ink-600">{pick(home.clients.title, locale)}</h2>
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              {clients.map((c) => (
                <li key={c.id} className="h-12 w-32 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" aria-label={c.name} className="block h-full">
                      <Picture media={c.logo!} locale={locale} sizes="128px" alt={c.name} fit="contain" />
                    </a>
                  ) : (
                    <Picture media={c.logo!} locale={locale} sizes="128px" alt={c.name} fit="contain" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {faqItems.length > 0 && (
        <section className="section-y">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow={t.sections.faq} title={pick(home.faq.title, locale)} subtitle={pick(home.faq.subtitle, locale)} />
            </div>
            <div className="lg:col-span-8">
              <FaqList items={faqItems} />
            </div>
          </div>
          <JsonLd data={faqJsonLd(faqItems)} />
        </section>
      )}

      <CtaBand
        locale={locale}
        settings={settings}
        title={pick(home.finalCta.title, locale)}
        subtitle={pick(home.finalCta.subtitle, locale)}
        cta="home-final"
      />
    </>
  );
}
