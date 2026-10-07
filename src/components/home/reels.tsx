import type { HomeContent } from "@/content/blocks";
import type { PublicMedia } from "@/server/db/schema/types";
import { pick, type Locale } from "@/lib/i18n";
import type { Messages } from "@/messages";
import { Picture } from "@/components/ui/picture";
import { SectionHeading } from "@/components/site/section";
import { VideoPlayer } from "@/components/site/video-player";

/** Horizontal strip of real reels / behind-the-scenes clips. */
export function Reels({ content, items, locale, t }: { content: HomeContent["reels"]; items: PublicMedia[]; locale: Locale; t: Messages }) {
  if (!content.visible || !items.length) return null;
  return (
    <section data-surface="dark" className="section-y overflow-hidden bg-navy-900">
      <div className="container-x">
        <SectionHeading tone="dark" title={pick(content.title, locale)} subtitle={pick(content.subtitle, locale)} />
      </div>
      <ul className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:thin] md:gap-6">
        {items.map((m, i) => (
          <li key={m.id} className="w-[68vw] max-w-[300px] shrink-0 snap-start" data-reveal style={{ ["--reveal-i" as string]: i % 4 }}>
            <div className="aspect-[9/16] overflow-hidden rounded-[var(--radius-lg)] bg-navy-950">
              {m.kind === "video" ? (
                <VideoPlayer
                  src={m.url}
                  label={pick(m.alt, locale) || content.title[locale]}
                  playLabel={t.common.playVideo}
                  pauseLabel={t.common.pauseVideo}
                  className="h-full"
                />
              ) : (
                <Picture media={m} locale={locale} sizes="300px" />
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
