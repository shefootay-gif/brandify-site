"use client";

import type { Localized, PublicMedia } from "@/server/db/schema/types";
import { EntityManager, type EntityFormProps, type EntityRow } from "@/components/admin/entity-manager";
import { LocalizedField, SelectField, Switch, TextField } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/media-library";
import { AlertIcon, QuoteOutlineIcon } from "@/components/ui/icons";

export type TestimonialValue = {
  name: string;
  company: string;
  position: Localized;
  quote: Localized;
  rating: number | null;
  photo: PublicMedia | null;
  projectId: string | null;
  published: boolean;
};
type Ctx = { projects: Array<{ value: string; label: string }> };

function TestimonialForm({ value: v, onChange, err, errL, context }: EntityFormProps<TestimonialValue, Ctx>) {
  const set = <K extends keyof TestimonialValue>(k: K, val: TestimonialValue[K]) => onChange({ ...v, [k]: val });
  return (
    <>
      <p className="flex items-start gap-2 rounded-[var(--radius-md)] bg-warning-bg p-3 text-sm text-warning">
        <AlertIcon size={17} className="mt-0.5 shrink-0" />
        انشر آراء حقيقية فقط، وبعد موافقة العميل على النشر.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="اسم العميل" required value={v.name} onChange={(x) => set("name", x)} error={err("name")} />
        <TextField label="الشركة / البراند" value={v.company} onChange={(x) => set("company", x)} />
      </div>
      <LocalizedField label="المنصب" value={v.position} onChange={(x) => set("position", x)} />
      <LocalizedField label="نص الرأي" required multiline rows={4} value={v.quote} onChange={(x) => set("quote", x)} errors={errL("quote")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="التقييم (اختياري)"
          value={v.rating ? String(v.rating) : ""}
          onChange={(x) => set("rating", x ? Number(x) : null)}
          placeholder="بدون تقييم"
          options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: "★".repeat(n) }))}
        />
        <SelectField label="مرتبط بمشروع (اختياري)" value={v.projectId ?? ""} onChange={(x) => set("projectId", x || null)} placeholder="—" options={context.projects} />
      </div>
      <MediaPicker label="صورة العميل (اختيارية)" value={v.photo} onChange={(m) => set("photo", m)} folder="testimonials" aspect="aspect-square" />
      <Switch label="منشور في الموقع" checked={v.published} onChange={(b) => set("published", b)} />
    </>
  );
}

export function TestimonialsManager({ rows, projects }: { rows: EntityRow<TestimonialValue>[]; projects: Ctx["projects"] }) {
  return (
    <EntityManager<TestimonialValue, Ctx>
      entity="testimonials"
      rows={rows}
      emptyIcon={<QuoteOutlineIcon size={32} />}
      empty={{ title: "لا توجد آراء بعد", body: "أضف آراء عملائك الحقيقية. قسم الآراء لا يظهر في الموقع حتى تنشر أول رأي." }}
      addLabel="إضافة رأي"
      dialogTitle={{ add: "رأي عميل جديد", edit: "تعديل رأي العميل" }}
      visibleLabels={{ on: "نشر", off: "مسودة" }}
      newValue={() => ({ name: "", company: "", position: { ar: "", en: "" }, quote: { ar: "", en: "" }, rating: null, photo: null, projectId: null, published: false })}
      toPayload={(v) => ({
        name: v.name,
        company: v.company,
        position: v.position,
        quote: v.quote,
        rating: v.rating,
        photoMediaId: v.photo?.id ?? null,
        projectId: v.projectId,
        status: v.published ? "published" : "draft",
      })}
      Form={TestimonialForm}
      context={{ projects }}
    />
  );
}
