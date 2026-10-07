"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { otherLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { GlobeIcon } from "@/components/ui/icons";

type Props = { locale: Locale; label: string; ariaLabel: string; className?: string; onNavigate?: () => void };

export function LanguageSwitcher({ locale, label, ariaLabel, className, onNavigate }: Props) {
  const pathname = usePathname() ?? `/${locale}`;
  const search = useSearchParams()?.toString();
  const target = otherLocale(locale);
  const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, "");
  const hrefTo = `/${target}${rest}${search ? `?${search}` : ""}`;

  return (
    <Link
      href={hrefTo}
      hrefLang={target}
      lang={target}
      aria-label={ariaLabel}
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
        onNavigate?.();
      }}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-md)] px-3 text-sm font-semibold transition-colors",
        className,
      )}
    >
      <GlobeIcon size={17} />
      <span className={target === "en" ? "t-latin" : undefined}>{label}</span>
    </Link>
  );
}
