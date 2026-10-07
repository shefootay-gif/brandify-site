import Link from "next/link";
import type { ProjectCard as ProjectCardData } from "@/server/services/catalog";
import { href, pick, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { Picture } from "@/components/ui/picture";
import { Glyph } from "./glyphs";

/** Brand-palette cover themes for projects without images. */
export const coverThemes = {
  navy: { bg: "bg-navy-900", fg: "text-white", accent: "text-orange-500" },
  midnight: { bg: "bg-navy-950", fg: "text-white", accent: "text-orange-500" },
  ocean: { bg: "bg-navy-700", fg: "text-white", accent: "text-orange-500" },
  orange: { bg: "bg-orange-500", fg: "text-navy-950", accent: "text-navy-900" },
  paper: { bg: "bg-paper-2", fg: "text-navy-900", accent: "text-orange-600" },
} as const;
export type CoverTheme = keyof typeof coverThemes;

export function GeneratedCover({
  title,
  theme,
  glyph = "bubble",
  className,
  large,
}: {
  title: string;
  theme: string | null;
  glyph?: string;
  className?: string;
  large?: boolean;
}) {
  const t = coverThemes[(theme as CoverTheme) in coverThemes ? (theme as CoverTheme) : "navy"];
  return (
    <div aria-hidden="true" className={cn("relative flex h-full w-full flex-col justify-between overflow-hidden p-6 md:p-8", t.bg, t.fg, className)}>
      <Glyph
        name={glyph}
        size={large ? 120 : 64}
        className={cn("self-end opacity-90 transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:-rotate-6", t.accent)}
      />
      <Glyph
        name={glyph}
        size={large ? 520 : 300}
        className="pointer-events-none absolute -bottom-1/3 -start-1/4 opacity-[0.07]"
      />
      <p className={cn("relative font-[family-name:var(--font-display)] font-bold leading-[1.2]", large ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl")}>
        {title}
      </p>
    </div>
  );
}

type Props = {
  project: ProjectCardData;
  locale: Locale;
  conceptLabel: string;
  caseStudyLabel: string;
  sizes: string;
  index?: number;
  large?: boolean;
  priority?: boolean;
};

const glyphForIndex = ["bubble", "play", "tag"] as const;

export function ProjectCard({ project, locale, conceptLabel, caseStudyLabel, sizes, index = 0, large, priority }: Props) {
  const title = pick(project.title, locale);
  const industry = pick(project.industry, locale);
  return (
    <Link
      href={href(locale, `/work/${project.slug}`)}
      className="group block"
      // Above-the-fold (priority) cards render immediately; the rest reveal on scroll.
      data-reveal={priority ? undefined : ""}
      style={{ ["--reveal-i" as string]: index % 3 }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-lg)] bg-navy-100",
          large ? "aspect-[4/3] md:aspect-[16/11]" : "aspect-[4/3]",
        )}
      >
        <div className="h-full w-full transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.03]">
          {project.cover ? (
            <Picture media={project.cover} locale={locale} sizes={sizes} alt="" priority={priority} />
          ) : (
            <GeneratedCover title={title} theme={project.accentColor} glyph={glyphForIndex[index % 3]} large={large} />
          )}
        </div>
        <div className="absolute start-4 top-4 flex flex-wrap gap-2">
          {project.isConcept && (
            <span className="shape-tag bg-white/95 py-1 ps-3 text-xs font-semibold text-navy-900">{conceptLabel}</span>
          )}
          {project.hasCaseStudy && (
            <span className="shape-tag bg-orange-500 py-1 ps-3 text-xs font-semibold text-navy-950">{caseStudyLabel}</span>
          )}
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          {industry && <p className="t-small mb-1.5 text-ink-600">{industry}</p>}
          <h3 className={cn("font-bold text-navy-900", large ? "t-h3" : "text-xl")}>{title}</h3>
          {large && pick(project.summary, locale) && (
            <p className="mt-2 max-w-xl text-ink-600">{pick(project.summary, locale)}</p>
          )}
        </div>
        <span
          aria-hidden="true"
          className="mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-navy-900 transition-all duration-300 group-hover:border-orange-500 group-hover:bg-orange-500"
        >
          <ArrowUpRightIcon size={20} className="flip-rtl transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  );
}
