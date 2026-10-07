import Link from "next/link";
import type { HomeContent } from "@/content/blocks";
import type { SiteSettings } from "@/content/settings";
import { href, pick, type Locale } from "@/lib/i18n";
import { buttonClasses } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/icons";
import { WhatsAppLink } from "@/components/site/whatsapp-link";
import { BubbleGlyph, PlayGlyph, TagGlyph } from "@/components/site/glyphs";
import { BubbleOutline } from "@/components/site/section";

const MOTIF = [BubbleGlyph, PlayGlyph, TagGlyph];

export function HomeHero({ content, settings, locale }: { content: HomeContent["hero"]; settings: SiteSettings; locale: Locale }) {
  const motto = content.motto.map((m) => pick(m, locale));
  return (
    <section data-surface="dark" className="relative overflow-hidden bg-navy-900 text-white">
      <BubbleOutline className="pointer-events-none absolute -end-40 top-24 hidden w-[44rem] text-navy-800 lg:block" />
      <div className="container-x relative grid min-h-[min(100svh,60rem)] items-center gap-12 pt-[calc(var(--header-h)+2.5rem)] pb-14 lg:grid-cols-12 lg:gap-8 lg:pb-20">
        <div className="lg:col-span-7">
          <p className="hero-in t-eyebrow mb-6 flex items-center gap-3 text-orange-500" style={{ ["--i" as string]: 0 }}>
            <span aria-hidden="true" className="h-0.5 w-6 bg-current" />
            {pick(content.eyebrow, locale)}
          </p>
          <h1 className="hero-in t-display max-w-[16ch] text-white" style={{ ["--i" as string]: 1 }}>
            {pick(content.title, locale)}
          </h1>
          <p className="hero-in mt-7 max-w-xl text-lg text-white/75 md:text-xl" style={{ ["--i" as string]: 2 }}>
            {pick(content.subtitle, locale)}
          </p>
          <div className="hero-in mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ ["--i" as string]: 3 }}>
            <WhatsAppLink
              number={settings.contact.whatsapp}
              message={pick(settings.cta.whatsappMessage, locale)}
              label={pick(settings.cta.whatsappLabel, locale)}
              cta="hero"
              size="lg"
              magnetic
            />
            <Link href={href(locale, "/work")} className={buttonClasses("outline-light", "lg", "group/sec")}>
              {pick(content.secondaryCta, locale)}
              <ArrowIcon size={18} className="flip-rtl transition-transform duration-300 group-hover/sec:translate-x-1 rtl:group-hover/sec:-translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Signature motif: the logo's three shapes = Talk. Create. Sell. */}
        <div aria-label={motto.join(" ")} role="img" className="lg:col-span-5">
          <ol className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-0">
            {motto.map((word, i) => {
              const G = MOTIF[i]!;
              const last = i === motto.length - 1;
              return (
                <li key={i} className="motif-row relative lg:py-6" style={{ ["--i" as string]: i }}>
                  <span aria-hidden="true" className="motif-line absolute inset-x-0 top-0 hidden h-px bg-white/15 lg:block" />
                  <span className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-7">
                    <G size={56} className={`size-9 shrink-0 lg:size-16 ${last ? "text-orange-500" : "text-white/85"}`} />
                    <span
                      aria-hidden="true"
                      className={`motif-word font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl lg:text-6xl ${last ? "text-orange-500" : "text-white"}`}
                    >
                      {word}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
