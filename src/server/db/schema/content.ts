import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import type { Localized, LocalizedItem, MediaVariant, ProjectCaseStudy } from "./types";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const l = (name: string) => jsonb(name).$type<Localized>();
const emptyL: Localized = { ar: "", en: "" };

export const publishStatus = ["draft", "published"] as const;
export type PublishStatus = (typeof publishStatus)[number];

// ─── Media library ──────────────────────────────────────────
export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind", { enum: ["image", "video", "file"] }).notNull(),
    filename: text("filename").notNull(),
    storageKey: text("storage_key").notNull().unique(),
    url: text("url").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    blurDataUrl: text("blur_data_url"),
    variants: jsonb("variants").$type<MediaVariant[]>().notNull().default([]),
    alt: l("alt").notNull().default(emptyL),
    folder: text("folder").notNull().default("general"),
    uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("media_folder_idx").on(t.folder), index("media_kind_idx").on(t.kind)],
);

// ─── Services (the 5 pillars, each with its own page) ───────
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull().default("bubble"),
  title: l("title").notNull(),
  shortDescription: l("short_description").notNull(),
  body: l("body").notNull().default(emptyL),
  subServices: jsonb("sub_services").$type<LocalizedItem[]>().notNull().default([]),
  benefits: jsonb("benefits").$type<LocalizedItem[]>().notNull().default([]),
  deliverables: jsonb("deliverables").$type<Localized[]>().notNull().default([]),
  process: jsonb("process").$type<LocalizedItem[]>().notNull().default([]),
  ctaLabel: l("cta_label").notNull().default(emptyL),
  whatsappMessage: l("whatsapp_message").notNull().default(emptyL),
  coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
  seoTitle: l("seo_title").notNull().default(emptyL),
  seoDescription: l("seo_description").notNull().default(emptyL),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// ─── Portfolio ──────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: l("name").notNull(),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: l("title").notNull(),
    clientName: text("client_name").notNull().default(""),
    industry: l("industry").notNull().default(emptyL),
    summary: l("summary").notNull().default(emptyL),
    description: l("description").notNull().default(emptyL),
    challenge: l("challenge").notNull().default(emptyL),
    solution: l("solution").notNull().default(emptyL),
    // Only shown when filled in by the admin — never generated.
    results: l("results").notNull().default(emptyL),
    tools: text("tools").array().notNull().default([]),
    tags: text("tags").array().notNull().default([]),
    year: smallint("year"),
    isConcept: boolean("is_concept").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    hasCaseStudy: boolean("has_case_study").notNull().default(false),
    caseStudy: jsonb("case_study").$type<ProjectCaseStudy>(),
    accentColor: text("accent_color"),
    coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
    seoTitle: l("seo_title").notNull().default(emptyL),
    seoDescription: l("seo_description").notNull().default(emptyL),
    status: text("status", { enum: publishStatus }).notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("projects_status_idx").on(t.status, t.sortOrder)],
);

export const projectCategories = pgTable(
  "project_categories",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.categoryId] })],
);

export const projectServices = pgTable(
  "project_services",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.serviceId] })],
);

export const projectMedia = pgTable(
  "project_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    caption: l("caption").notNull().default(emptyL),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("project_media_project_idx").on(t.projectId, t.sortOrder)],
);

// ─── Social proof ───────────────────────────────────────────
export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  company: text("company").notNull().default(""),
  position: l("position").notNull().default(emptyL),
  quote: l("quote").notNull(),
  rating: smallint("rating"),
  photoMediaId: uuid("photo_media_id").references(() => media.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  status: text("status", { enum: publishStatus }).notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logoMediaId: uuid("logo_media_id").references(() => media.id, { onDelete: "set null" }),
  url: text("url"),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: l("name").notNull(),
  role: l("role").notNull().default(emptyL),
  bio: l("bio").notNull().default(emptyL),
  photoMediaId: uuid("photo_media_id").references(() => media.id, { onDelete: "set null" }),
  videoMediaId: uuid("video_media_id").references(() => media.id, { onDelete: "set null" }),
  isFounder: boolean("is_founder").notNull().default(false),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: l("question").notNull(),
  answer: l("answer").notNull(),
  // null = general FAQ; otherwise shown on that service page.
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "cascade" }),
  showOnHome: boolean("show_on_home").notNull().default(false),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// ─── Editable page content, SEO, settings ───────────────────
export const contentBlocks = pgTable("content_blocks", {
  key: text("key").primaryKey(),
  data: jsonb("data").notNull(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const seoEntries = pgTable("seo_entries", {
  routeKey: text("route_key").primaryKey(),
  title: l("title").notNull().default(emptyL),
  description: l("description").notNull().default(emptyL),
  ogImageId: uuid("og_image_id").references(() => media.id, { onDelete: "set null" }),
  noindex: boolean("noindex").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
