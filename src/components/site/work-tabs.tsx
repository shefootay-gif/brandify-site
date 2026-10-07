import Link from "next/link";
import { href, type Locale } from "@/lib/i18n";
import type { Messages } from "@/messages";
import { cn } from "@/lib/utils";

/** "All work / Case studies" switch shared by both portfolio pages. */
export function WorkTabs({
  locale,
  t,
  current,
  hasCaseStudies,
}: {
  locale: Locale;
  t: Messages;
  current: "work" | "case-studies";
  hasCaseStudies: boolean;
}) {
  if (!hasCaseStudies && current === "work") return null;
  const tabs = [
    { key: "work", label: t.common.allWork, path: "/work" },
    { key: "case-studies", label: t.nav.caseStudies, path: "/case-studies" },
  ] as const;
  return (
    <nav aria-label={t.nav.work} className="mb-8 flex gap-6 border-b border-line">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={href(locale, tab.path)}
          aria-current={current === tab.key ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 pb-3 text-lg font-bold transition-colors",
            current === tab.key ? "border-orange-500 text-navy-900" : "border-transparent text-ink-400 hover:text-navy-900",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
