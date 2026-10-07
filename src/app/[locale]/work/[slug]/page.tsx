import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasText, href, isLocale, pick } from "@/lib/i18n";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { pad2 } from "@/lib/utils";
import { getMessages } from "@/messages";
import { getSiteChrome } from "@/server/services/site";
import { getPublicProject, getPublicProjects } from "@/server/services/catalog";
import { GeneratedCover } from "@/components/site/project-card";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { VideoPlayer } from "@/components/site/video-player";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Picture } from "@/components/ui/picture";
import { ArrowIcon, InfoIcon } from "@/components/ui/icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/work/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [{ settings, ogImage }, project] = await Promise.all([getSiteChrome(), getPublicProject(slug)]);
  if (!project) return {};
  return buildMetadata({
    locale,
    path: `/work/${slug}`,
    settings,
    title: pick(project.seoTitle, locale) || pick(project.title, locale),
    description: pick(project.seoDescription, locale) || pick(project.summary, locale),
    image: project.cover,
    fallbackImage: ogImage,
    type: "article",
  });
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/work/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const project = await getPublicProject(slug);
  if (!project) notFound();

  const t = getMessages(locale);
  const [{ settings }, all] = await Promise.all([getSiteChrome(), getPublicProjects()]);
  const title = pick(project.title, locale);
  const idx = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;

  // Story chapters: case studies get the full structure; other projects
  // show challenge/solution. Results only appear when entered by the admin.
  const cs = project.hasCaseStudy ? project.caseStudy : null;
  const chapters = [
    { label: t.sections.challenge, text: pick(project.challenge, locale) },
    ...(cs
      ? [
          { label: t.sections.strategy, text: pick(cs.strategy, locale) },
          { label: t.sections.creative, text: pick(cs.creative, locale) },
          { label: t.sections.execution, text: pick(cs.execution, locale) },
        ]
      : [{ label: t.sections.solution, text: pick(project.solution, locale) }]),
  ].filter((c) => c.text);
  const results = hasText(project.results) ? pick(project.results, locale) : "";
  const description = pick(project.description, locale);

  const meta = [
    project.clientName && !project.isConcept ? { k: t.sections.client, v: project.clientName } : null,
    hasText(project.industry) ? { k: t.sections.industry, v: pick(project.industry, locale) } : null,
    project.services.length ? { k: t.sections.services_, v: project.services.map((s) => pick(s.title, locale)).join("، ") } : null,
    project.year ? { k: t.sections.year, v: String(project.year) } : null,
  ].filter((m): m is { k: string; v: string } => Boolean(m));

  return (
    <article>
      <header data-surface="dark" className="bg-navy-900 text-white">
        <div className="container-x pt-[calc(var(--header-h)+2.5rem)] pb-14 md:pt-[calc(var(--header-h)+4rem)] md:pb-20">
          <Link href={href(locale, "/work")} className="group inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            <ArrowIcon size={16} className="rotate-180 rtl:rotate-0" />
            {t.common.backTo} {t.nav.work}
          </Link>
          <div className="hero-in mt-8 flex flex-wrap gap-2">
            {project.isConcept && <span className="shape-tag bg-white py-1 ps-3 text-xs font-semibold text-navy-900">{t.common.concept}</span>}
            {project.hasCaseStudy && <span className="shape-tag bg-orange-500 py-1 ps-3 text-xs font-semibold text-navy-950">{t.common.caseStudy}</span>}
          </div>
          <h1 className="hero-in t-display mt-5 max-w-5xl" style={{ ["--i" as string]: 1 }}>
            {title}
          </h1>
          {hasText(project.summary) && (
            <p className="hero-in mt-6 max-w-2xl text-lg text-white/70 md:text-xl" style={{ ["--i" as string]: 2 }}>
              {pick(project.summary, locale)}
            </p>
          )}
          {meta.length > 0 && (
            <dl className="hero-in mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4" style={{ ["--i" as string]: 3 }}>
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="t-caption text-white/55">{m.k}</dt>
                  <dd className="mt-1.5 font-semibold">{m.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      <div className="container-x -mt-px pt-10 md:pt-14">
        <div className="aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] md:aspect-[16/8]">
          {project.cover ? (
            <Picture media={project.cover} locale={locale} sizes="(min-width: 1440px) 1360px, 100vw" alt={title} priority />
          ) : (
            <GeneratedCover title={title} theme={project.accentColor} large />
          )}
        </div>
        {project.isConcept && (
          <p className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] bg-info-bg p-4 text-navy-900 t-small">
            <InfoIcon size={18} className="mt-0.5 shrink-0" />
            {t.common.conceptNote}
          </p>
        )}
      </div>

      {description && (
        <section className="container-x pt-16 md:pt-24">
          <div className="prose-brand mx-auto max-w-3xl text-xl text-navy-900" dangerouslySetInnerHTML={{ __html: description }} />
        </section>
      )}

      {chapters.length > 0 && (
        <section className="section-y">
          <div className="container-x space-y-16 md:space-y-24">
            {chapters.map((c, i) => (
              <div key={c.label} className="grid gap-6 md:grid-cols-12" data-reveal>
                <div className="md:col-span-4">
                  <p className="t-latin text-sm text-ink-400">{pad2(i + 1)}</p>
                  <h2 className="t-h3 mt-2 text-navy-900">{c.label}</h2>
                </div>
                <p className="whitespace-pre-line text-lg leading-relaxed text-ink-600 md:col-span-8">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {results && (
        <section data-surface="dark" className="bg-navy-900 text-white">
          <div className="container-x section-y grid gap-6 md:grid-cols-12">
            <h2 className="t-h2 md:col-span-4">{t.sections.results}</h2>
            <p className="whitespace-pre-line text-xl leading-relaxed text-white/85 md:col-span-8">{results}</p>
          </div>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section className="section-y">
          <div className="container-x">
            <h2 className="t-eyebrow mb-8 text-orange-700">{t.sections.gallery}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {project.gallery.map((g, i) => {
                const caption = pick(g.caption, locale);
                const wide = i % 3 === 0;
                return (
                  <figure key={g.id} className={wide ? "md:col-span-2" : undefined} data-reveal>
                    <div className="overflow-hidden rounded-[var(--radius-lg)] bg-navy-100">
                      {g.media.kind === "video" ? (
                        <VideoPlayer
                          src={g.media.url}
                          label={caption || title}
                          playLabel={t.common.playVideo}
                          pauseLabel={t.common.pauseVideo}
                          className="aspect-video"
                        />
                      ) : (
                        <Picture
                          media={g.media}
                          locale={locale}
                          sizes={wide ? "(min-width: 1440px) 1360px, 100vw" : "(min-width: 768px) 50vw, 100vw"}
                          className="h-auto"
                        />
                      )}
                    </div>
                    {caption && <figcaption className="t-small mt-3 text-ink-600">{caption}</figcaption>}
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {(project.tools.length > 0 || project.tags.length > 0) && (
        <section className="container-x pb-16">
          <div className="grid gap-8 border-t border-line pt-10 md:grid-cols-2">
            {project.tools.length > 0 && (
              <div>
                <h2 className="t-eyebrow mb-4 text-ink-600">{t.sections.tools}</h2>
                <ul className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <li key={tool} className="t-latin rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-navy-900">
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.categories.length > 0 && (
              <div>
                <h2 className="t-eyebrow mb-4 text-ink-600">{t.nav.work}</h2>
                <ul className="flex flex-wrap gap-2">
                  {project.categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`${href(locale, "/work")}?category=${c.slug}`}
                        className="shape-tag inline-flex h-9 items-center bg-navy-50 ps-3.5 text-sm font-semibold text-navy-900 hover:bg-navy-100"
                      >
                        {pick(c.name, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {project.testimonials.length > 0 && (
        <section className="bg-paper-2 py-16 md:py-24">
          <div className="container-x mx-auto max-w-3xl">
            {project.testimonials.map((q) => (
              <TestimonialCard key={q.id} item={q} locale={locale} t={t.common} />
            ))}
          </div>
        </section>
      )}

      {next && next.id !== project.id && (
        <nav aria-label={t.nav.work} className="border-t border-line">
          <Link href={href(locale, `/work/${next.slug}`)} className="group container-x flex items-center justify-between gap-6 py-12 md:py-16">
            <span>
              <span className="t-eyebrow block text-ink-600">{t.common.viewProject}</span>
              <span className="t-h2 mt-2 block text-navy-900 transition-colors group-hover:text-orange-700">{pick(next.title, locale)}</span>
            </span>
            <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white transition-colors group-hover:bg-orange-500 group-hover:text-navy-950">
              <ArrowIcon size={22} className="flip-rtl" />
            </span>
          </Link>
        </nav>
      )}

      <CtaBand
        locale={locale}
        settings={settings}
        title={t.common.similarTitle}
        subtitle={t.common.similarSubtitle}
        cta={`project:${project.slug}`}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: title,
          description: pick(project.summary, locale),
          url: absoluteUrl(href(locale, `/work/${project.slug}`)),
          creator: { "@id": `${absoluteUrl("/")}#organization` },
          ...(project.cover ? { image: absoluteUrl(project.cover.url) } : {}),
          inLanguage: locale,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: href(locale) },
          { name: t.nav.work, path: href(locale, "/work") },
          { name: title, path: href(locale, `/work/${project.slug}`) },
        ])}
      />
    </article>
  );
}
