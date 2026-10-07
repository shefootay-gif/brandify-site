import type { PublicTeamMember } from "@/server/services/catalog";
import { pick, type Locale } from "@/lib/i18n";
import type { Messages } from "@/messages";
import { Picture } from "@/components/ui/picture";
import { QuoteIcon } from "@/components/ui/icons";
import { VideoPlayer } from "./video-player";

type Props = {
  founder: PublicTeamMember;
  title: string;
  quote: string;
  locale: Locale;
  t: Messages;
};

/** Founder spotlight — real face, real words. Hidden until filled in the CMS. */
export function FounderSpotlight({ founder, title, quote, locale, t }: Props) {
  const name = pick(founder.name, locale);
  const role = pick(founder.role, locale);
  const bio = pick(founder.bio, locale);
  return (
    <section className="section-y overflow-hidden">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="relative lg:col-span-5" data-reveal>
          <div aria-hidden="true" className="shape-bubble absolute inset-0 translate-x-4 translate-y-4 bg-orange-500 rtl:-translate-x-4" />
          <div className="shape-bubble relative aspect-[4/5] overflow-hidden bg-navy-900">
            {founder.video ? (
              <VideoPlayer
                src={founder.video.url}
                label={name}
                playLabel={t.common.playVideo}
                pauseLabel={t.common.pauseVideo}
                className="h-full"
                rounded={false}
              />
            ) : founder.photo ? (
              <Picture media={founder.photo} locale={locale} sizes="(min-width: 1024px) 40vw, 100vw" alt={name} />
            ) : (
              <div aria-hidden="true" className="flex h-full items-center justify-center font-[family-name:var(--font-display)] text-[8rem] font-bold text-white/90">
                {name.trim().charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          <p className="t-eyebrow mb-6 flex items-center gap-3 text-orange-700" data-reveal>
            <span aria-hidden="true" className="h-0.5 w-6 bg-current" />
            {title}
          </p>
          {quote && (
            <blockquote data-reveal style={{ ["--reveal-i" as string]: 1 }}>
              <QuoteIcon size={36} className="mb-5 text-orange-500" />
              <p className="t-h2 text-navy-900">{quote}</p>
            </blockquote>
          )}
          {bio && (
            <p className="mt-6 max-w-xl text-ink-600" data-reveal style={{ ["--reveal-i" as string]: 2 }}>
              {bio}
            </p>
          )}
          <div className="mt-8 border-s-2 border-orange-500 ps-4" data-reveal style={{ ["--reveal-i" as string]: 3 }}>
            <p className="text-lg font-bold text-navy-900">{name}</p>
            {role && <p className="t-small text-ink-600">{role}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
