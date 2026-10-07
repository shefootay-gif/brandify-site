import Link from "next/link";
import type { CategoryRecord, ProjectCard as ProjectCardData } from "@/server/services/catalog";
import { href, pick, type Locale } from "@/lib/i18n";
import type { Messages } from "@/messages";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";
import { WhatsAppLink } from "./whatsapp-link";

type Props = {
  locale: Locale;
  t: Messages;
  projects: ProjectCardData[];
  categories: Pick<CategoryRecord, "id" | "slug" | "name">[];
  active: string | null;
  basePath: "/work" | "/case-studies";
  emptyText: string;
  whatsapp: { number: string; message: string; label: string };
};

/**
 * Filterable portfolio grid. Filters are plain links (?category=slug) so each
 * filtered view is server-rendered, shareable and crawlable.
 */
export function WorkGrid({ locale, t, projects, categories, active, basePath, emptyText, whatsapp }: Props) {
  const used = categories.filter((c) => projects.some((p) => p.categorySlugs.includes(c.slug)));
  const visible = active ? projects.filter((p) => p.categorySlugs.includes(active)) : projects;
  const chip = (label: string, slug: string | null) => {
    const isActive = active === slug;
    return (
      <li key={slug ?? "all"}>
        <Link
          href={slug ? `${href(locale, basePath)}?category=${slug}` : href(locale, basePath)}
          scroll={false}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "shape-tag inline-flex h-10 items-center ps-4 text-sm font-semibold transition-colors",
            isActive ? "bg-navy-900 text-white" : "bg-white text-navy-900 hover:bg-navy-50",
          )}
        >
          {label}
        </Link>
      </li>
    );
  };

  return (
    <div>
      {used.length > 1 && (
        <nav aria-label={t.work.filterLabel} className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] pb-2">
          <ul className="flex w-max gap-2">
            {chip(t.work.all, null)}
            {used.map((c) => chip(pick(c.name, locale), c.slug))}
          </ul>
        </nav>
      )}

      {visible.length > 0 ? (
        <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              locale={locale}
              conceptLabel={t.common.concept}
              caseStudyLabel={t.common.caseStudy}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              priority={i < 3}
            />
          ))}
        </div>
      ) : (
        <div className="shape-bubble mt-12 flex flex-col items-start gap-6 bg-white p-10 md:p-14">
          <p className="max-w-xl text-lg text-ink-600">{active ? t.work.empty : emptyText}</p>
          {active ? (
            <Link href={href(locale, basePath)} className="font-semibold text-orange-700 underline underline-offset-4">
              {t.work.all}
            </Link>
          ) : (
            <WhatsAppLink number={whatsapp.number} message={whatsapp.message} label={whatsapp.label} cta="work-empty" />
          )}
        </div>
      )}
    </div>
  );
}
