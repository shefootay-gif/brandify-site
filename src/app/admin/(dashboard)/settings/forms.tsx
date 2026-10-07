"use client";

import { useMemo, useState } from "react";
import { socialPlatforms, lockedFieldKeys, type FormField, type SiteSettings } from "@/content/settings";
import type { PublicMedia } from "@/server/db/schema/types";
import { Card, LocalizedField, SelectField, Switch, TextField, Badge } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/media-library";
import { FormSection, SaveBar } from "@/components/admin/form-layout";
import { useAdminAction } from "@/components/admin/use-action";
import { useConfirm } from "@/components/admin/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon, InfoIcon, PlusIcon, TrashIcon, socialIcons } from "@/components/ui/icons";
import { formatPhoneDisplay, whatsappLink } from "@/lib/whatsapp";
import { move } from "@/components/admin/list-editors";
import { cn } from "@/lib/utils";
import { changePasswordAction, createUserAction, deleteUserAction, saveSettingsSection, setUserRoleAction, updateProfileAction } from "./actions";

type Section = "brand" | "contact" | "social" | "cta" | "form" | "tracking" | "seo" | "footer";

function useSection<K extends Section>(section: K, initial: SiteSettings[K]) {
  const [v, setV] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = useMemo(() => JSON.stringify(v) !== baseline, [v, baseline]);
  const { run, pending, err, errL } = useAdminAction();
  const save = (payload: unknown = v) => run(() => saveSettingsSection(section, payload), { success: "تم حفظ الإعدادات", onSuccess: () => setBaseline(JSON.stringify(v)) });
  return { v, setV, dirty, pending, save, err, errL };
}

const Shell = ({ children }: { children: React.ReactNode }) => <div className="rounded-[var(--radius-lg)] border border-line bg-white px-5 pt-8 md:px-8">{children}</div>;

// ─── Brand ──────────────────────────────────────────────────
export function BrandForm({ initial, media }: { initial: SiteSettings["brand"]; media: Record<string, PublicMedia> }) {
  const { v, setV, dirty, pending, save, err } = useSection("brand", initial);
  const [logo, setLogo] = useState<PublicMedia | null>(initial.logoMediaId ? media[initial.logoMediaId] ?? null : null);
  const [logoDark, setLogoDark] = useState<PublicMedia | null>(initial.logoOnDarkMediaId ? media[initial.logoOnDarkMediaId] ?? null : null);
  const [favicon, setFavicon] = useState<PublicMedia | null>(initial.faviconMediaId ? media[initial.faviconMediaId] ?? null : null);
  return (
    <Shell>
      <FormSection title="الاسم والشعار">
        <TextField label="اسم البراند" value={v.name} onChange={(name) => setV({ ...v, name })} error={err("name")} />
        <LocalizedField label="الشعار اللفظي (Tagline)" value={v.tagline} onChange={(tagline) => setV({ ...v, tagline })} hint="يظهر كبيرًا في الفوتر." />
      </FormSection>
      <FormSection title="اللوجو والأيقونة" description="اتركها فارغة لاستخدام لوجو Brandify الأصلي المدمج في الموقع.">
        <p className="flex items-start gap-2 rounded-[var(--radius-md)] bg-info-bg p-3 text-sm text-info">
          <InfoIcon size={17} className="mt-0.5 shrink-0" /> اللوجو الأصلي مدمج بالفعل بنسختين (للخلفيات الفاتحة والغامقة). ارفع هنا فقط إذا تغيّر اللوجو.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <MediaPicker label="لوجو للخلفيات الفاتحة" value={logo} onChange={(m) => { setLogo(m); setV({ ...v, logoMediaId: m?.id ?? null }); }} folder="brand" aspect="aspect-[3/1]" />
          <MediaPicker label="لوجو للخلفيات الغامقة" value={logoDark} onChange={(m) => { setLogoDark(m); setV({ ...v, logoOnDarkMediaId: m?.id ?? null }); }} folder="brand" aspect="aspect-[3/1]" />
          <MediaPicker label="أيقونة المتصفح (Favicon)" value={favicon} onChange={(m) => { setFavicon(m); setV({ ...v, faviconMediaId: m?.id ?? null }); }} folder="brand" aspect="aspect-square" hint="صورة مربعة PNG بحجم 512×512 على الأقل." />
        </div>
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={() => save()} />
    </Shell>
  );
}

// ─── Contact ────────────────────────────────────────────────
export function ContactForm({ initial }: { initial: SiteSettings["contact"] }) {
  const { v, setV, dirty, pending, save, err } = useSection("contact", initial);
  return (
    <Shell>
      <FormSection title="بيانات التواصل" description="تظهر في الفوتر وصفحة التواصل وتُستخدم في كل أزرار واتساب.">
        <TextField
          label="رقم واتساب"
          dir="ltr"
          value={v.whatsapp}
          onChange={(whatsapp) => setV({ ...v, whatsapp })}
          error={err("whatsapp")}
          hint={
            <span>
              يُحوَّل تلقائيًا للصيغة الدولية.{" "}
              <a href={whatsappLink(v.whatsapp)} target="_blank" rel="noopener noreferrer" className="t-latin font-semibold text-orange-700 hover:underline" dir="ltr">
                اختبار: {formatPhoneDisplay(v.whatsapp)}
              </a>
            </span>
          }
        />
        <TextField label="البريد الإلكتروني" type="email" dir="ltr" value={v.email} onChange={(email) => setV({ ...v, email })} error={err("email")} />
        <TextField label="رقم هاتف إضافي (اختياري)" dir="ltr" value={v.phone} onChange={(phone) => setV({ ...v, phone })} />
        <LocalizedField label="العنوان" value={v.address} onChange={(address) => setV({ ...v, address })} />
        <TextField label="رابط خرائط جوجل (اختياري)" dir="ltr" value={v.mapUrl} onChange={(mapUrl) => setV({ ...v, mapUrl })} error={err("mapUrl")} placeholder="https://maps.google.com/…" />
        <LocalizedField label="مواعيد العمل (اختياري)" value={v.hours} onChange={(hours) => setV({ ...v, hours })} />
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={() => save()} />
    </Shell>
  );
}

// ─── Social ─────────────────────────────────────────────────
const platformNames: Record<(typeof socialPlatforms)[number], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  x: "X (Twitter)",
  behance: "Behance",
  snapchat: "Snapchat",
  threads: "Threads",
};

export function SocialForm({ initial }: { initial: SiteSettings["social"] }) {
  const { v, setV, dirty, pending, save, err } = useSection("social", initial);
  const unused = socialPlatforms.filter((p) => !v.some((s) => s.platform === p));
  return (
    <Shell>
      <FormSection title="حسابات السوشيال ميديا" description="تظهر في الهيدر (موبايل) والفوتر وصفحة التواصل، وفي بيانات Schema لجوجل.">
        <ul className="space-y-3">
          {v.map((s, i) => {
            const Icon = socialIcons[s.platform];
            return (
              <li key={s.platform} className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-line bg-paper/60 p-3">
                <span className="inline-flex size-10 items-center justify-center rounded-md bg-white text-navy-900">
                  <Icon size={20} />
                </span>
                <span className="t-latin w-24 text-sm font-semibold">{platformNames[s.platform]}</span>
                <div className="min-w-56 flex-1">
                  <TextField label={`رابط ${platformNames[s.platform]}`} dir="ltr" value={s.url} onChange={(url) => setV(v.map((x, j) => (j === i ? { ...x, url } : x)))} error={err(`${i}.url`)} placeholder="https://" />
                </div>
                <Switch label="ظاهر" checked={s.visible} onChange={(visible) => setV(v.map((x, j) => (j === i ? { ...x, visible } : x)))} />
                <div className="flex items-center">
                  <button type="button" aria-label="لأعلى" disabled={i === 0} onClick={() => setV(move(v, i, i - 1))} className="p-1 text-ink-600 disabled:opacity-30"><ArrowUpIcon size={15} /></button>
                  <button type="button" aria-label="لأسفل" disabled={i === v.length - 1} onClick={() => setV(move(v, i, i + 1))} className="p-1 text-ink-600 disabled:opacity-30"><ArrowDownIcon size={15} /></button>
                  <button type="button" aria-label={`حذف ${platformNames[s.platform]}`} onClick={() => setV(v.filter((_, j) => j !== i))} className="p-1 text-ink-400 hover:text-danger"><TrashIcon size={16} /></button>
                </div>
              </li>
            );
          })}
        </ul>
        {unused.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {unused.map((p) => {
              const Icon = socialIcons[p];
              return (
                <Button key={p} variant="subtle" size="sm" onClick={() => setV([...v, { platform: p, url: "", visible: true }])}>
                  <PlusIcon size={14} /> <Icon size={16} /> <span className="t-latin">{platformNames[p]}</span>
                </Button>
              );
            })}
          </div>
        )}
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={() => save()} />
    </Shell>
  );
}

// ─── CTA ────────────────────────────────────────────────────
export function CtaForm({ initial, whatsapp }: { initial: SiteSettings["cta"]; whatsapp: string }) {
  const { v, setV, dirty, pending, save } = useSection("cta", initial);
  return (
    <Shell>
      <FormSection title="زر واتساب الرئيسي" description="يظهر في الهيدر والواجهة والفوتر والزر الثابت على الموبايل.">
        <LocalizedField label="نص الزر" value={v.whatsappLabel} onChange={(whatsappLabel) => setV({ ...v, whatsappLabel })} />
        <LocalizedField label="الرسالة الجاهزة" multiline rows={2} value={v.whatsappMessage} onChange={(whatsappMessage) => setV({ ...v, whatsappMessage })} hint="تُكتب تلقائيًا في واتساب عند الضغط. صفحات الخدمات لها رسائلها الخاصة." />
        <a href={whatsappLink(whatsapp, v.whatsappMessage.ar)} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-orange-700 hover:underline">
          اختبار الرابط بالرسالة العربية ↗
        </a>
        <Switch label="زر واتساب ثابت على الموبايل" hint="يظهر بعد أول شاشة ويختفي قرب نهاية الصفحة." checked={v.stickyWhatsapp} onChange={(stickyWhatsapp) => setV({ ...v, stickyWhatsapp })} />
      </FormSection>
      <FormSection title="زر النموذج">
        <LocalizedField label="نص زر «ابدأ مشروعك»" value={v.formLabel} onChange={(formLabel) => setV({ ...v, formLabel })} />
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={() => save()} />
    </Shell>
  );
}

// ─── Form builder ───────────────────────────────────────────
const typeLabels: Record<FormField["type"], string> = { text: "نص قصير", email: "بريد إلكتروني", tel: "رقم هاتف", textarea: "نص طويل", select: "قائمة اختيار" };
const builtInNames: Record<string, string> = {
  name: "الاسم",
  whatsapp: "واتساب",
  businessType: "نوع البيزنس",
  service: "الخدمة",
  company: "الشركة",
  budget: "الميزانية",
  email: "البريد",
  preferredContact: "طريقة التواصل",
  message: "تفاصيل المشروع",
};

export function LeadFormBuilder({ initial }: { initial: SiteSettings["form"] }) {
  const { v, setV, dirty, pending, save, err } = useSection("form", initial);
  const confirm = useConfirm();
  const setField = (i: number, patch: Partial<FormField>) => setV({ ...v, fields: v.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
  const addCustom = () =>
    setV({
      ...v,
      fields: [
        ...v.fields,
        { key: `custom_${Date.now().toString(36)}`, builtIn: false, type: "text", label: { ar: "سؤال جديد", en: "New question" }, placeholder: { ar: "", en: "" }, enabled: true, required: false, step: 2, options: [] },
      ],
    });

  return (
    <Shell>
      <FormSection title="حقول النموذج" description="رتّب الحقول، غيّر نصوصها، فعّل أو أخفِ أيًّا منها، أو أضف أسئلة جديدة. الاسم وواتساب إجباريان دائمًا.">
        <ol className="space-y-3">
          {v.fields.map((f, i) => {
            const locked = lockedFieldKeys.includes(f.key as never);
            return (
              <li key={f.key} className={cn("rounded-[var(--radius-md)] border p-4", f.enabled ? "border-line bg-white" : "border-dashed border-line bg-paper/60 opacity-80")}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-navy-900">{builtInNames[f.key] ?? f.label.ar}</span>
                  <Badge>{typeLabels[f.type]}</Badge>
                  {locked && <Badge tone="info">إجباري دائمًا</Badge>}
                  {!f.builtIn && <Badge tone="orange">سؤال مخصص</Badge>}
                  <span className="ms-auto flex items-center">
                    <button type="button" aria-label="لأعلى" disabled={i === 0} onClick={() => setV({ ...v, fields: move(v.fields, i, i - 1) })} className="p-1 text-ink-600 disabled:opacity-30"><ArrowUpIcon size={15} /></button>
                    <button type="button" aria-label="لأسفل" disabled={i === v.fields.length - 1} onClick={() => setV({ ...v, fields: move(v.fields, i, i + 1) })} className="p-1 text-ink-600 disabled:opacity-30"><ArrowDownIcon size={15} /></button>
                    {!f.builtIn && (
                      <button
                        type="button"
                        aria-label="حذف السؤال"
                        onClick={async () => {
                          if (await confirm({ title: "حذف السؤال؟", body: "الطلبات القديمة تحتفظ بإجاباتها.", confirmLabel: "حذف", danger: true }))
                            setV({ ...v, fields: v.fields.filter((_, j) => j !== i) });
                        }}
                        className="p-1 text-ink-400 hover:text-danger"
                      >
                        <TrashIcon size={16} />
                      </button>
                    )}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <LocalizedField label="العنوان" value={f.label} onChange={(label) => setField(i, { label })} />
                  <LocalizedField label="نص توضيحي داخل الحقل" value={f.placeholder} onChange={(placeholder) => setField(i, { placeholder })} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {!f.builtIn && (
                    <SelectField
                      label="النوع"
                      value={f.type}
                      onChange={(t) => setField(i, { type: t as FormField["type"] })}
                      options={(["text", "textarea", "select"] as const).map((t) => ({ value: t, label: typeLabels[t] }))}
                      className="w-40"
                    />
                  )}
                  <SelectField label="الخطوة" value={String(f.step)} onChange={(s) => setField(i, { step: s === "1" ? 1 : 2 })} options={[{ value: "1", label: "الخطوة 1" }, { value: "2", label: "الخطوة 2" }]} className="w-32" />
                  {!locked && <Switch label="مفعّل" checked={f.enabled} onChange={(enabled) => setField(i, { enabled })} />}
                  {!locked && <Switch label="إجباري" checked={f.required} onChange={(required) => setField(i, { required })} />}
                </div>
                {f.type === "select" && f.key !== "service" && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-navy-900">الاختيارات</p>
                    {f.options.map((o, oi) => (
                      <div key={oi} className="flex items-start gap-2">
                        <LocalizedField
                          className="flex-1"
                          label={`اختيار ${oi + 1}`}
                          value={o.label}
                          onChange={(label) => setField(i, { options: f.options.map((x, k) => (k === oi ? { ...x, label } : x)) })}
                        />
                        <button type="button" aria-label="حذف الاختيار" onClick={() => setField(i, { options: f.options.filter((_, k) => k !== oi) })} className="mt-8 p-1 text-ink-400 hover:text-danger">
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    ))}
                    <Button variant="subtle" size="sm" onClick={() => setField(i, { options: [...f.options, { value: `opt-${Date.now().toString(36)}`, label: { ar: "", en: "" } }] })}>
                      <PlusIcon size={14} /> إضافة اختيار
                    </Button>
                    {err(`fields.${i}.options`) && <p className="text-xs text-danger">تحقق من الاختيارات.</p>}
                  </div>
                )}
                {f.key === "service" && <p className="mt-3 text-xs text-ink-600">اختيارات هذا الحقل هي الخدمات الظاهرة تلقائيًا.</p>}
              </li>
            );
          })}
        </ol>
        <Button variant="subtle" onClick={addCustom}>
          <PlusIcon size={16} /> إضافة سؤال مخصص
        </Button>
      </FormSection>
      <FormSection title="بعد الإرسال" description="رسالة الشكر ورسالة واتساب التي يرسلها العميل للمتابعة. استخدم {name} و{service}.">
        <LocalizedField label="عنوان رسالة النجاح" value={v.successTitle} onChange={(successTitle) => setV({ ...v, successTitle })} />
        <LocalizedField label="نص رسالة النجاح" multiline rows={2} value={v.successMessage} onChange={(successMessage) => setV({ ...v, successMessage })} />
        <LocalizedField label="رسالة واتساب للمتابعة" multiline rows={2} value={v.whatsappFollowup} onChange={(whatsappFollowup) => setV({ ...v, whatsappFollowup })} />
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={() => save()} />
    </Shell>
  );
}

// ─── Tracking ───────────────────────────────────────────────
export function TrackingForm({ initial }: { initial: SiteSettings["tracking"] }) {
  const { v, setV, dirty, pending, save, err } = useSection("tracking", initial);
  return (
    <Shell>
      <FormSection title="أكواد التتبع" description="أدخل المعرّف فقط (وليس الكود كاملًا). يُحمَّل كل كود فقط عند إدخاله. هذه معرّفات عامة وليست مفاتيح سرية.">
        <TextField label="Google Analytics 4" dir="ltr" placeholder="G-XXXXXXXXXX" value={v.ga4Id} onChange={(ga4Id) => setV({ ...v, ga4Id: ga4Id.trim() })} error={err("ga4Id")} />
        <TextField label="Google Tag Manager" dir="ltr" placeholder="GTM-XXXXXXX" value={v.gtmId} onChange={(gtmId) => setV({ ...v, gtmId: gtmId.trim() })} error={err("gtmId")} />
        <TextField label="Meta Pixel ID" dir="ltr" placeholder="123456789012345" value={v.metaPixelId} onChange={(metaPixelId) => setV({ ...v, metaPixelId: metaPixelId.trim() })} error={err("metaPixelId")} />
        <TextField label="TikTok Pixel ID" dir="ltr" placeholder="CXXXXXXXXXXXXXXXXXXX" value={v.tiktokPixelId} onChange={(tiktokPixelId) => setV({ ...v, tiktokPixelId: tiktokPixelId.trim() })} error={err("tiktokPixelId")} />
        <p className="flex items-start gap-2 rounded-[var(--radius-md)] bg-paper p-3 text-sm text-ink-600">
          <InfoIcon size={17} className="mt-0.5 shrink-0" />
          الأحداث المرسلة تلقائيًا: نقرة واتساب (Contact)، وإرسال النموذج (Lead / generate_lead / SubmitForm). إذا استخدمت GTM مع GA4 معًا، أضف GA4 داخل GTM فقط لتجنب التكرار.
        </p>
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={() => save()} />
    </Shell>
  );
}

// ─── SEO defaults ───────────────────────────────────────────
export function SeoDefaultsForm({ initial, media }: { initial: SiteSettings["seo"]; media: Record<string, PublicMedia> }) {
  const { v, setV, dirty, pending, save, errL } = useSection("seo", initial);
  const [og, setOg] = useState<PublicMedia | null>(initial.ogImageMediaId ? media[initial.ogImageMediaId] ?? null : null);
  return (
    <Shell>
      <FormSection title="SEO الافتراضي">
        <LocalizedField label="عنوان الموقع الافتراضي" value={v.defaultTitle} onChange={(defaultTitle) => setV({ ...v, defaultTitle })} errors={errL("defaultTitle")} />
        <LocalizedField label="قالب العناوين" value={v.titleTemplate} onChange={(titleTemplate) => setV({ ...v, titleTemplate })} hint="%s = عنوان الصفحة. مثال: %s | Brandify" />
        <LocalizedField label="الوصف الافتراضي" multiline rows={3} value={v.defaultDescription} onChange={(defaultDescription) => setV({ ...v, defaultDescription })} />
        <MediaPicker label="صورة المشاركة الافتراضية (1200×630)" value={og} onChange={(m) => { setOg(m); setV({ ...v, ogImageMediaId: m?.id ?? null }); }} folder="seo" aspect="aspect-[1200/630]" />
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={() => save()} />
    </Shell>
  );
}

// ─── Footer ─────────────────────────────────────────────────
export function FooterForm({ initial }: { initial: SiteSettings["footer"] }) {
  const { v, setV, dirty, pending, save } = useSection("footer", initial);
  return (
    <Shell>
      <FormSection title="الفوتر" description="روابط الصفحات والخدمات والتواصل تُبنى تلقائيًا.">
        <LocalizedField label="وصف البراند" multiline rows={3} value={v.description} onChange={(description) => setV({ ...v, description })} />
        <LocalizedField label="ملاحظة بجانب حقوق النشر (اختياري)" value={v.note} onChange={(note) => setV({ ...v, note })} />
      </FormSection>
      <SaveBar dirty={dirty} pending={pending} onSave={() => save()} />
    </Shell>
  );
}

// ─── Account ────────────────────────────────────────────────
export function AccountForm({ name: initialName, email }: { name: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const profile = useAdminAction();
  const password = useAdminAction();
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="الملف الشخصي">
        <TextField label="الاسم" value={name} onChange={setName} error={profile.err("name")} />
        <TextField label="البريد الإلكتروني" value={email} onChange={() => {}} disabled dir="ltr" hint="لتغيير البريد استخدم أمر admin:create من الخادم." />
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" disabled={profile.pending} onClick={() => profile.run(() => updateProfileAction({ name }), { success: "تم الحفظ" })}>
            حفظ
          </Button>
        </div>
      </Card>
      <Card title="تغيير كلمة المرور" description="10 أحرف على الأقل. سيتم تسجيل الخروج من الأجهزة الأخرى.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            password.run(() => changePasswordAction(pw), { success: "تم تغيير كلمة المرور", onSuccess: () => setPw({ currentPassword: "", newPassword: "", confirm: "" }) });
          }}
          className="space-y-4"
        >
          <TextField label="كلمة المرور الحالية" type="password" autoComplete="current-password" dir="ltr" value={pw.currentPassword} onChange={(currentPassword) => setPw({ ...pw, currentPassword })} error={password.err("currentPassword")} />
          <TextField label="كلمة المرور الجديدة" type="password" autoComplete="new-password" dir="ltr" value={pw.newPassword} onChange={(newPassword) => setPw({ ...pw, newPassword })} error={password.err("newPassword")} />
          <TextField label="تأكيد كلمة المرور" type="password" autoComplete="new-password" dir="ltr" value={pw.confirm} onChange={(confirm) => setPw({ ...pw, confirm })} error={password.err("confirm")} />
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" size="sm" disabled={password.pending}>
              {password.pending ? "جارٍ الحفظ…" : "تغيير كلمة المرور"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Users ──────────────────────────────────────────────────
export function UsersManager({ users, currentId }: { users: Array<{ id: string; name: string; email: string; role: string }>; currentId: string }) {
  const [form, setForm] = useState({ name: "", email: "", role: "editor", password: "" });
  const { run, pending, err } = useAdminAction();
  const confirm = useConfirm();
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="المستخدمون" description="المدير يدير كل شيء. المحرر يدير الطلبات والمحتوى فقط (بدون الإعدادات أو حذف الطلبات والخدمات).">
        <ul className="divide-y divide-line">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-navy-900">
                  {u.name} {u.id === currentId && <span className="text-xs font-normal text-ink-600">(أنت)</span>}
                </span>
                <span className="t-latin block truncate text-xs text-ink-600">{u.email}</span>
              </span>
              {u.id === currentId ? (
                <Badge tone="info">{u.role === "admin" ? "مدير" : "محرر"}</Badge>
              ) : (
                <>
                  <select
                    aria-label={`صلاحية ${u.name}`}
                    defaultValue={u.role}
                    onChange={(e) => run(() => setUserRoleAction(u.id, e.target.value as "admin" | "editor"), { success: "تم تحديث الصلاحية" })}
                    className="h-9 rounded-md border border-line px-2 text-sm"
                  >
                    <option value="admin">مدير</option>
                    <option value="editor">محرر</option>
                  </select>
                  <button
                    type="button"
                    aria-label={`حذف ${u.name}`}
                    onClick={async () => {
                      if (await confirm({ title: "حذف المستخدم؟", body: `لن يستطيع ${u.email} الدخول بعد الآن.`, confirmLabel: "حذف", danger: true }))
                        run(() => deleteUserAction(u.id), { success: "تم حذف المستخدم" });
                    }}
                    className="p-1.5 text-ink-400 hover:text-danger"
                  >
                    <TrashIcon size={17} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="إضافة مستخدم">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() => createUserAction(form), { success: "تمت إضافة المستخدم", onSuccess: () => setForm({ name: "", email: "", role: "editor", password: "" }) });
          }}
          className="space-y-4"
        >
          <TextField label="الاسم" value={form.name} onChange={(name) => setForm({ ...form, name })} error={err("name")} />
          <TextField label="البريد الإلكتروني" type="email" dir="ltr" value={form.email} onChange={(email) => setForm({ ...form, email })} error={err("email")} />
          <SelectField label="الصلاحية" value={form.role} onChange={(role) => setForm({ ...form, role })} options={[{ value: "editor", label: "محرر" }, { value: "admin", label: "مدير" }]} />
          <TextField label="كلمة مرور مؤقتة" type="password" autoComplete="new-password" dir="ltr" value={form.password} onChange={(password) => setForm({ ...form, password })} error={err("password")} hint="10 أحرف على الأقل. اطلب من المستخدم تغييرها بعد أول دخول." />
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" size="sm" disabled={pending}>
              إضافة
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
