import type { Metadata } from "next";
import type { SiteSettings } from "@/content/settings";
import type { PublicMedia } from "@/server/db/schema/types";
import { locales, pick, type Locale } from "./i18n";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

type BuildArgs = {
  locale: Locale;
  /** Path without locale prefix, e.g. "/work/my-project" ("/" for home). */
  path: string;
  settings: SiteSettings;
  title?: string;
  description?: string;
  image?: PublicMedia | null;
  fallbackImage?: PublicMedia | null;
  noindex?: boolean;
  type?: "website" | "article";
  /** Home page uses the default title without the template. */
  absoluteTitle?: boolean;
};

export function buildMetadata(a: BuildArgs): Metadata {
  const clean = a.path === "/" ? "" : a.path;
  const url = `/${a.locale}${clean}`;
  const defaultTitle = pick(a.settings.seo.defaultTitle, a.locale);
  const template = pick(a.settings.seo.titleTemplate, a.locale) || "%s";
  const title = a.title ? (a.absoluteTitle ? a.title : template.replace("%s", a.title)) : defaultTitle;
  const description = (a.description || pick(a.settings.seo.defaultDescription, a.locale)).slice(0, 300);
  const img = a.image ?? a.fallbackImage;
  const ogImage = img?.kind === "image" ? absoluteUrl(img.variants.find((v) => v.width >= 1200)?.url ?? img.url) : undefined;

  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l === "ar" ? "ar-EG" : "en", `/${l}${clean}`])),
        "x-default": `/ar${clean}`,
      },
    },
    openGraph: {
      type: a.type ?? "website",
      url,
      title,
      description,
      siteName: a.settings.brand.name,
      locale: a.locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: a.locale === "ar" ? ["en_US"] : ["ar_EG"],
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: a.noindex ? { index: false, follow: true } : undefined,
  };
}

/** Organization + LocalBusiness structured data (Minya-based agency). */
export function organizationJsonLd(settings: SiteSettings, locale: Locale) {
  const sameAs = settings.social.filter((s) => s.visible).map((s) => s.url);
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${siteUrl()}/#organization`,
    name: settings.brand.name,
    alternateName: "Brandify Marketing Agency",
    url: `${siteUrl()}/${locale}`,
    logo: absoluteUrl("/brand/logo.png"),
    image: absoluteUrl("/brand/logo.png"),
    description: pick(settings.seo.defaultDescription, locale),
    email: settings.contact.email || undefined,
    telephone: settings.contact.whatsapp ? `+${settings.contact.whatsapp.replace(/^0/, "20").replace(/\D/g, "")}` : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: locale === "ar" ? "المنيا" : "Minya",
      addressCountry: "EG",
    },
    areaServed: { "@type": "Country", name: "Egypt" },
    sameAs,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
