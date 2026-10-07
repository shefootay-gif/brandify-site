"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { AboutContent, BlockKey, HomeContent, LegalContent, ProcessContent } from "@/content/blocks";
import type { PublicMedia } from "@/server/db/schema/types";
import { LocalizedField, Switch, TextField } from "@/components/admin/fields";
import { CheckboxGroup, LocalizedItemsEditor } from "@/components/admin/list-editors";
import { MediaListPicker } from "@/components/admin/media-list-picker";
import { FormSection, SaveBar } from "@/components/admin/form-layout";
import { useAdminAction } from "@/components/admin/use-action";
import { saveBlockAction } from "./actions";

const LocalizedRichText = dynamic(() => import("@/components/admin/rich-text"), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-[var(--radius-md)] bg-paper-2" />,
});

function useBlockForm<T>(key: BlockKey, initial: T, serialize: (v: T) => unknown = (v) => v) {
  const [v, setV] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = useMemo(() => JSON.stringify(v) !== baseline, [v, baseline]);
  const { run, pending, errL, err } = useAdminAction();
  const save = () => run(() => saveBlockAction(key, serialize(v)), { success: "تم الحفظ — التغييرات ظاهرة في الموقع الآن", onSuccess: () => setBaseline(JSON.stringify(v)) });
  return { v, setV, dirty, pending, save, errL, err };
}

const Shell = ({ children }: { children: React.ReactNode }) => <div className="rounded-[var(--radius-lg)] border border-line bg-white px-5 pt-8 md:px-8">{children}</div>;

// ─── Home ───────────────────────────────────────────────────
type HomeValue = Omit<HomeContent, "reels"> & { reels: Omit<HomeContent["reels"], "mediaIds"> & { media: PublicMedia[] } };

export function HomeForm({ initial, services }: { initial: HomeValue; services: Array<{ value: string; label: string }> }) {
  const { v, setV, dirty, pending, save, errL } = useBlockForm<HomeValue>("home", initial, (val) => ({
    ...val,
    reels: { title: val.reels.title, subtitle: val.reels.subtitle, visible: val.reels.visible, mediaIds: val.reels.media.map((m) => m.id) },
  }));
  const sec = <K extends keyof HomeValue>(k: K, patch: Partial<HomeValue[K]>) => setV((s) => ({ ...s, [k]: { ...s[k], ...patch } }));

  return (
    <Shell>
      <FormSection title="الواجهة (Hero)" description="أول ما يراه الزائر. اجعل العنوان قصيرًا وواضحًا.">
        <LocalizedField label="سطر تمهيدي" value={v.hero.eyebrow} onChange={(x) => sec("hero", { eyebrow: x })} />
        <LocalizedField label="العنوان الرئيسي" value={v.hero.title} onChange={(x) => sec("hero", { title: x })} errors={errL("hero.title")} />
        <LocalizedField label="الوصف" multiline rows={2} value={v.hero.subtitle} onChange={(x) => sec("hero", { subtitle: x })} />
        <LocalizedField label="نص الزر الثانوي" value={v.hero.secondaryCta} onChange={(x) => sec("hero", { secondaryCta: x })} hint="الزر الرئيسي هو زر واتساب ويُعدَّل من الإعدادات." />
        <div className="grid gap-3 md:grid-cols-3">
          {v.hero.motto.map((m, i) => (
            <LocalizedField key={i} label={`كلمة الشعار ${i + 1}`} value={m} onChange={(x) => sec("hero", { motto: v.hero.motto.map((y, j) => (j === i ? x : y)) })} />
          ))}
        </div>
      </FormSection>

      <FormSection title="شريط الريلز" description="فيديوهات حقيقية من شغلك (رأسية 9:16 أفضل). يختفي القسم إذا لم تُضف ملفات.">
        <Switch label="إظهار القسم" checked={v.reels.visible} onChange={(b) => sec("reels", { visible: b })} />
        <LocalizedField label="العنوان" value={v.reels.title} onChange={(x) => sec("reels", { title: x })} />
        <LocalizedField label="الوصف" value={v.reels.subtitle} onChange={(x) => sec("reels", { subtitle: x })} />
        <MediaListPicker label="الفيديوهات / الصور" value={v.reels.media} onChange={(m) => sec("reels", { media: m.slice(0, 12) })} folder="reels" hint="حتى 12 ملفًا." />
      </FormSection>

      <FormSection title="نتكلم. نصنع. نبيع." description="الأعمدة الثلاثة وربطها بالخدمات.">
        <LocalizedField label="العنوان" value={v.pillars.title} onChange={(x) => sec("pillars", { title: x })} />
        <LocalizedField label="الوصف" multiline rows={2} value={v.pillars.subtitle} onChange={(x) => sec("pillars", { subtitle: x })} />
        {v.pillars.items.map((p, i) => (
          <div key={i} className="space-y-3 rounded-[var(--radius-md)] border border-line bg-paper/60 p-4">
            <LocalizedField label={`الكلمة ${i + 1}`} value={p.verb} onChange={(x) => sec("pillars", { items: v.pillars.items.map((y, j) => (j === i ? { ...y, verb: x } : y)) })} />
            <LocalizedField label="الوصف" multiline rows={2} value={p.description} onChange={(x) => sec("pillars", { items: v.pillars.items.map((y, j) => (j === i ? { ...y, description: x } : y)) })} />
            <CheckboxGroup label="الخدمات المرتبطة" options={services} value={p.serviceSlugs} onChange={(slugs) => sec("pillars", { items: v.pillars.items.map((y, j) => (j === i ? { ...y, serviceSlugs: slugs } : y)) })} />
          </div>
        ))}
      </FormSection>

      <FormSection title="لمن نعمل" description="أنواع البيزنس. ضع المجالات التي لك فيها شغل حقيقي أولًا.">
        <Switch label="إظهار القسم" checked={v.industries.visible} onChange={(b) => sec("industries", { visible: b })} />
        <LocalizedField label="العنوان" value={v.industries.title} onChange={(x) => sec("industries", { title: x })} />
        <LocalizedField label="الوصف" multiline rows={2} value={v.industries.subtitle} onChange={(x) => sec("industries", { subtitle: x })} />
        <LocalizedItemsEditor label="المجالات" value={v.industries.items} onChange={(items) => sec("industries", { items })} max={12} addLabel="إضافة مجال" titleLabel="المجال" />
      </FormSection>

      <FormSection title="عناوين الأقسام">
        <LocalizedField label="الأعمال — العنوان" value={v.work.title} onChange={(x) => sec("work", { title: x })} />
        <LocalizedField label="الأعمال — الوصف" value={v.work.subtitle} onChange={(x) => sec("work", { subtitle: x })} />
        <LocalizedField label="طريقة العمل — العنوان" value={v.process.title} onChange={(x) => sec("process", { title: x })} />
        <LocalizedField label="طريقة العمل — الوصف" value={v.process.subtitle} onChange={(x) => sec("process", { subtitle: x })} hint="خطوات العمل نفسها تُعدَّل من تبويب «طريقة العمل»." />
        <LocalizedField label="آراء العملاء — العنوان" value={v.testimonials.title} onChange={(x) => sec("testimonials", { title: x })} />
        <LocalizedField label="لوجوهات العملاء — العنوان" value={v.clients.title} onChange={(x) => sec("clients", { title: x })} />
        <LocalizedField label="الأسئلة الشائعة — العنوان" value={v.faq.title} onChange={(x) => sec("faq", { title: x })} />
      </FormSection>

      <FormSection title="قسم المؤسس" description="يظهر عندما يكون المؤسس ظاهرًا في صفحة «الفريق والمؤسس».">
        <LocalizedField label="العنوان" value={v.founder.title} onChange={(x) => sec("founder", { title: x })} />
        <LocalizedField label="اقتباس المؤسس" multiline rows={3} value={v.founder.quote} onChange={(x) => sec("founder", { quote: x })} />
      </FormSection>

      <FormSection title="الدعوة الختامية" description="آخر قسم قبل الفوتر في أغلب الصفحات.">
        <LocalizedField label="العنوان" value={v.finalCta.title} onChange={(x) => sec("finalCta", { title: x })} />
        <LocalizedField label="الوصف" multiline rows={2} value={v.finalCta.subtitle} onChange={(x) => sec("finalCta", { subtitle: x })} />
      </FormSection>

      <SaveBar dirty={dirty} pending={pending} onSave={save} />
    </Shell>
  );
}

// ─── Process ────────────────────────────────────────────────
export function ProcessForm({ initial }: { initial: ProcessContent }) {
  const { v, setV, dirty, pending, save } = useBlockForm<ProcessContent>("process", initial);
  return (
    <Shell>
      <FormSection title="صفحة طريقة العمل" description="الخطوات تظهر في الرئيسية وصفحة طريقة العمل (3 إلى 8 خطوات).">
        <LocalizedField label="العنوان" value={v.title} onChange={(x) => setV({ ...v, title: x })} />
        <LocalizedField label="الوصف" multiline rows={2} value={v.subtitle} onChange={(x) => setV({ ...v, subtitle: x })} />
        <LocalizedItemsEditor label="الخطوات" value={v.steps} onChange={(steps) => setV({ ...v, steps })} max={8} addLabel="إضافة خطوة" />
        <LocalizedField label="وعد ختامي" multiline rows={2} value={v.promise} onChange={(x) => setV({ ...v, promise: x })} />
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={save} />
    </Shell>
  );
}

// ─── About ──────────────────────────────────────────────────
export function AboutForm({ initial }: { initial: AboutContent }) {
  const { v, setV, dirty, pending, save } = useBlockForm<AboutContent>("about", initial);
  const sec = <K extends keyof AboutContent>(k: K, patch: Partial<AboutContent[K]>) => setV((s) => ({ ...s, [k]: { ...s[k], ...patch } }));
  return (
    <Shell>
      <FormSection title="أعلى الصفحة">
        <LocalizedField label="العنوان" value={v.hero.title} onChange={(x) => sec("hero", { title: x })} />
        <LocalizedField label="الوصف" multiline rows={2} value={v.hero.subtitle} onChange={(x) => sec("hero", { subtitle: x })} />
      </FormSection>
      <FormSection title="من نحن / ماذا نفعل" description="بدون تاريخ أو إنجازات غير حقيقية.">
        <LocalizedField label="من نحن — العنوان" value={v.who.title} onChange={(x) => sec("who", { title: x })} />
        <LocalizedField label="من نحن — النص" multiline rows={4} value={v.who.body} onChange={(x) => sec("who", { body: x })} />
        <LocalizedField label="ماذا نفعل — العنوان" value={v.what.title} onChange={(x) => sec("what", { title: x })} />
        <LocalizedField label="ماذا نفعل — النص" multiline rows={4} value={v.what.body} onChange={(x) => sec("what", { body: x })} />
      </FormSection>
      <FormSection title="لماذا Brandify">
        <LocalizedField label="العنوان" value={v.why.title} onChange={(x) => sec("why", { title: x })} />
        <LocalizedItemsEditor label="الأسباب" value={v.why.items} onChange={(items) => sec("why", { items })} max={8} addLabel="إضافة سبب" />
      </FormSection>
      <FormSection title="كيف نفكر">
        <LocalizedField label="العنوان" value={v.principles.title} onChange={(x) => sec("principles", { title: x })} />
        <LocalizedItemsEditor label="المبادئ" value={v.principles.items} onChange={(items) => sec("principles", { items })} max={8} addLabel="إضافة مبدأ" />
      </FormSection>
      <FormSection title="ما الذي يميزنا">
        <LocalizedField label="العنوان" value={v.difference.title} onChange={(x) => sec("difference", { title: x })} />
        <LocalizedField label="النص" multiline rows={4} value={v.difference.body} onChange={(x) => sec("difference", { body: x })} />
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={save} />
    </Shell>
  );
}

// ─── Legal ──────────────────────────────────────────────────
export function LegalForm({ blockKey, initial }: { blockKey: "legal.privacy" | "legal.terms"; initial: LegalContent }) {
  const { v, setV, dirty, pending, save, err } = useBlockForm<LegalContent>(blockKey, initial);
  return (
    <Shell>
      <FormSection title="الصفحة" description="يُنصح بمراجعة النصوص القانونية مع مختص قبل الإطلاق.">
        <LocalizedField label="العنوان" value={v.title} onChange={(x) => setV({ ...v, title: x })} />
        <TextField label="تاريخ آخر تحديث" type="date" value={v.updatedAt} onChange={(x) => setV({ ...v, updatedAt: x })} error={err("updatedAt")} />
        <LocalizedRichText label="المحتوى" value={v.body} onChange={(body) => setV({ ...v, body })} />
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={save} />
    </Shell>
  );
}
