import type { PublicTestimonial } from "@/server/services/catalog";
import { pick, type Locale } from "@/lib/i18n";
import { QuoteIcon, StarIcon } from "@/components/ui/icons";
import { Picture } from "@/components/ui/picture";
import { format, type Messages } from "@/messages";

type Props = {
  item: Pick<PublicTestimonial, "id" | "name" | "company" | "position" | "quote" | "rating" | "photo">;
  locale: Locale;
  t: Messages["common"];
  index?: number;
};

export function TestimonialCard({ item, locale, t, index = 0 }: Props) {
  const position = pick(item.position, locale);
  const meta = [position, item.company].filter(Boolean).join(" · ");
  return (
    <figure
      className="shape-bubble flex h-full flex-col bg-white p-7 shadow-[var(--shadow-sm)] md:p-9"
      data-reveal
      style={{ ["--reveal-i" as string]: index % 3 }}
    >
      <QuoteIcon size={30} className="text-orange-500" />
      {item.rating ? (
        <div className="mt-5 flex gap-0.5 text-orange-500" role="img" aria-label={format(t.rating, { n: item.rating })}>
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} size={16} className={i < item.rating! ? "" : "opacity-25"} />
          ))}
        </div>
      ) : null}
      <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-navy-900">{pick(item.quote, locale)}</blockquote>
      <figcaption className="mt-8 flex items-center gap-3.5">
        {item.photo ? (
          <span className="size-12 shrink-0 overflow-hidden rounded-full">
            <Picture media={item.photo} locale={locale} sizes="48px" alt="" />
          </span>
        ) : (
          <span aria-hidden="true" className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-900 font-bold text-white">
            {item.name.trim().charAt(0)}
          </span>
        )}
        <span>
          <span className="block font-semibold text-navy-900">{item.name}</span>
          {meta && <span className="t-small block text-ink-600">{meta}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
