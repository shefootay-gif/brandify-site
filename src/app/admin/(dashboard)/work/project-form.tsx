"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Localized, PublicMedia } from "@/server/db/schema/types";
import { coverThemes, type ProjectInput } from "@/lib/validation/admin";
import { slugify, cn } from "@/lib/utils";
import { LocalizedField, SelectField, Switch, TextField } from "@/components/admin/fields";
import { CheckboxGroup, TagInput } from "@/components/admin/list-editors";
import { MediaPicker } from "@/components/admin/media-library";
import { GalleryEditor, type GalleryItem } from "@/components/admin/gallery-editor";
import { CharCount, FormSection, SaveBar } from "@/components/admin/form-layout";
import { useAdminAction } from "@/components/admin/use-action";
import { AlertIcon, InfoIcon } from "@/components/ui/icons";
import { saveProjectAction } from "./actions";

const LocalizedRichText = dynamic(() => import("@/components/admin/rich-text"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-[var(--radius-md)] bg-paper-2" />,
});

export type ProjectFormValue = Omit<ProjectInput, "coverMediaId" | "gallery"> & { cover: PublicMedia | null; gallery: GalleryItem[] };

const themeLabels: Record<(typeof coverThemes)[number], string> = {
  navy: "كحلي",
  midnight: "كحلي داكن",
  ocean: "أزرق",
  orange: "برتقالي",
  paper: "فاتح",
};
const themeSwatch: Record<string, string> = { navy: "bg-navy-900", midnight: "bg-navy-950", ocean: "bg-navy-700", orange: "bg-orange-500", paper: "bg-paper-2" };

export function ProjectForm({
  id,
  initial,
  categories,
  services,
}: {
  id: string | null;
  initial: ProjectFormValue;
  categories: Array<{ value: string; label: string }>;
  services: Array<{ value: string; label: string }>;
}) {
  const [v, setV] = useState<ProjectFormValue>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = useMemo(() => JSON.stringify(v) !== baseline, [v, baseline]);
  const { run, pending, err, errL } = useAdminAction();
  const router = useRouter();

  const set = <K extends keyof ProjectFormValue>(key: K, value: ProjectFormValue[K]) => setV((s) => ({ ...s, [key]: value }));
  const setL = (key: "summary" | "industry" | "challenge" | "solution" | "results" | "seoTitle" | "seoDescription") => (value: Localized) => set(key, value);

  const save = () => {
    const payload: ProjectInput = {
      ...v,
      slug: v.slug || slugify(v.title.en || v.title.ar),
      coverMediaId: v.cover?.id ?? null,
      gallery: v.gallery.map((g) => ({ mediaId: g.media.id, caption: g.caption })),
    };
    run(() => saveProjectAction(id, payload), {
      success: id ? "تم حفظ المشروع" : "تم إنشاء المشروع",
      onSuccess: (data) => {
        setBaseline(JSON.stringify(v));
        if (!id && data?.id) router.replace(`/admin/work/${data.id}`);
      },
    });
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-white px-5 pt-8 md:px-8">
      <FormSection title="الأساسيات" description="اسم المشروع ومجاله كما سيظهر في الموقع.">
        <LocalizedField
          label="اسم المشروع"
          required
          value={v.title}
          errors={errL("title")}
          onChange={(title) => {
            setV((s) => ({ ...s, title, slug: slugTouched ? s.slug : slugify(title.en || "") || s.slug }));
          }}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="رابط المشروع (slug)"
            dir="ltr"
            value={v.slug}
            onChange={(s) => {
              setSlugTouched(true);
              set("slug", s.toLowerCase());
            }}
            error={err("slug")}
            hint={<span className="t-latin" dir="ltr">/work/{v.slug || "…"}</span>}
          />
          <TextField label="اسم العميل" value={v.clientName} onChange={(s) => set("clientName", s)} hint="لا يظهر في الموقع إذا كان المشروع «تصوري»." />
        </div>
        <LocalizedField label="المجال / نوع البيزنس" value={v.industry} onChange={setL("industry")} />
        <LocalizedField label="ملخص قصير" value={v.summary} onChange={setL("summary")} multiline rows={2} hint="يظهر في بطاقة المشروع وفي وصف محركات البحث." />
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="السنة" type="number" inputMode="numeric" value={v.year ? String(v.year) : ""} onChange={(s) => set("year", s ? Number(s) : null)} error={err("year")} />
          <SelectField
            label="الحالة"
            value={v.status}
            onChange={(s) => set("status", s as "draft" | "published")}
            options={[
              { value: "draft", label: "مسودة (مخفي)" },
              { value: "published", label: "منشور" },
            ]}
          />
        </div>
        <div className="space-y-4 rounded-[var(--radius-md)] bg-paper p-4">
          <Switch label="مشروع تصوري (Concept)" hint="يظهر بعلامة «مشروع تصوري» ولا يعرض اسم العميل. ألغِ التفعيل عندما يكون المشروع حقيقيًا." checked={v.isConcept} onChange={(b) => set("isConcept", b)} />
          <Switch label="مميز في الصفحة الرئيسية" checked={v.isFeatured} onChange={(b) => set("isFeatured", b)} />
        </div>
      </FormSection>

      <FormSection title="الصور والفيديو" description="الغلاف يظهر في البطاقات وأعلى صفحة المشروع. الصور تُضغط تلقائيًا.">
        <MediaPicker label="صورة الغلاف" value={v.cover} onChange={(m) => set("cover", m)} kind="image" folder="projects" aspect="aspect-[4/3]" />
        {!v.cover && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-navy-900">لون الغلاف البديل (عند عدم وجود صورة)</legend>
            <div className="flex flex-wrap gap-2">
              {coverThemes.map((t) => (
                <label key={t} className={cn("flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500", v.accentColor === t ? "border-navy-900" : "border-line")}>
                  <input type="radio" name="accent" className="sr-only" checked={v.accentColor === t} onChange={() => set("accentColor", t)} />
                  <span className={cn("size-4 rounded-full ring-1 ring-line", themeSwatch[t])} />
                  {themeLabels[t]}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <GalleryEditor value={v.gallery} onChange={(g) => set("gallery", g)} />
      </FormSection>

      <FormSection title="قصة المشروع" description="التحدي ثم الحل. اكتب بوضوح وباختصار.">
        <LocalizedRichText label="نبذة عن المشروع" value={v.description} onChange={(d) => set("description", d)} />
        <LocalizedField label="التحدي" value={v.challenge} onChange={setL("challenge")} multiline rows={4} />
        <LocalizedField label="الحل" value={v.solution} onChange={setL("solution")} multiline rows={4} hint="يظهر في المشاريع العادية. في دراسة الحالة تحل محله الاستراتيجية والإبداع والتنفيذ." />
        <div>
          <LocalizedField label="النتائج" value={v.results} onChange={setL("results")} multiline rows={3} />
          <p className="mt-2 flex items-start gap-2 rounded-[var(--radius-md)] bg-warning-bg p-3 text-xs text-warning">
            <AlertIcon size={16} className="shrink-0" />
            اكتب نتائج حقيقية وقابلة للإثبات فقط. اتركها فارغة إن لم تتوفر — قسم النتائج لا يظهر في الموقع عندما يكون فارغًا.
          </p>
        </div>
      </FormSection>

      <FormSection title="دراسة الحالة" description="فعّلها لعرض المشروع بتفاصيل كاملة في صفحة «دراسات الحالة».">
        <Switch label="عرض كدراسة حالة" checked={v.hasCaseStudy} onChange={(b) => set("hasCaseStudy", b)} />
        {v.hasCaseStudy && (
          <>
            <LocalizedField label="الاستراتيجية" value={v.caseStudy.strategy} onChange={(strategy) => set("caseStudy", { ...v.caseStudy, strategy })} multiline rows={4} />
            <LocalizedField label="الاتجاه الإبداعي" value={v.caseStudy.creative} onChange={(creative) => set("caseStudy", { ...v.caseStudy, creative })} multiline rows={4} />
            <LocalizedField label="التنفيذ" value={v.caseStudy.execution} onChange={(execution) => set("caseStudy", { ...v.caseStudy, execution })} multiline rows={4} />
          </>
        )}
      </FormSection>

      <FormSection title="التصنيف" description="التصنيفات تُستخدم في فلاتر صفحة الأعمال، والخدمات تربط المشروع بصفحات الخدمات.">
        <CheckboxGroup label="التصنيفات" options={categories} value={v.categoryIds} onChange={(ids) => set("categoryIds", ids)} />
        <CheckboxGroup label="الخدمات المقدّمة" options={services} value={v.serviceIds} onChange={(ids) => set("serviceIds", ids)} />
        <TagInput label="الأدوات والتقنيات" value={v.tools} onChange={(t) => set("tools", t)} hint="مثل: Meta Ads Manager, CapCut, Shopify — اضغط Enter بعد كل أداة." />
        <TagInput label="وسوم (Tags)" value={v.tags} onChange={(t) => set("tags", t)} />
      </FormSection>

      <FormSection title="SEO" description="اختياري. يُستخدم اسم المشروع والملخص تلقائيًا إن تُركت فارغة.">
        <LocalizedField label="عنوان الصفحة في جوجل" value={v.seoTitle} onChange={setL("seoTitle")} hint={<CharCount value={v.seoTitle.ar} max={60} />} />
        <LocalizedField label="وصف الصفحة في جوجل" value={v.seoDescription} onChange={setL("seoDescription")} multiline rows={2} hint={<CharCount value={v.seoDescription.ar} max={160} />} />
        <p className="flex items-start gap-2 text-xs text-ink-600">
          <InfoIcon size={15} className="shrink-0" /> صورة المشاركة على السوشيال ميديا هي صورة الغلاف.
        </p>
      </FormSection>

      <SaveBar dirty={dirty} pending={pending} onSave={save} />
    </div>
  );
}
