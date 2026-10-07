import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { href, isLocale, pick } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { formatPhoneDisplay, whatsappLink } from "@/lib/whatsapp";
import { getMessages } from "@/messages";
import { getSiteChrome } from "@/server/services/site";
import { getPublicFaqs, getSeoEntry } from "@/server/services/catalog";
import { PageHero, SectionHeading } from "@/components/site/section";
import { LeadFormBlock } from "@/components/site/lead-form-section";
import { SocialLinks } from "@/components/site/social-links";
import { FaqList } from "@/components/site/faq-list";
import { JsonLd } from "@/components/site/json-ld";
import { ArrowUpRightIcon, ClockIcon, MailIcon, MapPinIcon, WhatsAppIcon } from "@/components/ui/icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  const [{ settings, ogImage }, seo] = await Promise.all([getSiteChrome(), getSeoEntry("contact")]);
  return buildMetadata({
    locale,
    path: "/contact",
    settings,
    title: pick(seo?.title, locale) || t.contact.title,
    description: pick(seo?.description, locale) || t.contact.subtitle,
    image: seo?.ogImage,
    fallbackImage: ogImage,
    noindex: seo?.noindex,
  });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const [{ settings, services }, faqs] = await Promise.all([getSiteChrome(), getPublicFaqs({ general: true })]);
  const c = settings.contact;
  const address = pick(c.address, locale);
  const hours = pick(c.hours, locale);
  const faqItems = faqs.map((f) => ({ id: f.id, q: pick(f.question, locale), a: pick(f.answer, locale) }));

  return (
    <>
      <PageHero eyebrow={t.nav.contact} title={t.contact.title} subtitle={t.contact.subtitle} />

      <section className="section-y">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <aside className="space-y-4 lg:col-span-4">
            <a
              href={whatsappLink(c.whatsapp, pick(settings.cta.whatsappMessage, locale))}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp"
              data-cta="contact-card"
              className="shape-bubble group flex items-center justify-between gap-4 bg-orange-500 p-6 text-navy-950 transition-colors hover:bg-orange-600"
              data-reveal
            >
              <span className="flex items-center gap-4">
                <WhatsAppIcon size={32} />
                <span>
                  <span className="block text-sm font-semibold opacity-80">{t.contact.whatsapp}</span>
                  <span dir="ltr" className="t-latin block text-xl font-bold">{formatPhoneDisplay(c.whatsapp)}</span>
                </span>
              </span>
              <ArrowUpRightIcon size={22} className="flip-rtl transition-transform group-hover:rotate-45" />
            </a>

            {c.email && (
              <a
                href={`mailto:${c.email}`}
                className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-line bg-white p-6 transition-colors hover:border-navy-600/40"
                data-reveal
                style={{ ["--reveal-i" as string]: 1 }}
              >
                <MailIcon size={24} className="shrink-0 text-orange-600" />
                <span className="min-w-0">
                  <span className="block text-sm text-ink-600">{t.contact.email}</span>
                  <span className="t-latin block break-all font-semibold text-navy-900">{c.email}</span>
                </span>
              </a>
            )}

            {(address || hours) && (
              <div className="space-y-4 rounded-[var(--radius-lg)] border border-line bg-white p-6" data-reveal style={{ ["--reveal-i" as string]: 2 }}>
                {address && (
                  <p className="flex items-start gap-4">
                    <MapPinIcon size={24} className="shrink-0 text-orange-600" />
                    <span>
                      <span className="block text-sm text-ink-600">{t.contact.location}</span>
                      {c.mapUrl ? (
                        <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-900 underline underline-offset-4">
                          {address}
                        </a>
                      ) : (
                        <span className="font-semibold text-navy-900">{address}</span>
                      )}
                    </span>
                  </p>
                )}
                {hours && (
                  <p className="flex items-start gap-4">
                    <ClockIcon size={24} className="shrink-0 text-orange-600" />
                    <span>
                      <span className="block text-sm text-ink-600">{t.contact.hours}</span>
                      <span className="font-semibold text-navy-900">{hours}</span>
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="pt-4" data-reveal style={{ ["--reveal-i" as string]: 3 }}>
              <p className="mb-2 text-sm font-semibold text-ink-600">{t.contact.follow}</p>
              <SocialLinks social={settings.social} labels={t.social} className="border border-line bg-white text-navy-900 hover:border-orange-500" />
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="shape-bubble bg-white p-6 shadow-[var(--shadow-md)] sm:p-10 md:p-12">
              <h2 className="t-h3 text-navy-900">{t.contact.formTitle}</h2>
              <p className="mb-8 mt-2 text-ink-600">{t.contact.formSubtitle}</p>
              <LeadFormBlock locale={locale} settings={settings} services={services} t={t} sourceCta="contact-page" />
            </div>
          </div>
        </div>
      </section>

      {faqItems.length > 0 && (
        <section className="section-y border-t border-line">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow={t.sections.faq} title={t.sections.faq} />
            </div>
            <div className="lg:col-span-8">
              <FaqList items={faqItems} />
            </div>
          </div>
          <JsonLd data={faqJsonLd(faqItems)} />
        </section>
      )}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: href(locale) },
          { name: t.nav.contact, path: href(locale, "/contact") },
        ])}
      />
    </>
  );
}
