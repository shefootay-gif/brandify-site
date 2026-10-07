"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PublicMedia } from "@/server/db/schema/types";
import type { ServiceInput } from "@/lib/validation/admin";
import { slugify, cn } from "@/lib/utils";
import { LocalizedField, Switch, TextField } from "@/components/admin/fields";
import { LocalizedItemsEditor, LocalizedListEditor } from "@/components/admin/list-editors";
import { MediaPicker } from "@/components/admin/media-library";
import { CharCount, FormSection, SaveBar } from "@/components/admin/form-layout";
import { useAdminAction } from "@/components/admin/use-action";
import { Glyph } from "@/components/site/glyphs";
import { saveServiceAction } from "./actions";

export type ServiceFormValue = Omit<ServiceInput, "coverMediaId"> & { cover: PublicMedia | null };

const icons = [
  { value: "bubble", label: "فقاعة (نتكلم)" },
  { value: "play", label: "تشغيل (نصنع)" },
  { value: "tag", label: "بطاقة سعر (نبيع)" },
] as const;

export function ServiceForm({ id, initial, faqCount }: { id: string | null; initial: ServiceFormValue; faqCount: number }) {
  const [v, setV] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = useMemo(() => JSON.stringify(v) !== baseline, [v, baseline]);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const { run, pending, err, errL } = useAdminAction();
  const router = useRouter();
  const set = <K extends keyof ServiceFormValue>(k: K, val: ServiceFormValue[K]) => setV((s) => ({ ...s, [k]: val }));

  const save = () =>
    run(() => saveServiceAction(id, { ...v, slug: v.slug || slugify(v.title.en || v.title.ar), coverMediaId: v.cover?.id ?? null }), {
      success: "تم حفظ الخدمة",
      onSuccess: (data) => {
        setBaseline(JSON.stringify(v));
        if (!id && data?.id) router.replace(`/admin/services/${data.id}`);
      },
    });

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-white px-5 pt-8 md:px-8">
      <FormSection title="الأساسيات">
        <LocalizedField
          label="اسم الخدمة"
          required
          value={v.title}
          errors={errL("title")}
          onChange={(title) => setV((s) => ({ ...s, title, slug: slugTouched ? s.slug : slugify(title.en) || s.slug }))}
        />
        <TextField
          label="رابط الصفحة (slug)"
          dir="ltr"
          value={v.slug}
          error={err("slug")}
          onChange={(s) => {
            setSlugTouched(true);
            set("slug", s.toLowerCase());
          }}
          hint={<span className="t-latin" dir="ltr">/services/{v.slug || "…"}</span>}
        />
        <LocalizedField label="وصف قصير" required value={v.shortDescription} errors={errL("shortDescription")} onChange={(x) => set("shortDescription", x)} multiline rows={2} hint="يظهر في قائمة الخدمات وأعلى صفحة الخدمة." />
        <LocalizedField label="الوصف الكامل" value={v.body} onChange={(x) => set("body", x)} multiline rows={5} />
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-navy-900">الرمز (من شكل اللوجو)</legend>
          <div className="flex flex-wrap gap-2">
            {icons.map((ic) => (
              <label key={ic.value} className={cn("flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500", v.icon === ic.value ? "border-navy-900 bg-navy-50" : "border-line")}>
                <input type="radio" name="icon" className="sr-only" checked={v.icon === ic.value} onChange={() => set("icon", ic.value)} />
                <Glyph name={ic.value} size={22} className="text-navy-900" />
                {ic.label}
              </label>
            ))}
          </div>
        </fieldset>
        <MediaPicker label="صورة (اختيارية)" value={v.cover} onChange={(m) => set("cover", m)} folder="services" aspect="aspect-[4/3]" />
        <Switch label="ظاهرة في الموقع" checked={v.visible} onChange={(b) => set("visible", b)} />
      </FormSection>

      <FormSection title="ماذا تشمل" description="الخدمات الفرعية داخل هذا القسم.">
        <LocalizedItemsEditor label="الخدمات الفرعية" value={v.subServices} onChange={(x) => set("subServices", x)} addLabel="إضافة خدمة فرعية" />
      </FormSection>

      <FormSection title="الفوائد والتسليمات">
        <LocalizedItemsEditor label="ماذا يكسب العميل" value={v.benefits} onChange={(x) => set("benefits", x)} addLabel="إضافة فائدة" />
        <LocalizedListEditor label="ماذا نسلّم" value={v.deliverables} onChange={(x) => set("deliverables", x)} addLabel="إضافة عنصر" />
      </FormSection>

      <FormSection title="خطوات العمل">
        <LocalizedItemsEditor label="الخطوات" value={v.process} onChange={(x) => set("process", x)} max={10} addLabel="إضافة خطوة" />
      </FormSection>

      <FormSection title="الدعوة لاتخاذ إجراء" description="نص الزر ورسالة واتساب الجاهزة الخاصة بهذه الخدمة.">
        <LocalizedField label="نص زر الواتساب" value={v.ctaLabel} onChange={(x) => set("ctaLabel", x)} />
        <LocalizedField label="رسالة واتساب الجاهزة" value={v.whatsappMessage} onChange={(x) => set("whatsappMessage", x)} multiline rows={2} hint="الرسالة التي تُكتب تلقائيًا عندما يضغط الزائر زر واتساب في هذه الصفحة." />
      </FormSection>

      <FormSection title="الأسئلة الشائعة">
        <p className="text-sm text-ink-600">
          لهذه الخدمة {faqCount} سؤال.{" "}
          {id ? (
            <Link href={`/admin/faqs?service=${id}`} className="font-semibold text-orange-700 hover:underline">
              إدارة أسئلة هذه الخدمة
            </Link>
          ) : (
            "احفظ الخدمة أولًا ثم أضف أسئلتها من صفحة الأسئلة الشائعة."
          )}
        </p>
      </FormSection>

      <FormSection title="SEO">
        <LocalizedField label="عنوان الصفحة في جوجل" value={v.seoTitle} onChange={(x) => set("seoTitle", x)} hint={<CharCount value={v.seoTitle.ar} max={60} />} />
        <LocalizedField label="وصف الصفحة في جوجل" value={v.seoDescription} onChange={(x) => set("seoDescription", x)} multiline rows={2} hint={<CharCount value={v.seoDescription.ar} max={160} />} />
      </FormSection>

      <SaveBar dirty={dirty} pending={pending} onSave={save} />
    </div>
  );
}
