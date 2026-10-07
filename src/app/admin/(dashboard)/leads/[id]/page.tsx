import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLead } from "@/server/services/leads";
import { getSettings } from "@/server/services/settings";
import { formatDate, pick } from "@/lib/i18n";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import { PageHeader } from "@/components/admin/shell";
import { Card } from "@/components/admin/fields";
import { buttonClasses } from "@/components/ui/button";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { DeleteLeadButton, NoteForm, StatusSelect } from "../lead-controls";

export const metadata: Metadata = { title: "تفاصيل الطلب" };

export default async function LeadPage({ params }: PageProps<"/admin/leads/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [lead, settings] = await Promise.all([getLead(id), getSettings()]);
  if (!lead) notFound();

  const wa = normalizeWhatsappNumber(lead.whatsapp);
  const contactLabels: Record<string, string> = { whatsapp: "واتساب", call: "مكالمة هاتفية", email: "البريد الإلكتروني" };
  const customFields = settings.form.fields.filter((f) => !f.builtIn);
  const rows: Array<[string, string]> = [
    ["الاسم", lead.name],
    ["البراند / الشركة", lead.company],
    ["واتساب", lead.whatsapp],
    ["البريد الإلكتروني", lead.email],
    ["نوع البيزنس", lead.businessType],
    ["الخدمة", lead.serviceLabel],
    ["الميزانية", lead.budget],
    ["طريقة التواصل المفضلة", contactLabels[lead.preferredContact] ?? lead.preferredContact],
    ...Object.entries(lead.extra).map(([k, v]): [string, string] => [pick(customFields.find((f) => f.key === k)?.label, "ar") || k, v]),
  ];
  const utm = Object.entries(lead.utm).filter(([, v]) => v);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/leads", label: "الطلبات" }}
        title={lead.name}
        description={`وصل ${formatDate(lead.createdAt, "ar", true)}`}
        actions={<StatusSelect id={lead.id} status={lead.status} />}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent(`مرحبًا ${lead.name}، معك Brandify بخصوص طلبك من الموقع.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "md")}
        >
          <WhatsAppIcon size={19} /> مراسلة على واتساب
        </a>
        <a href={`tel:+${wa}`} className={buttonClasses("subtle", "md")}>
          <PhoneIcon size={18} /> اتصال
        </a>
        {lead.email && (
          <a href={`mailto:${lead.email}`} className={buttonClasses("subtle", "md")}>
            <MailIcon size={18} /> بريد إلكتروني
          </a>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="بيانات الطلب">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-ink-600">{k}</dt>
                  <dd className="mt-0.5 font-medium text-navy-900 [overflow-wrap:anywhere]">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card title="تفاصيل المشروع">
            <p className="whitespace-pre-line leading-relaxed text-navy-900">{lead.message || "لم يكتب العميل تفاصيل."}</p>
          </Card>
          <Card title="الملاحظات الداخلية" description="لا يراها العميل. استخدمها لتتبع ما تم الاتفاق عليه.">
            <NoteForm id={lead.id} />
            {lead.notes.length > 0 && (
              <ol className="space-y-3 border-t border-line pt-4">
                {lead.notes.map((n) => (
                  <li key={n.id} className="rounded-[var(--radius-md)] bg-paper p-3">
                    <p className="whitespace-pre-line text-sm text-navy-900">{n.body}</p>
                    <p className="mt-1.5 text-xs text-ink-600">
                      {n.author ?? "—"} · {formatDate(n.createdAt, "ar", true)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="المصدر">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-ink-600">الصفحة</dt>
                <dd className="t-latin mt-0.5 font-medium [overflow-wrap:anywhere]" dir="ltr">{lead.sourcePage || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-600">النموذج</dt>
                <dd className="t-latin mt-0.5 font-medium" dir="ltr">{lead.sourceCta || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-600">لغة الزائر</dt>
                <dd className="mt-0.5 font-medium">{lead.locale === "en" ? "English" : "العربية"}</dd>
              </div>
              {utm.length > 0 && (
                <div>
                  <dt className="text-xs text-ink-600">UTM (حملة إعلانية)</dt>
                  <dd className="mt-1 space-y-1">
                    {utm.map(([k, v]) => (
                      <span key={k} className="t-latin block text-xs" dir="ltr">
                        utm_{k}: <strong>{v}</strong>
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
          <div className="flex justify-end">
            <DeleteLeadButton id={lead.id} name={lead.name} />
          </div>
        </div>
      </div>
    </>
  );
}
