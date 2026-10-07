// Validation for dashboard forms — shared by client (instant feedback) and
// server actions (source of truth).
import { z } from "zod";
import { localized, localizedItem, localizedRequired, optionalUrl, slug } from "./common";

const uuidNull = z.uuid().nullable().default(null);
const items = (max = 20) => z.array(localizedItem).max(max).default([]);
const tagList = z.array(z.string().trim().min(1).max(60)).max(30).default([]);

export const serviceInput = z.object({
  slug,
  icon: z.enum(["bubble", "play", "tag"]),
  title: localizedRequired(120),
  shortDescription: localizedRequired(300),
  body: localized(3000),
  subServices: items(),
  benefits: items(),
  deliverables: z.array(localized(200)).max(20).default([]),
  process: items(10),
  ctaLabel: localized(80),
  whatsappMessage: localized(500),
  coverMediaId: uuidNull,
  seoTitle: localized(120),
  seoDescription: localized(300),
  visible: z.boolean(),
});
export type ServiceInput = z.infer<typeof serviceInput>;

export const coverThemes = ["navy", "midnight", "ocean", "orange", "paper"] as const;

export const projectInput = z.object({
  slug,
  title: localizedRequired(160),
  clientName: z.string().trim().max(120).default(""),
  industry: localized(120),
  summary: localized(400),
  description: localized(20000),
  challenge: localized(3000),
  solution: localized(3000),
  results: localized(3000),
  tools: tagList,
  tags: tagList,
  year: z.coerce.number().int().min(2000).max(2100).nullable().default(null),
  isConcept: z.boolean(),
  isFeatured: z.boolean(),
  hasCaseStudy: z.boolean(),
  caseStudy: z.object({ strategy: localized(4000), creative: localized(4000), execution: localized(4000) }),
  accentColor: z.enum(coverThemes),
  coverMediaId: uuidNull,
  seoTitle: localized(120),
  seoDescription: localized(300),
  status: z.enum(["draft", "published"]),
  categoryIds: z.array(z.uuid()).max(20).default([]),
  serviceIds: z.array(z.uuid()).max(20).default([]),
  gallery: z.array(z.object({ mediaId: z.uuid(), caption: localized(300) })).max(60).default([]),
});
export type ProjectInput = z.infer<typeof projectInput>;

export const categoryInput = z.object({
  slug,
  name: localizedRequired(60),
  visible: z.boolean(),
});
export type CategoryInput = z.infer<typeof categoryInput>;

export const testimonialInput = z.object({
  name: z.string().trim().min(1, "required").max(100),
  company: z.string().trim().max(120).default(""),
  position: localized(120),
  quote: localizedRequired(1500),
  rating: z.coerce.number().int().min(1).max(5).nullable().default(null),
  photoMediaId: uuidNull,
  projectId: uuidNull,
  status: z.enum(["draft", "published"]),
});
export type TestimonialInput = z.infer<typeof testimonialInput>;

export const clientInput = z.object({
  name: z.string().trim().min(1, "required").max(120),
  logoMediaId: uuidNull,
  url: optionalUrl,
  visible: z.boolean(),
});
export type ClientInput = z.infer<typeof clientInput>;

export const teamInput = z.object({
  name: localizedRequired(120),
  role: localized(120),
  bio: localized(1500),
  photoMediaId: uuidNull,
  videoMediaId: uuidNull,
  isFounder: z.boolean(),
  visible: z.boolean(),
});
export type TeamInput = z.infer<typeof teamInput>;

export const faqInput = z.object({
  question: localizedRequired(300),
  answer: localizedRequired(2000),
  serviceId: uuidNull,
  showOnHome: z.boolean(),
  visible: z.boolean(),
});
export type FaqInput = z.infer<typeof faqInput>;

export const seoRouteKeys = [
  "home",
  "services",
  "work",
  "case-studies",
  "about",
  "process",
  "contact",
  "start-project",
  "testimonials",
] as const;

export const seoInput = z.object({
  routeKey: z.enum(seoRouteKeys),
  title: localized(120),
  description: localized(300),
  ogImageId: uuidNull,
  noindex: z.boolean(),
});
export type SeoInput = z.infer<typeof seoInput>;

export const reorderInput = z.array(z.uuid()).min(1).max(500);

export const passwordInput = z
  .object({
    currentPassword: z.string().min(1, "required"),
    newPassword: z.string().min(10, "min10").max(128),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "mismatch" });
