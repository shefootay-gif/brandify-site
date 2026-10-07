import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getMessages } from "@/messages";
import { getSiteChrome } from "@/server/services/site";
import { getPublicTestimonials, getSeoEntry } from "@/server/services/catalog";
import { getBlock } from "@/server/services/settings";
import { PageHero } from "@/components/site/section";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { CtaBand } from "@/components/site/cta-band";

export async function generateMetadata({ params }: PageProps<"/[locale]/testimonials">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  const [{ settings, ogImage }, seo, items] = await Promise.all([getSiteChrome(), getSeoEntry("testimonials"), getPublicTestimonials()]);
  return buildMetadata({
    locale,
    path: "/testimonials",
    settings,
    title: pick(seo?.title, locale) || t.testimonials.title,
    description: pick(seo?.description, locale) || t.testimonials.subtitle,
    image: seo?.ogImage,
    fallbackImage: ogImage,
    noindex: seo?.noindex || items.length === 0,
  });
}

export default async function TestimonialsPage({ params }: PageProps<"/[locale]/testimonials">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const [{ settings }, items, home] = await Promise.all([getSiteChrome(), getPublicTestimonials(), getBlock("home")]);
  // No published testimonials → no thin page.
  if (!items.length) notFound();

  return (
    <>
      <PageHero eyebrow={t.nav.testimonials} title={t.testimonials.title} subtitle={t.testimonials.subtitle} />
      <section className="section-y bg-paper-2">
        <div className="container-x grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <TestimonialCard key={item.id} item={item} locale={locale} t={t.common} index={i} />
          ))}
        </div>
      </section>
      <CtaBand
        locale={locale}
        settings={settings}
        title={pick(home.finalCta.title, locale)}
        subtitle={pick(home.finalCta.subtitle, locale)}
        cta="testimonials-final"
      />
    </>
  );
}
