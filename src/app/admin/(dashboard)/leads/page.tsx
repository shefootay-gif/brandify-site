import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/server/db";
import { leadStatuses, services } from "@/server/db/schema";
import { listLeads, type LeadFilters } from "@/server/services/leads";
import { formatDate, pick } from "@/lib/i18n";
import { leadStatusMeta } from "@/lib/lead-status";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import { PageHeader } from "@/components/admin/shell";
import { EmptyState, inputClass } from "@/components/admin/fields";
import { buttonClasses } from "@/components/ui/button";
import { InboxIcon, SearchIcon, UploadIcon, WhatsAppIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { StatusSelect } from "./lead-controls";

export const metadata: Metadata = { title: "الطلبات" };

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const sp = await searchParams;
  const filters: LeadFilters = {
    q: str(sp.q)?.slice(0, 100),
    status: str(sp.status),
    service: str(sp.service)?.match(/^[0-9a-f-]{36}$/i) ? str(sp.service) : undefined,
    range: (["7d", "30d", "90d", "all"] as const).find((r) => r === sp.range) ?? "all",
    sort: sp.sort === "oldest" ? "oldest" : "newest",
    page: Math.max(1, Number(str(sp.page)) || 1),
  };
  const [result, serviceList] = await Promise.all([
    listLeads(filters),
    db.select({ id: services.id, title: services.title }).from(services).orderBy(asc(services.sortOrder)),
  ]);
  const hasFilters = Boolean(filters.q || filters.status || filters.service || filters.range !== "all");
  const qs = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...filters, ...patch } as Record<string, unknown>;
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "" && !(k === "range" && v === "all") && !(k === "sort" && v === "newest") && !(k === "page" && v === 1)) p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const exportQs = qs({ page: undefined });

  return (
    <>
      <PageHeader
        title="الطلبات"
        description="كل طلب يصل من نموذج الموقع يُحفظ هنا. غيّر الحالة لمتابعة كل عميل حتى الاتفاق."
        actions={
          <a href={`/api/admin/leads/export${exportQs}`} className={buttonClasses("subtle", "sm")}>
            <UploadIcon size={16} className="rotate-180" /> تصدير CSV
          </a>
        }
      />

      {/* Status quick filters */}
      <nav aria-label="تصفية حسب الحالة" className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {[undefined, ...leadStatuses].map((s) => {
          const active = filters.status === s || (!s && !filters.status);
          return (
            <Link
              key={s ?? "all"}
              href={`/admin/leads${qs({ status: s, page: 1 })}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium",
                active ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-navy-900 hover:border-navy-600/40",
              )}
            >
              {s ? leadStatusMeta[s].label : "الكل"}
            </Link>
          );
        })}
      </nav>

      <form className="mb-5 flex flex-wrap gap-2 rounded-[var(--radius-lg)] border border-line bg-white p-3 [&>select]:w-auto [&>select]:min-w-0 [&>select]:max-w-full [&>select]:flex-1 sm:[&>select]:flex-none">
        {filters.status && <input type="hidden" name="status" value={filters.status} />}
        <div className="relative min-w-56 flex-[2_1_16rem]">
          <SearchIcon size={17} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input name="q" defaultValue={filters.q} type="search" placeholder="بحث بالاسم، الشركة، الرقم، البريد…" aria-label="بحث في الطلبات" className={cn(inputClass, "h-10 ps-9")} />
        </div>
        <select name="service" defaultValue={filters.service ?? ""} aria-label="الخدمة" className={cn(inputClass, "h-10")}>
          <option value="">كل الخدمات</option>
          {serviceList.map((s) => (
            <option key={s.id} value={s.id}>
              {pick(s.title, "ar")}
            </option>
          ))}
        </select>
        <select name="range" defaultValue={filters.range} aria-label="الفترة" className={cn(inputClass, "h-10")}>
          <option value="all">كل الأوقات</option>
          <option value="7d">آخر 7 أيام</option>
          <option value="30d">آخر 30 يومًا</option>
          <option value="90d">آخر 90 يومًا</option>
        </select>
        <select name="sort" defaultValue={filters.sort} aria-label="الترتيب" className={cn(inputClass, "h-10")}>
          <option value="newest">الأحدث أولًا</option>
          <option value="oldest">الأقدم أولًا</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className={buttonClasses("secondary", "sm", "h-10 px-5")}>
            تطبيق
          </button>
          {hasFilters && (
            <Link href="/admin/leads" className={buttonClasses("ghost", "sm", "h-10")}>
              مسح
            </Link>
          )}
        </div>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<InboxIcon size={32} />}
          title={hasFilters ? "لا توجد نتائج مطابقة" : "لا توجد طلبات بعد"}
          body={hasFilters ? "جرّب تغيير البحث أو الفلاتر." : "عندما يرسل زائر نموذج «ابدأ مشروعك»، سيظهر الطلب هنا مع كل تفاصيله."}
        />
      ) : (
        <>
          <p className="mb-2 text-sm text-ink-600">
            <span className="t-latin">{result.total}</span> طلب
          </p>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white lg:block">
            <table className="w-full text-sm">
              <thead className="bg-paper text-ink-600">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start font-medium">العميل</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">الخدمة</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">الميزانية</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">المصدر</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">التاريخ</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">الحالة</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">إجراءات</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.items.map((l) => (
                  <tr key={l.id} className={cn("hover:bg-paper/60", l.status === "new" && "bg-orange-50/50")}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${l.id}`} className="font-semibold text-navy-900 hover:text-orange-700">
                        {l.name}
                      </Link>
                      <span className="block text-xs text-ink-600">{l.company || l.businessType || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-navy-900">{l.serviceLabel || "—"}</td>
                    <td className="px-4 py-3 text-ink-600">{l.budget || "—"}</td>
                    <td className="px-4 py-3 text-xs text-ink-600">
                      <span className="t-latin block max-w-40 truncate" dir="ltr">{l.utm.source ? `utm: ${l.utm.source}` : l.sourcePage || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-600">{formatDate(l.createdAt, "ar", true)}</td>
                    <td className="px-4 py-3">
                      <StatusSelect id={l.id} status={l.status} label={`حالة طلب ${l.name}`} />
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${normalizeWhatsappNumber(l.whatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`مراسلة ${l.name} على واتساب`}
                        className="inline-flex size-9 items-center justify-center rounded-md text-success hover:bg-success-bg"
                      >
                        <WhatsAppIcon size={19} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {result.items.map((l) => (
              <li key={l.id} className={cn("rounded-[var(--radius-lg)] border border-line bg-white p-4", l.status === "new" && "border-orange-500/40")}>
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/admin/leads/${l.id}`} className="min-w-0">
                    <span className="block font-semibold text-navy-900">{l.name}</span>
                    <span className="block truncate text-sm text-ink-600">{[l.serviceLabel, l.budget].filter(Boolean).join(" · ") || "—"}</span>
                  </Link>
                  <a
                    href={`https://wa.me/${normalizeWhatsappNumber(l.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`مراسلة ${l.name} على واتساب`}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-success-bg text-success"
                  >
                    <WhatsAppIcon size={20} />
                  </a>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <StatusSelect id={l.id} status={l.status} label={`حالة طلب ${l.name}`} />
                  <span className="text-xs text-ink-600">{formatDate(l.createdAt, "ar")}</span>
                </div>
              </li>
            ))}
          </ul>

          {result.pages > 1 && (
            <nav aria-label="الصفحات" className="mt-6 flex items-center justify-center gap-2">
              {result.page > 1 && (
                <Link href={`/admin/leads${qs({ page: result.page - 1 })}`} className={buttonClasses("subtle", "sm")}>
                  السابق
                </Link>
              )}
              <span className="t-latin px-3 text-sm text-ink-600">
                {result.page} / {result.pages}
              </span>
              {result.page < result.pages && (
                <Link href={`/admin/leads${qs({ page: result.page + 1 })}`} className={buttonClasses("subtle", "sm")}>
                  التالي
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}
