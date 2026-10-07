import "server-only";
import { and, asc, count, desc, eq, gte, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/server/db";
import { leadNotes, leads, leadStatuses, user, type LeadStatus } from "@/server/db/schema";
import type { Utm } from "@/server/db/schema/types";
import type { SiteSettings } from "@/content/settings";
import { pick } from "@/lib/i18n";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import { UNSURE_SERVICE } from "@/lib/validation/lead";
import { leadStatusMeta } from "@/lib/lead-status";
import { notifyNewLead } from "@/server/notifications";
import { logActivity } from "./activity";

export type LeadRecord = typeof leads.$inferSelect;

const BUILT_IN = new Set(["name", "whatsapp", "email", "company", "businessType", "service", "budget", "message", "preferredContact"]);

export async function createLead(
  data: Record<string, string>,
  meta: { sourcePage: string; sourceCta: string; utm: Utm; locale: "ar" | "en"; userAgent: string | null },
  ctx: { settings: SiteSettings; services: Array<{ id: string; title: { ar: string; en: string } }> },
) {
  const fields = ctx.settings.form.fields;
  const optionLabel = (key: string, value: string) => {
    const f = fields.find((x) => x.key === key);
    const o = f?.options.find((x) => x.value === value);
    return o ? pick(o.label, "ar") : value;
  };
  const service = ctx.services.find((s) => s.id === data.service);
  const extra: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) if (!BUILT_IN.has(k) && v) extra[k] = v;

  const [lead] = await db
    .insert(leads)
    .values({
      name: data.name!,
      whatsapp: data.whatsapp!,
      email: data.email ?? "",
      company: data.company ?? "",
      businessType: data.businessType ? optionLabel("businessType", data.businessType) : "",
      serviceId: service?.id ?? null,
      serviceLabel: service ? pick(service.title, "ar") : data.service === UNSURE_SERVICE ? "غير محدد" : "",
      budget: data.budget ? optionLabel("budget", data.budget) : "",
      preferredContact: data.preferredContact || "whatsapp",
      message: data.message ?? "",
      extra,
      sourcePage: meta.sourcePage,
      sourceCta: meta.sourceCta,
      utm: meta.utm,
      locale: meta.locale,
      userAgent: meta.userAgent?.slice(0, 300) ?? null,
    })
    .returning();

  await Promise.all([
    logActivity({ action: "lead", entityType: "lead", entityId: lead!.id, summary: `طلب جديد من ${lead!.name}` }),
    notifyNewLead({
      id: lead!.id,
      name: lead!.name,
      whatsapp: lead!.whatsapp,
      email: lead!.email,
      company: lead!.company,
      service: lead!.serviceLabel,
      budget: lead!.budget,
      message: lead!.message,
      sourcePage: lead!.sourcePage,
    }),
  ]);
  return lead!;
}

export type LeadFilters = {
  q?: string;
  status?: string;
  service?: string;
  range?: "7d" | "30d" | "90d" | "all";
  sort?: "newest" | "oldest";
  page?: number;
};

export const LEADS_PAGE_SIZE = 20;

export async function listLeads(f: LeadFilters) {
  const conditions: Array<SQL | undefined> = [];
  if (f.status && (leadStatuses as readonly string[]).includes(f.status)) conditions.push(eq(leads.status, f.status as LeadStatus));
  if (f.service) conditions.push(eq(leads.serviceId, f.service));
  if (f.range && f.range !== "all") {
    const days = { "7d": 7, "30d": 30, "90d": 90 }[f.range];
    conditions.push(gte(leads.createdAt, new Date(Date.now() - days * 86400000)));
  }
  if (f.q) {
    const term = `%${f.q.trim().replace(/[%_]/g, "")}%`;
    conditions.push(
      or(ilike(leads.name, term), ilike(leads.company, term), ilike(leads.whatsapp, term), ilike(leads.email, term), ilike(leads.message, term)),
    );
  }
  const where = and(...conditions);
  const page = Math.max(1, f.page ?? 1);
  const [items, [total]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(f.sort === "oldest" ? asc(leads.createdAt) : desc(leads.createdAt))
      .limit(LEADS_PAGE_SIZE)
      .offset((page - 1) * LEADS_PAGE_SIZE),
    db.select({ n: count() }).from(leads).where(where),
  ]);
  return { items, total: total?.n ?? 0, page, pages: Math.max(1, Math.ceil((total?.n ?? 0) / LEADS_PAGE_SIZE)) };
}

export async function getLead(id: string) {
  const [lead] = await db.select().from(leads).where(eq(leads.id, id));
  if (!lead) return null;
  const notes = await db
    .select({ id: leadNotes.id, body: leadNotes.body, createdAt: leadNotes.createdAt, author: user.name })
    .from(leadNotes)
    .leftJoin(user, eq(user.id, leadNotes.userId))
    .where(eq(leadNotes.leadId, id))
    .orderBy(desc(leadNotes.createdAt));
  return { ...lead, notes };
}

export async function setLeadStatus(id: string, status: LeadStatus, userId: string) {
  const [lead] = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
  if (lead) {
    await logActivity({ userId, action: "status", entityType: "lead", entityId: id, summary: `${lead.name}: ${leadStatusMeta[status].label}`, meta: { status } });
  }
  return lead ?? null;
}

export async function addLeadNote(leadId: string, body: string, userId: string) {
  await db.insert(leadNotes).values({ leadId, body, userId });
}

export async function deleteLead(id: string, userId: string) {
  const [lead] = await db.delete(leads).where(eq(leads.id, id)).returning();
  if (lead) await logActivity({ userId, action: "delete", entityType: "lead", entityId: id, summary: lead.name });
  return lead ?? null;
}

export async function leadStats() {
  const since30 = new Date(Date.now() - 30 * 86400000);
  const [byStatus, [last30], daily] = await Promise.all([
    db.select({ status: leads.status, n: count() }).from(leads).groupBy(leads.status),
    db.select({ n: count() }).from(leads).where(gte(leads.createdAt, since30)),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${leads.createdAt}), 'YYYY-MM-DD')`,
        n: count(),
      })
      .from(leads)
      .where(gte(leads.createdAt, since30))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
  ]);
  const statusCounts = Object.fromEntries(leadStatuses.map((s) => [s, 0])) as Record<LeadStatus, number>;
  for (const r of byStatus) statusCounts[r.status] = r.n;
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  return { total, statusCounts, last30: last30?.n ?? 0, daily };
}

export function whatsappForLead(lead: Pick<LeadRecord, "whatsapp">) {
  return normalizeWhatsappNumber(lead.whatsapp);
}
