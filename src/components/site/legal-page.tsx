import type { LegalContent } from "@/content/blocks";
import { formatDate, pick, type Locale } from "@/lib/i18n";

export function LegalPage({ content, locale, updatedLabel }: { content: LegalContent; locale: Locale; updatedLabel: string }) {
  return (
    <article className="pt-[calc(var(--header-h)+3rem)] pb-24 md:pt-[calc(var(--header-h)+5rem)]">
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          <h1 className="t-h1 text-navy-900">{pick(content.title, locale)}</h1>
          {content.updatedAt && (
            <p className="t-small mt-4 text-ink-600">
              {updatedLabel}: <time dateTime={content.updatedAt}>{formatDate(content.updatedAt, locale)}</time>
            </p>
          )}
          <div className="prose-brand mt-10 text-ink-900" dangerouslySetInnerHTML={{ __html: pick(content.body, locale) }} />
        </div>
      </div>
    </article>
  );
}
