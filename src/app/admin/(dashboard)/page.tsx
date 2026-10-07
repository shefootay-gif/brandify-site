import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { ctaEvents, leads, leadStatuses, projects, services, testimonials } from "@/server/db/schema";
import { leadStats } from "@/server/services/leads";
import { recentActivity } from "@/server/services/activity";
import { getSettings } from "@/server/services/settings";
import { formatDate } from "@/lib/i18n";
import { leadStatusMeta } from "@/lib/lead-status";
import { PageHeader } from "@/components/admin/shell";
import { Badge, Card, EmptyState } from "@/components/admin/fields";
import { DailyBars } from "@/components/admin/bar-chart";
import { ChartIcon, InboxIcon, InfoIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "نظرة عامة" };

function last30Days(rows: Array<{ day: string; n: number }>) {
  const map = new Map(rows.map((r) => [r.day, r.n]));
  const out = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    out.push({ key, label: new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" }).format(d), value: map.get(key) ?? 0 });
  }
  return out;
}

export default async function OverviewPage() {
  const since30 = new Date(Date.now() - 30 * 86400000);
  const [stats, recent, activity, [proj], [svc], [testi], waDaily, [wa30], settings] = await Promise.all([
    leadStats(),
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(6),
    recentActivity(8),
    db.select({ total: count(), published: sql<number>`count(*) filter (where ${projects.status} = 'published')::int` }).from(projects),
    db.select({ n: count() }).from(services).where(eq(services.visible, true)),
    db.select({ n: count() }).from(testimonials).where(eq(testimonials.status, "published")),
    db
      .select({ day: sql<string>`to_char(date_trunc('day', ${ctaEvents.createdAt}), 'YYYY-MM-DD')`, n: count() })
      .from(ctaEvents)
      .where(sql`${ctaEvents.type} = 'whatsapp' and ${ctaEvents.createdAt} >= ${since30}`)
      .groupBy(sql`1`),
    db.select({ n: count() }).from(ctaEvents).where(sql`${ctaEvents.type} = 'whatsapp' and ${ctaEvents.createdAt} >= ${since30}`),
    getSettings(),
  ]);

  const tiles = [
    { label: "إجمالي الطلبات", value: stats.total, href: "/admin/leads" },
    { label: "طلبات جديدة", value: stats.statusCounts.new, href: "/admin/leads?status=new", accent: stats.statusCounts.new > 0 },
    { label: "نقرات واتساب (30 يومًا)", value: wa30?.n ?? 0, href: undefined },
    { label: "مشاريع منشورة", value: `${proj?.published ?? 0}/${proj?.total ?? 0}`, href: "/admin/work" },
    { label: "خدمات ظاهرة", value: svc?.n ?? 0, href: "/admin/services" },
    { label: "آراء منشورة", value: testi?.n ?? 0, href: "/admin/testimonials" },
  ];
  const analyticsConnected = Boolean(settings.tracking.ga4Id || settings.tracking.gtmId);

  return (
    <>
      <PageHeader title="نظرة عامة" description="ملخص حقيقي من بيانات موقعك: الطلبات، والنقرات على واتساب، والمحتوى المنشور." />

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => {
          const body = (
            <>
              <span className="block text-sm text-ink-600">{tile.label}</span>
              <span className={`t-latin mt-2 block text-3xl font-bold ${tile.accent ? "text-orange-600" : "text-navy-900"}`}>{tile.value}</span>
            </>
          );
          return (
            <li key={tile.label}>
              {tile.href ? (
                <Link href={tile.href} className="block h-full rounded-[var(--radius-lg)] border border-line bg-white p-4 transition-colors hover:border-navy-600/40">
                  {body}
                </Link>
              ) : (
                <div className="h-full rounded-[var(--radius-lg)] border border-line bg-white p-4">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="grid gap-8 md:grid-cols-2">
            <DailyBars title="الطلبات يوميًا — آخر 30 يومًا" unit="طلب" data={last30Days(stats.daily)} />
            <DailyBars title="نقرات واتساب — آخر 30 يومًا" unit="نقرة" data={last30Days(waDaily)} />
          </div>
        </Card>

        <Card title="مراحل الطلبات">
          {stats.total === 0 ? (
            <p className="text-sm text-ink-600">ستظهر هنا مراحل الطلبات عند وصول أول طلب.</p>
          ) : (
            <ul className="space-y-3">
              {leadStatuses.map((s) => {
                const n = stats.statusCounts[s];
                return (
                  <li key={s}>
                    <Link href={`/admin/leads?status=${s}`} className="group block">
                      <div className="flex items-center justify-between text-sm">
                        <Badge tone={leadStatusMeta[s].tone}>{leadStatusMeta[s].label}</Badge>
                        <span className="t-latin font-semibold text-navy-900">{n}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-2">
                        <div className="h-full rounded-full bg-navy-900 group-hover:bg-orange-500" style={{ width: `${(n / stats.total) * 100}%` }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="أحدث الطلبات"
          className="xl:col-span-2"
          actions={
            <Link href="/admin/leads" className="text-sm font-semibold text-orange-700 hover:underline">
              عرض الكل
            </Link>
          }
        >
          {recent.length === 0 ? (
            <EmptyState icon={<InboxIcon size={30} />} title="لا توجد طلبات بعد" body="عندما يرسل زائر نموذج المشروع، سيظهر هنا فورًا." />
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {recent.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-paper/60">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-navy-900">{l.name}</span>
                      <span className="block truncate text-sm text-ink-600">{[l.company, l.serviceLabel].filter(Boolean).join(" · ") || "—"}</span>
                    </span>
                    <Badge tone={leadStatusMeta[l.status].tone}>{leadStatusMeta[l.status].label}</Badge>
                    <span className="text-xs text-ink-600">{formatDate(l.createdAt, "ar")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="آخر النشاطات">
          {activity.length === 0 ? (
            <p className="text-sm text-ink-600">لا يوجد نشاط بعد.</p>
          ) : (
            <ol className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-orange-500" />
                  <span className="min-w-0">
                    <span className="block text-navy-900">{a.summary || a.entityType}</span>
                    <span className="block text-xs text-ink-600">
                      {a.userName ?? "زائر"} · {formatDate(a.createdAt, "ar", true)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-line bg-white p-5">
        {analyticsConnected ? <ChartIcon size={22} className="shrink-0 text-success" /> : <InfoIcon size={22} className="shrink-0 text-info" />}
        <div className="text-sm">
          <p className="font-semibold text-navy-900">{analyticsConnected ? "Google Analytics مربوط" : "Google Analytics غير مربوط بعد"}</p>
          <p className="mt-1 text-ink-600">
            {analyticsConnected
              ? "تفاصيل الزيارات ومصادرها تجدها في لوحة Google Analytics. الأرقام هنا من قاعدة بيانات الموقع مباشرة."
              : "الأرقام هنا حقيقية من قاعدة بيانات الموقع. لإحصاءات الزيارات أضف GA4 أو GTM من الإعدادات ← التتبع."}
          </p>
          {!analyticsConnected && (
            <Link href="/admin/settings?tab=tracking" className="mt-2 inline-block font-semibold text-orange-700 hover:underline">
              إعداد التتبع
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
