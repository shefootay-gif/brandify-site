import { describe, expect, it } from "vitest";
import { fillTemplate, formatPhoneDisplay, normalizeWhatsappNumber, whatsappLink } from "@/lib/whatsapp";
import { buildLeadSchema } from "@/lib/validation/lead";
import { validateLead, UNSURE_SERVICE } from "@/lib/validation/lead-client";
import { defaultSettings, siteSettingsSchema } from "@/content/settings";
import { blockDefaults, blockSchemas, type BlockKey } from "@/content/blocks";
import { mergeDefaults } from "@/lib/merge";
import { slugify } from "@/lib/utils";
import { dir, href, pick } from "@/lib/i18n";
import { serviceInput, projectInput } from "@/lib/validation/admin";
import { seedServices } from "@/server/db/seed/services";
import { seedProjects } from "@/server/db/seed/projects";

describe("whatsapp", () => {
  it("normalises Egyptian numbers to wa.me format", () => {
    expect(normalizeWhatsappNumber("01090459654")).toBe("201090459654");
    expect(normalizeWhatsappNumber("010 9045 9654")).toBe("201090459654");
    expect(normalizeWhatsappNumber("+20 109 045 9654")).toBe("201090459654");
    expect(normalizeWhatsappNumber("00201090459654")).toBe("201090459654");
    expect(normalizeWhatsappNumber("201090459654")).toBe("201090459654");
  });
  it("encodes the prefilled message", () => {
    expect(whatsappLink("01090459654", "مرحبًا Brandify")).toBe(
      `https://wa.me/201090459654?text=${encodeURIComponent("مرحبًا Brandify")}`,
    );
  });
  it("fills templates and formats display numbers", () => {
    expect(fillTemplate("أنا {name} — {service}", { name: "سارة", service: "الإعلانات" })).toBe("أنا سارة — الإعلانات");
    expect(formatPhoneDisplay("01090459654")).toBe("010 9045 9654");
  });
});

describe("lead validation (client mirror matches server schema)", () => {
  const fields = defaultSettings.form.fields;
  const services = ["11111111-1111-4111-8111-111111111111"];
  const server = buildLeadSchema(fields, services);
  const cases: Array<Record<string, string>> = [
    {},
    { name: "A", whatsapp: "123", service: "nope" },
    { name: "سارة", whatsapp: "01012345678", service: services[0]! },
    { name: "سارة", whatsapp: "+20 101 234 5678", service: UNSURE_SERVICE, email: "bad-email" },
    { name: "سارة", whatsapp: "01012345678", service: services[0]!, budget: "not-a-range" },
    { name: "سارة", whatsapp: "01012345678", service: services[0]!, budget: "5k-15k", email: "a@b.co", message: "x".repeat(3001) },
  ];
  it.each(cases.map((c, i) => [i, c]))("case %i", (_, values) => {
    const clientErrors = validateLead(fields, values, services);
    const parsed = server.safeParse(Object.fromEntries(fields.map((f) => [f.key, values[f.key] ?? ""])));
    const serverErrors: Record<string, string> = {};
    if (!parsed.success) for (const i of parsed.error.issues) serverErrors[String(i.path[0])] ??= i.message;
    expect(Object.keys(clientErrors).sort()).toEqual(Object.keys(serverErrors).sort());
  });
});

describe("CMS defaults and seed data are valid", () => {
  it("default settings pass the settings schema", () => {
    expect(siteSettingsSchema.safeParse(defaultSettings).success).toBe(true);
  });
  it.each(Object.keys(blockDefaults) as BlockKey[])("block %s defaults pass its schema", (key) => {
    const res = blockSchemas[key].safeParse(blockDefaults[key]);
    if (!res.success) console.error(res.error.issues);
    expect(res.success).toBe(true);
  });
  it.each(seedServices.map((s) => [s.slug, s]))("seed service %s is valid", (_, s) => {
    const res = serviceInput.safeParse({ ...s, coverMediaId: null, seoTitle: { ar: "", en: "" }, seoDescription: s.shortDescription, visible: true });
    expect(res.success).toBe(true);
  });
  it.each(seedProjects.map((p) => [p.slug, p]))("concept project %s has no results claims", (_, p) => {
    const res = projectInput.safeParse({
      ...p,
      results: { ar: "", en: "" },
      year: null,
      isConcept: true,
      hasCaseStudy: Boolean(p.caseStudy),
      caseStudy: p.caseStudy ?? { strategy: { ar: "", en: "" }, creative: { ar: "", en: "" }, execution: { ar: "", en: "" } },
      coverMediaId: null,
      seoTitle: { ar: "", en: "" },
      seoDescription: p.summary,
      status: "published",
    });
    expect(res.success).toBe(true);
    // Guard against invented metrics sneaking into concept copy.
    const text = JSON.stringify(p);
    expect(text).not.toMatch(/\d+\s*%|٪/);
  });
});

describe("utilities", () => {
  it("merges stored CMS data over defaults", () => {
    const merged = mergeDefaults({ a: 1, b: { c: 2, d: 3 }, list: [1] }, { b: { c: 9 }, list: [5, 6], extra: true });
    expect(merged).toEqual({ a: 1, b: { c: 9, d: 3 }, list: [5, 6] });
  });
  it("slugifies latin titles and falls back for arabic-only", () => {
    expect(slugify("Kasr Studio — Launch!")).toBe("kasr-studio-launch");
    expect(slugify("مشروع")).toMatch(/^item-[a-z0-9]+$/);
  });
  it("handles locale helpers", () => {
    expect(dir("ar")).toBe("rtl");
    expect(dir("en")).toBe("ltr");
    expect(href("en", "/work")).toBe("/en/work");
    expect(href("ar")).toBe("/ar");
    expect(pick({ ar: "", en: "Hello" }, "ar")).toBe("Hello");
  });
});
