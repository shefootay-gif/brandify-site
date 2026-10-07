import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import "@/styles/globals.css";
import { elMessiri, outfit } from "../fonts";
import { dir, href, isLocale, locales, pick } from "@/lib/i18n";
import { whatsappLink } from "@/lib/whatsapp";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { getMessages } from "@/messages";
import { getSiteChrome } from "@/server/services/site";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Logo } from "@/components/site/logo";
import { SocialLinks } from "@/components/site/social-links";
import { StickyWhatsApp } from "@/components/site/sticky-whatsapp";
import { Enhancements } from "@/components/site/enhancements";
import { Tracking } from "@/components/site/tracking";
import { JsonLd } from "@/components/site/json-ld";

export const viewport: Viewport = {
  themeColor: "#021D4E",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { settings, ogImage, favicon } = await getSiteChrome();
  return {
    ...buildMetadata({ locale, path: "/", settings, fallbackImage: ogImage }),
    applicationName: settings.brand.name,
    formatDetection: { telephone: false },
    // An uploaded favicon overrides the built-in app/icon.png.
    ...(favicon ? { icons: { icon: [{ url: favicon.variants[0]?.url ?? favicon.url }], apple: [{ url: favicon.url }] } } : {}),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  await connection(); // Always render with fresh (cached-at-data-level) CMS content.
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getMessages(locale);
  const chrome = await getSiteChrome();
  const { settings, services } = chrome;
  const waHref = whatsappLink(settings.contact.whatsapp, pick(settings.cta.whatsappMessage, locale));
  const waLabel = pick(settings.cta.whatsappLabel, locale);

  const nav = [
    { href: href(locale, "/services"), label: t.nav.services },
    { href: href(locale, "/work"), label: t.nav.work },
    { href: href(locale, "/process"), label: t.nav.process },
    { href: href(locale, "/about"), label: t.nav.about },
    { href: href(locale, "/contact"), label: t.nav.contact },
  ];
  const footerNav = [
    { href: href(locale), label: t.nav.home },
    ...nav.slice(0, 2),
    { href: href(locale, "/case-studies"), label: t.nav.caseStudies },
    ...(chrome.hasTestimonials ? [{ href: href(locale, "/testimonials"), label: t.nav.testimonials }] : []),
    ...nav.slice(2),
  ];

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${elMessiri.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marks JS availability so reveal animations never hide content without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[60] rounded-md bg-orange-500 px-4 py-2 font-semibold text-navy-950 focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          {t.nav.skip}
        </a>
        <Header
          locale={locale}
          logo={<Logo tone="light" height={34} priority custom={chrome.logoOnDark} />}
          nav={nav}
          whatsappHref={waHref}
          whatsappLabel={waLabel}
          socials={<SocialLinks social={settings.social} labels={t.social} className="text-white/70 hover:bg-white/5" />}
          t={t.nav}
        />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer locale={locale} settings={settings} services={services} nav={footerNav} t={t} logo={chrome.logoOnDark} />
        {settings.cta.stickyWhatsapp && <StickyWhatsApp href={waHref} label={waLabel} />}
        <Enhancements />
        <Tracking tracking={settings.tracking} />
        <JsonLd data={organizationJsonLd(settings, locale)} />
      </body>
    </html>
  );
}
