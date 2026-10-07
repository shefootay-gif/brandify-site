import type { ProcessContent } from "@/content/blocks";
import { pick, type Locale } from "@/lib/i18n";
import { pad2 } from "@/lib/utils";

/** Numbered process timeline on navy, with a scroll-driven progress line. */
export function ProcessSteps({ steps, locale }: { steps: ProcessContent["steps"]; locale: Locale }) {
  return (
    <ol className="relative grid gap-0 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, i) => (
        <li
          key={i}
          className="group relative border-t border-white/12 py-9 pe-6 md:py-12"
          data-reveal
          style={{ ["--reveal-i" as string]: i % 3 }}
        >
          <span
            aria-hidden="true"
            className="absolute -top-px start-0 h-0.5 w-12 bg-orange-500 transition-[width] duration-500 ease-[var(--ease-out-quint)] group-hover:w-24"
          />
          <span className="t-latin block text-5xl font-extralight text-white/40 transition-colors duration-500 group-hover:text-orange-500 md:text-6xl">
            {pad2(i + 1)}
          </span>
          <h3 className="mt-6 text-2xl font-bold text-white">{pick(step.title, locale)}</h3>
          <p className="mt-3 max-w-sm text-white/65">{pick(step.description, locale)}</p>
        </li>
      ))}
    </ol>
  );
}
