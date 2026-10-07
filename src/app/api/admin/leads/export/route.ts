import { and, desc, eq, gte, ilike, or, type SQL } from "drizzle-orm";
import { AuthError, assertRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { leads, leadStatuses, type LeadStatus } from "@/server/db/schema";
import { leadStatusMeta } from "@/lib/lead-status";

// Neutralise spreadsheet formula injection and quote for CSV.
function cell(value: unknown): string {
  let s = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  try {
    await assertRole("editor");
  } catch (e) {
    return new Response("Unauthorized", { status: e instanceof AuthError && e.code === "forbidden" ? 403 : 401 });
  }
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const service = url.searchParams.get("service");
  const range = url.searchParams.get("range");
  const q = url.searchParams.get("q")?.slice(0, 100);

  const conditions: Array<SQL | undefined> = [];
  if (status && (leadStatuses as readonly string[]).includes(status)) conditions.push(eq(leads.status, status as LeadStatus));
  if (service && /^[0-9a-f-]{36}$/i.test(service)) conditions.push(eq(leads.serviceId, service));
  const days = { "7d": 7, "30d": 30, "90d": 90 }[range ?? ""];
  if (days) conditions.push(gte(leads.createdAt, new Date(Date.now() - days * 86400000)));
  if (q) {
    const term = `%${q.replace(/[%_]/g, "")}%`;
    conditions.push(or(ilike(leads.name, term), ilike(leads.company, term), ilike(leads.whatsapp, term), ilike(leads.email, term)));
  }

  const rows = await db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt)).limit(10000);
  const header = ["التاريخ", "الاسم", "الشركة", "واتساب", "البريد", "نوع البيزنس", "الخدمة", "الميزانية", "التواصل المفضل", "الحالة", "الرسالة", "الصفحة", "utm_source", "utm_campaign"];
  const lines = [
    header.map(cell).join(","),
    ...rows.map((l) =>
      [
        l.createdAt,
        l.name,
        l.company,
        l.whatsapp,
        l.email,
        l.businessType,
        l.serviceLabel,
        l.budget,
        l.preferredContact,
        leadStatusMeta[l.status].label,
        l.message,
        l.sourcePage,
        l.utm.source ?? "",
        l.utm.campaign ?? "",
      ]
        .map(cell)
        .join(","),
    ),
  ];
  // BOM so Excel opens Arabic text correctly.
  const body = "﻿" + lines.join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="brandify-leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
