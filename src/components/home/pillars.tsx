import Link from "next/link";
import type { HomeContent } from "@/content/blocks";
import type { PublicService } from "@/server/services/catalog";
import { href, pick, type Locale } from "@/lib/i18n";
import { pad2 } from "@/lib/utils";
import { ArrowIcon } from "@/components/ui/icons";
import { BubbleGlyph, PlayGlyph, TagGlyph } from "@/components/site/glyphs";
import { SectionHeading } from "@/components/site/section";

const GLYPHS = [BubbleGlyph, PlayGlyph, TagGlyph];

export function Pillars({
  content,
  services,
  locale,
  eyebrow,
}: {
  content: HomeContent["pillars"];
  services: PublicService[];
  locale: Locale;
  eyebrow: string;
}) {
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow={eyebrow} title={pick(content.title, locale)} subtitle={pick(content.subtitle, locale)} />
        <div className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-line bg-line md:mt-20 lg:grid-cols-3">
          {content.items.map((item, i) => {
            const G = GLYPHS[i]!;
            const linked = item.serviceSlugs
              .map((slug) => services.find((s) => s.slug === slug))
              .filter((s): s is PublicService => Boolean(s));
            return (
              <article key={i} className="group flex flex-col bg-paper p-7 md:p-10" data-reveal style={{ ["--reveal-i" as string]: i }}>
                <div className="flex items-center justify-between">
                  <G size={44} className="text-navy-900 transition-colors duration-300 group-hover:text-orange-500" />
                  <span className="t-latin text-sm font-medium text-ink-400">{pad2(i + 1)}</span>
                </div>
                <h3 className="mt-10 font-[family-name:var(--font-display)] text-4xl font-bold text-navy-900 md:text-5xl">
                  {pick(item.verb, locale)}
                  <span className="text-orange-500">.</span>
                </h3>
                <p className="mt-5 text-ink-600">{pick(item.description, locale)}</p>
                {linked.length > 0 && (
                  <div className="mt-auto pt-8">
                  <ul className="space-y-1 border-t border-line pt-5">
                    {linked.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={href(locale, `/services/${s.slug}`)}
                          className="group/l flex items-center justify-between gap-3 py-2 font-semibold text-navy-900 hover:text-orange-700"
                        >
                          {pick(s.title, locale)}
                          <ArrowIcon size={18} className="flip-rtl shrink-0 transition-transform duration-300 group-hover/l:translate-x-1 rtl:group-hover/l:-translate-x-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
