import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { services } from "./content";
import type { Utm } from "./types";

export const leadStatuses = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    company: text("company").notNull().default(""),
    whatsapp: text("whatsapp").notNull(),
    email: text("email").notNull().default(""),
    businessType: text("business_type").notNull().default(""),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    // Snapshot of the service name at submission time (survives service edits/deletes).
    serviceLabel: text("service_label").notNull().default(""),
    budget: text("budget").notNull().default(""),
    message: text("message").notNull().default(""),
    preferredContact: text("preferred_contact").notNull().default("whatsapp"),
    // Values of admin-defined custom form fields.
    extra: jsonb("extra").$type<Record<string, string>>().notNull().default({}),
    status: text("status", { enum: leadStatuses }).notNull().default("new"),
    sourcePage: text("source_page").notNull().default(""),
    sourceCta: text("source_cta").notNull().default(""),
    utm: jsonb("utm").$type<Utm>().notNull().default({}),
    locale: text("locale").notNull().default("ar"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("leads_status_idx").on(t.status),
    index("leads_created_idx").on(t.createdAt),
  ],
);

export const leadNotes = pgTable(
  "lead_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lead_notes_lead_idx").on(t.leadId)],
);

/** Anonymous CTA click events (no personal data) — powers "WhatsApp clicks" in the dashboard. */
export const ctaEvents = pgTable(
  "cta_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type", { enum: ["whatsapp", "social"] }).notNull(),
    cta: text("cta").notNull().default(""),
    page: text("page").notNull().default(""),
    locale: text("locale").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("cta_events_created_idx").on(t.createdAt), index("cta_events_type_idx").on(t.type)],
);

export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    summary: text("summary").notNull().default(""),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activity_created_idx").on(t.createdAt)],
);
