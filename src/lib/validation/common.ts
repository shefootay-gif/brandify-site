import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

/** Bilingual text; both languages optional. */
export const localized = (max = 2000) =>
  z.object({ ar: text(max).default(""), en: text(max).default("") });

/** Bilingual text where Arabic (the default locale) is required. */
export const localizedRequired = (max = 2000) =>
  z.object({ ar: text(max).min(1, "required"), en: text(max).default("") });

export const localizedItem = z.object({
  title: localized(200),
  description: localized(1000),
});

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug");

export const uuidOrNull = z.uuid().nullable().default(null);

export const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "url")
  .default("");

export const sortOrder = z.coerce.number().int().min(0).max(100000).default(0);
