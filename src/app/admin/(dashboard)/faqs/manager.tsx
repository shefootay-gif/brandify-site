"use client";

import type { Localized } from "@/server/db/schema/types";
import { EntityManager, type EntityFormProps, type EntityRow } from "@/components/admin/entity-manager";
import { LocalizedField, SelectField, Switch } from "@/components/admin/fields";
import { HelpIcon } from "@/components/ui/icons";

export type FaqValue = { question: Localized; answer: Localized; serviceId: string | null; showOnHome: boolean; visible: boolean };
type Ctx = { services: Array<{ value: string; label: string }> };

function FaqForm({ value: v, onChange, errL, context }: EntityFormProps<FaqValue, Ctx>) {
  const set = <K extends keyof FaqValue>(k: K, val: FaqValue[K]) => onChange({ ...v, [k]: val });
  return (
    <>
      <LocalizedField label="السؤال" required value={v.question} onChange={(x) => set("question", x)} errors={errL("question")} />
      <LocalizedField label="الإجابة" required multiline rows={4} value={v.answer} onChange={(x) => set("answer", x)} errors={errL("answer")} />
      <SelectField
        label="يظهر في"
        value={v.serviceId ?? ""}
        onChange={(x) => set("serviceId", x || null)}
        options={[{ value: "", label: "أسئلة عامة (الرئيسية وصفحة التواصل)" }, ...context.services.map((s) => ({ value: s.value, label: `صفحة خدمة: ${s.label}` }))]}
      />
      <div className="space-y-4 rounded-[var(--radius-md)] bg-paper p-4">
        {!v.serviceId && <Switch label="يظهر في الصفحة الرئيسية" checked={v.showOnHome} onChange={(b) => set("showOnHome", b)} />}
        <Switch label="ظاهر في الموقع" checked={v.visible} onChange={(b) => set("visible", b)} />
      </div>
    </>
  );
}

export function FaqsManager({ rows, services, defaultService }: { rows: EntityRow<FaqValue>[]; services: Ctx["services"]; defaultService: string | null }) {
  return (
    <EntityManager<FaqValue, Ctx>
      entity="faqs"
      rows={rows}
      emptyIcon={<HelpIcon size={32} />}
      empty={{ title: "لا توجد أسئلة", body: "أضف أسئلة يسألها عملاؤك كثيرًا. تظهر أيضًا في نتائج جوجل (FAQ Schema)." }}
      addLabel="إضافة سؤال"
      dialogTitle={{ add: "سؤال جديد", edit: "تعديل السؤال" }}
      visibleLabels={{ on: "إظهار", off: "مخفي" }}
      newValue={() => ({ question: { ar: "", en: "" }, answer: { ar: "", en: "" }, serviceId: defaultService, showOnHome: !defaultService, visible: true })}
      toPayload={(v) => ({ ...v, showOnHome: v.serviceId ? false : v.showOnHome })}
      Form={FaqForm}
      context={{ services }}
    />
  );
}
