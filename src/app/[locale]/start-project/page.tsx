import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getMessages } from "@/messages";
import { getSiteChrome } from "@/server/services/site";
import { getSeoEntry } from "@/server/services/catalog";
import { LeadFormBlock } from "@/components/site/lead-form-section";
import { WhatsAppLink } from "@/components/site/whatsapp-link";
import { pad2 } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[locale]/start-project">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  const [{ settings, ogImage }, seo] = await Promise.all([getSiteChrome(), getSeoEntry("start-project")]);
  return buildMetadata({
    locale,
    path: "/start-project",
    settings,
    title: pick(seo?.title, locale) || t.contact.startTitle,
    description: pick(seo?.description, locale) || t.contact.startSubtitle,
    image: seo?.ogImage,
    fallbackImage: ogImage,
    noindex: seo?.noindex,
  });
}

export default async function StartProjectPage({ params, searchParams }: PageProps<"/[locale]/start-project">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { service } = await searchParams;
  const t = getMessages(locale);
  const { settings, services } = await getSiteChrome();

  return (
    <section className="bg-paper pt-[calc(var(--header-h)+2.5rem)] pb-20 md:pt-[calc(var(--header-h)+4.5rem)] md:pb-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
            <p className="t-eyebrow mb-4 flex items-center gap-3 text-orange-700">
              <span aria-hidden="true" className="h-0.5 w-6 bg-current" />
              Brandify
            </p>
            <h1 className="t-h1 text-navy-900">{t.contact.startTitle}</h1>
            <p className="mt-5 text-lg text-ink-600">{t.contact.startSubtitle}</p>

            <h2 className="mt-12 font-bold text-navy-900">{t.contact.nextTitle}</h2>
            <ol className="mt-5 space-y-4">
              {t.contact.nextSteps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="t-latin inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                    {pad2(i + 1)}
                  </span>
                  <span className="pt-1 text-ink-600">{s}</span>
                </li>
              ))}
            </ol>

            <div className="mt-12 border-t border-line pt-8">
              <p className="mb-4 font-semibold text-navy-900">{t.contact.preferWhatsapp}</p>
              <WhatsAppLink
                number={settings.contact.whatsapp}
                message={pick(settings.cta.whatsappMessage, locale)}
                label={pick(settings.cta.whatsappLabel, locale)}
                cta="start-project-aside"
                variant="secondary"
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="shape-bubble bg-white p-6 shadow-[var(--shadow-md)] sm:p-10 md:p-12">
            <LeadFormBlock
              locale={locale}
              settings={settings}
              services={services}
              t={t}
              initialService={typeof service === "string" ? service : undefined}
              sourceCta="start-project"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
