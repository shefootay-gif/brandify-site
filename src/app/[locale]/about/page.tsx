import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { href, isLocale, pick } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { pad2 } from "@/lib/utils";
import { getMessages } from "@/messages";
import { getBlock } from "@/server/services/settings";
import { getSiteChrome } from "@/server/services/site";
import { getPublicTeam, getSeoEntry } from "@/server/services/catalog";
import { PageHero, SectionHeading } from "@/components/site/section";
import { FounderSpotlight } from "@/components/site/founder";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { BubbleGlyph, PlayGlyph, TagGlyph } from "@/components/site/glyphs";
import { Picture } from "@/components/ui/picture";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [{ settings, ogImage }, seo, about] = await Promise.all([getSiteChrome(), getSeoEntry("about"), getBlock("about")]);
  return buildMetadata({
    locale,
    path: "/about",
    settings,
    title: pick(seo?.title, locale) || pick(about.hero.title, locale),
    description: pick(seo?.description, locale) || pick(about.hero.subtitle, locale),
    image: seo?.ogImage,
    fallbackImage: ogImage,
    noindex: seo?.noindex,
  });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const [{ settings }, about, home, team] = await Promise.all([getSiteChrome(), getBlock("about"), getBlock("home"), getPublicTeam()]);
  const founder = team.find((m) => m.isFounder && pick(m.name, locale));
  const others = team.filter((m) => !m.isFounder && pick(m.name, locale));
  const motto = home.hero.motto.map((m) => pick(m, locale));
  const glyphs = [BubbleGlyph, PlayGlyph, TagGlyph];

  return (
    <>
      <PageHero eyebrow={t.nav.about} title={pick(about.hero.title, locale)} subtitle={pick(about.hero.subtitle, locale)} />

      <section className="section-y">
        <div className="container-x grid gap-14 md:grid-cols-2 md:gap-20">
          {[about.who, about.what].map((b, i) => (
            <div key={i} data-reveal style={{ ["--reveal-i" as string]: i }}>
              <p className="t-latin text-sm text-ink-400">{pad2(i + 1)}</p>
              <h2 className="t-h2 mt-3 text-navy-900">{pick(b.title, locale)}</h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-600">{pick(b.body, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      {about.why.items.length > 0 && (
        <section className="section-y bg-white">
          <div className="container-x">
            <SectionHeading eyebrow="Brandify" title={pick(about.why.title, locale)} />
            <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-line bg-line md:grid-cols-2">
              {about.why.items.map((item, i) => (
                <div key={i} className="bg-white p-8 md:p-10" data-reveal style={{ ["--reveal-i" as string]: i % 2 }}>
                  <span aria-hidden="true" className="block h-0.5 w-10 bg-orange-500" />
                  <h3 className="mt-5 text-xl font-bold text-navy-900">{pick(item.title, locale)}</h3>
                  <p className="mt-2 text-ink-600">{pick(item.description, locale)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {about.principles.items.length > 0 && (
        <section data-surface="dark" className="section-y bg-navy-900 text-white">
          <div className="container-x">
            <SectionHeading tone="dark" eyebrow={t.nav.about} title={pick(about.principles.title, locale)} />
            <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {about.principles.items.map((item, i) => (
                <li key={i} className="border-t border-white/12 pt-6" data-reveal style={{ ["--reveal-i" as string]: i }}>
                  <span className="t-latin text-sm text-orange-500">{pad2(i + 1)}</span>
                  <h3 className="mt-3 text-xl font-bold">{pick(item.title, locale)}</h3>
                  <p className="mt-2 text-white/65">{pick(item.description, locale)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="section-y">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="t-h2 text-navy-900" data-reveal>{pick(about.difference.title, locale)}</h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-600" data-reveal style={{ ["--reveal-i" as string]: 1 }}>
              {pick(about.difference.body, locale)}
            </p>
          </div>
          <ul className="space-y-4 lg:col-span-5 lg:col-start-8">
            {motto.map((word, i) => {
              const G = glyphs[i]!;
              return (
                <li key={i} className="flex items-center gap-5 border-b border-line pb-4" data-reveal style={{ ["--reveal-i" as string]: i }}>
                  <G size={40} className={i === 2 ? "text-orange-500" : "text-navy-900"} />
                  <span className={`font-[family-name:var(--font-display)] text-3xl font-bold ${i === 2 ? "text-orange-600" : "text-navy-900"}`}>
                    {word}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {founder && (
        <div className="bg-white">
          <FounderSpotlight founder={founder} title={pick(home.founder.title, locale)} quote={pick(home.founder.quote, locale)} locale={locale} t={t} />
        </div>
      )}

      {others.length > 0 && (
        <section className="section-y">
          <div className="container-x grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((m) => (
              <figure key={m.id} data-reveal>
                <div className="shape-bubble aspect-[4/5] overflow-hidden bg-navy-100">
                  {m.photo && <Picture media={m.photo} locale={locale} sizes="(min-width: 1024px) 25vw, 50vw" alt={pick(m.name, locale)} />}
                </div>
                <figcaption className="mt-4">
                  <span className="block font-bold text-navy-900">{pick(m.name, locale)}</span>
                  <span className="t-small text-ink-600">{pick(m.role, locale)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <CtaBand
        locale={locale}
        settings={settings}
        title={pick(home.finalCta.title, locale)}
        subtitle={pick(home.finalCta.subtitle, locale)}
        cta="about-final"
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: href(locale) },
          { name: t.nav.about, path: href(locale, "/about") },
        ])}
      />
    </>
  );
}
