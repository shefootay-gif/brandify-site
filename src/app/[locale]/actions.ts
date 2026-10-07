"use server";

import { headers } from "next/headers";
import { getSettings } from "@/server/services/settings";
import { getPublicServices } from "@/server/services/catalog";
import { createLead } from "@/server/services/leads";
import { consumeRateLimit, clientIp } from "@/server/services/rate-limit";
import { buildLeadSchema, leadMetaSchema, UNSURE_SERVICE } from "@/lib/validation/lead";
import { pick } from "@/lib/i18n";
import { fillTemplate, whatsappLink } from "@/lib/whatsapp";

export type LeadFormState =
  | { status: "idle" }
  | { status: "error"; code: "invalid" | "rate" | "server"; fieldErrors?: Record<string, string> }
  | { status: "success"; whatsappUrl: string };

const MIN_FILL_MS = 2500;

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  try {
    // Spam traps: a hidden field humans never fill, and a minimum fill time.
    if (String(formData.get("website") ?? "").trim() !== "") return fakeSuccess();
    const startedAt = Number(formData.get("_ts") ?? 0);
    if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) return fakeSuccess();

    const h = await headers();
    const ip = clientIp(h);
    if (!(await consumeRateLimit(`lead:${ip}`, 5, 600))) return { status: "error", code: "rate" };

    const [settings, services] = await Promise.all([getSettings(), getPublicServices()]);
    const schema = buildLeadSchema(settings.form.fields, services.map((s) => s.id));

    const raw: Record<string, unknown> = {};
    for (const f of settings.form.fields) if (f.enabled) raw[f.key] = String(formData.get(f.key) ?? "");
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { status: "error", code: "invalid", fieldErrors };
    }

    let utm: unknown = {};
    try {
      utm = JSON.parse(String(formData.get("_utm") || "{}"));
    } catch {
      utm = {};
    }
    const meta = leadMetaSchema.parse({
      sourcePage: String(formData.get("_page") ?? "").slice(0, 300),
      sourceCta: String(formData.get("_cta") ?? "").slice(0, 80),
      utm,
      locale: formData.get("_locale") === "en" ? "en" : "ar",
    });

    const data = parsed.data as Record<string, string>;
    await createLead(data, { ...meta, userAgent: h.get("user-agent") }, { settings, services });

    const service = services.find((s) => s.id === data.service);
    const serviceName = service
      ? pick(service.title, meta.locale)
      : data.service === UNSURE_SERVICE
        ? meta.locale === "ar"
          ? "لم أحدد بعد"
          : "not sure yet"
        : "";
    const message = fillTemplate(pick(settings.form.whatsappFollowup, meta.locale), {
      name: data.name ?? "",
      service: serviceName,
    });
    return { status: "success", whatsappUrl: whatsappLink(settings.contact.whatsapp, message) };
  } catch (error) {
    console.error("[lead] submission failed", error);
    return { status: "error", code: "server" };
  }
}

/** Bots get a normal-looking response so they don't retry with tweaks. */
function fakeSuccess(): LeadFormState {
  return { status: "success", whatsappUrl: "" };
}
