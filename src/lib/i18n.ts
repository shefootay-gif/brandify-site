import type { Localized } from "@/server/db/schema/types";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

/** Pick the text for a locale, falling back to the other language if empty. */
export function pick(value: Localized | null | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale]?.trim() || value[otherLocale(locale)]?.trim() || "";
}

export function hasText(value: Localized | null | undefined): boolean {
  return Boolean(value && (value.ar?.trim() || value.en?.trim()));
}

export const L = (ar: string, en: string): Localized => ({ ar, en });

/** Build a locale-prefixed path: href("ar", "/work") → "/ar/work". */
export function href(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

export function formatDate(date: Date | string, locale: Locale, withTime = false): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(d);
}
