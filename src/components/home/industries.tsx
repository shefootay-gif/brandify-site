import type { HomeContent } from "@/content/blocks";
import { pick, type Locale } from "@/lib/i18n";
import { pad2 } from "@/lib/utils";
import { SectionHeading } from "@/components/site/section";

/** "Find yourself here" list — rows, not cards, to keep the page calm. */
export function Industries({ content, locale, eyebrow }: { content: HomeContent["industries"]; locale: Locale; eyebrow: string }) {
  if (!content.visible || !content.items.length) return null;
  return (
    <section className="section-y">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
            <SectionHeading eyebrow={eyebrow} title={pick(content.title, locale)} subtitle={pick(content.subtitle, locale)} />
          </div>
        </div>
        <ol className="border-t border-line lg:col-span-8">
          {content.items.map((item, i) => (
            <li
              key={i}
              className="group grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-7 transition-colors md:grid-cols-[4rem_minmax(0,16rem)_1fr] md:gap-x-8 md:py-8"
              data-reveal
              style={{ ["--reveal-i" as string]: i % 4 }}
            >
              <span className="t-latin pt-1 text-sm font-medium text-ink-400 transition-colors group-hover:text-orange-700">{pad2(i + 1)}</span>
              <h3 className="text-xl font-bold text-navy-900 md:text-2xl">{pick(item.title, locale)}</h3>
              <p className="col-start-2 mt-2 text-ink-600 md:col-start-3 md:mt-0">{pick(item.description, locale)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
