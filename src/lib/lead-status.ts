import type { LeadStatus } from "@/server/db/schema/leads";

export const leadStatusMeta: Record<LeadStatus, { label: string; tone: "info" | "orange" | "warning" | "neutral" | "success" | "danger" }> = {
  new: { label: "جديد", tone: "orange" },
  contacted: { label: "تم التواصل", tone: "info" },
  qualified: { label: "مؤهل", tone: "warning" },
  proposal: { label: "عرض سعر", tone: "neutral" },
  won: { label: "تم الاتفاق", tone: "success" },
  lost: { label: "لم يتم", tone: "danger" },
};
