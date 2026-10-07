import { z } from "zod";
import type { FormField } from "@/content/settings";

export { UNSURE_SERVICE } from "./lead-client";
import { UNSURE_SERVICE } from "./lead-client";

/** Egyptian or international mobile. Accepts spaces, dashes and a leading +. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .pipe(z.string().regex(/^\+?\d{8,15}$/, "phone"));

const MAX: Record<string, number> = { name: 100, company: 120, message: 3000, email: 160 };

/**
 * Build the lead schema from the admin-configured form fields. Used on the
 * client for instant feedback and on the server as the source of truth.
 */
export function buildLeadSchema(fields: FormField[], serviceValues: string[]) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) {
    if (!f.enabled) continue;
    const required = f.required || f.key === "name" || f.key === "whatsapp";
    let s: z.ZodType;
    if (f.key === "whatsapp") s = z.string().trim().min(1, "required").pipe(phoneSchema);
    else if (f.type === "email") s = z.string().trim().max(160).pipe(z.email("email").or(z.literal("")));
    else if (f.type === "select") {
      const allowed = f.key === "service" ? [...serviceValues, UNSURE_SERVICE] : f.options.map((o) => o.value);
      s = z
        .string()
        .trim()
        .refine((v) => v === "" || allowed.includes(v), "option");
    } else {
      const max = MAX[f.key] ?? (f.type === "textarea" ? 3000 : 300);
      s = z.string().trim().max(max, "too_long");
    }
    if (required) {
      s = (s as z.ZodType<string>).refine((v) => v.length > 0, "required");
    } else {
      s = s.optional().default("");
    }
    shape[f.key] = s;
  }
  if (shape.name) shape.name = (shape.name as z.ZodType<string>).refine((v) => v.length >= 2, "too_short");
  return z.object(shape);
}

export const leadMetaSchema = z.object({
  sourcePage: z.string().max(300).default(""),
  sourceCta: z.string().max(80).default(""),
  utm: z
    .object({
      source: z.string().max(100).optional(),
      medium: z.string().max(100).optional(),
      campaign: z.string().max(150).optional(),
      term: z.string().max(100).optional(),
      content: z.string().max(100).optional(),
    })
    .default({}),
  locale: z.enum(["ar", "en"]).default("ar"),
});
