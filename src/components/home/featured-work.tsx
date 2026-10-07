import Link from "next/link";
import type { HomeContent } from "@/content/blocks";
import type { ProjectCard as ProjectCardData } from "@/server/services/catalog";
import { href, pick, type Locale } from "@/lib/i18n";
import type { Messages } from "@/messages";
import { buttonClasses } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/site/section";
import { ProjectCard } from "@/components/site/project-card";

export function FeaturedWork({
  content,
  projects,
  locale,
  t,
}: {
  content: HomeContent["work"];
  projects: ProjectCardData[];
  locale: Locale;
  t: Messages;
}) {
  if (!projects.length) return null;
  const featured = projects.filter((p) => p.isFeatured);
  const list = (featured.length >= 2 ? featured : projects).slice(0, 5);
  const [first, ...rest] = list;

  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <SectionHeading
          eyebrow={t.nav.work}
          title={pick(content.title, locale)}
          subtitle={pick(content.subtitle, locale)}
          action={
            <Link href={href(locale, "/work")} className={buttonClasses("subtle", "md", "group/all")}>
              {t.common.allWork}
              <ArrowIcon size={18} className="flip-rtl transition-transform group-hover/all:translate-x-1 rtl:group-hover/all:-translate-x-1" />
            </Link>
          }
        />
        <div className="mt-14 grid gap-x-8 gap-y-14 md:mt-20 md:grid-cols-2">
          {first && (
            <div className="md:col-span-2">
              <ProjectCard
                project={first}
                locale={locale}
                conceptLabel={t.common.concept}
                caseStudyLabel={t.common.caseStudy}
                sizes="(min-width: 1440px) 1360px, 100vw"
                large
              />
            </div>
          )}
          {rest.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i + 1}
              locale={locale}
              conceptLabel={t.common.concept}
              caseStudyLabel={t.common.caseStudy}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
