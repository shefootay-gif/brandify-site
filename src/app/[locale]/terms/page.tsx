import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getBlock } from "@/server/services/settings";
import { getSiteChrome } from "@/server/services/site";
import { LegalPage } from "@/components/site/legal-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [{ settings }, content] = await Promise.all([getSiteChrome(), getBlock("legal.terms")]);
  return buildMetadata({ locale, path: "/terms", settings, title: pick(content.title, locale) });
}

export default async function TermsPage({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = await getBlock("legal.terms");
  return <LegalPage content={content} locale={locale} updatedLabel={locale === "ar" ? "آخر تحديث" : "Last updated"} />;
}
