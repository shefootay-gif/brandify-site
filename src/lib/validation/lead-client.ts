// Lightweight client-side mirror of buildLeadSchema (lead.ts) — no zod, so the
// public form pages stay small. The server action re-validates with zod and
// remains the source of truth; error codes match so messages are shared.
import type { FormField } from "@/content/settings";

export const UNSURE_SERVICE = "unsure";

const MAX: Record<string, number> = { name: 100, company: 120, message: 3000, email: 160 };
const PHONE = /^\+?\d{8,15}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateLead(fields: FormField[], values: Record<string, string>, serviceValues: string[], keys?: string[]) {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (!f.enabled || (keys && !keys.includes(f.key))) continue;
    const v = (values[f.key] ?? "").trim();
    const required = f.required || f.key === "name" || f.key === "whatsapp";
    if (!v) {
      if (required) errors[f.key] = "required";
      continue;
    }
    if (f.key === "whatsapp") {
      if (!PHONE.test(v.replace(/[\s\-().]/g, ""))) errors[f.key] = "phone";
    } else if (f.type === "email") {
      if (!EMAIL.test(v)) errors[f.key] = "email";
    } else if (f.type === "select") {
      const allowed = f.key === "service" ? [...serviceValues, UNSURE_SERVICE] : f.options.map((o) => o.value);
      if (!allowed.includes(v)) errors[f.key] = "option";
    } else if (v.length > (MAX[f.key] ?? (f.type === "textarea" ? 3000 : 300))) {
      errors[f.key] = "too_long";
    }
    if (f.key === "name" && !errors.name && v.length < 2) errors.name = "too_short";
  }
  return errors;
}
