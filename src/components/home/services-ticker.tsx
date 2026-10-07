import type { PublicService } from "@/server/services/catalog";
import { pick, type Locale } from "@/lib/i18n";

/** Infinite marquee of real sub-service names. Static when reduced motion is on. */
export function ServicesTicker({ services, locale }: { services: PublicService[]; locale: Locale }) {
  const names = services.flatMap((s) => (s.subServices.length ? s.subServices.map((x) => pick(x.title, locale)) : [pick(s.title, locale)]));
  if (!names.length) return null;
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {names.map((n, i) => (
        <li key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6 font-[family-name:var(--font-display)] text-lg font-semibold text-white/80 md:text-xl">{n}</span>
          <span aria-hidden="true" className="size-1.5 rotate-45 bg-orange-500" />
        </li>
      ))}
    </ul>
  );
  return (
    <div data-surface="dark" className="overflow-hidden border-y border-white/10 bg-navy-950 py-5">
      <div className="flex w-max animate-marquee motion-reduce:animate-none rtl:[--marquee-dir:-1]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
