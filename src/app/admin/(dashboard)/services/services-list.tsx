"use client";

import Link from "next/link";
import { SortableList } from "@/components/admin/sortable-list";
import { Badge, EmptyState } from "@/components/admin/fields";
import { useAdminAction } from "@/components/admin/use-action";
import { useConfirm } from "@/components/admin/dialog";
import { Glyph } from "@/components/site/glyphs";
import { EditIcon, ExternalIcon, EyeIcon, EyeOffIcon, LayersIcon, TrashIcon } from "@/components/ui/icons";
import { deleteServiceAction, reorderServicesAction, setServiceVisibleAction } from "./actions";

type Item = { id: string; slug: string; icon: string; title: string; titleEn: string; visible: boolean; subCount: number };

export function ServicesList({ items }: { items: Item[] }) {
  const { run, pending } = useAdminAction();
  const confirm = useConfirm();
  if (!items.length) return <EmptyState icon={<LayersIcon size={32} />} title="لا توجد خدمات" body="أضف أول خدمة لتظهر في الموقع." />;
  return (
    <SortableList
      label="ترتيب الخدمات"
      items={items}
      onReorder={reorderServicesAction}
      renderItem={(s) => (
        <div className="flex items-center gap-3">
          <Glyph name={s.icon} size={30} className="shrink-0 text-navy-900" />
          <div className="min-w-0 flex-1">
            <Link href={`/admin/services/${s.id}`} className="font-semibold text-navy-900 hover:text-orange-700">
              {s.title}
            </Link>
            <span className="t-latin ms-2 text-sm text-ink-600">{s.titleEn}</span>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-600">
              {!s.visible && <Badge>مخفية</Badge>}
              <span>{s.subCount} خدمات فرعية</span>
            </div>
          </div>
          <button
            type="button"
            disabled={pending}
            aria-label={s.visible ? "إخفاء من الموقع" : "إظهار في الموقع"}
            title={s.visible ? "إخفاء" : "إظهار"}
            onClick={() => run(() => setServiceVisibleAction(s.id, !s.visible), { success: s.visible ? "أصبحت مخفية" : "أصبحت ظاهرة" })}
            className="inline-flex size-9 items-center justify-center rounded-md text-ink-600 hover:bg-paper-2"
          >
            {s.visible ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
          </button>
          {s.visible && (
            <a href={`/ar/services/${s.slug}`} target="_blank" rel="noopener" aria-label="عرض في الموقع" className="inline-flex size-9 items-center justify-center rounded-md text-ink-600 hover:bg-paper-2">
              <ExternalIcon size={17} />
            </a>
          )}
          <Link href={`/admin/services/${s.id}`} aria-label={`تعديل ${s.title}`} className="inline-flex size-9 items-center justify-center rounded-md text-ink-600 hover:bg-paper-2">
            <EditIcon size={17} />
          </Link>
          <button
            type="button"
            aria-label={`حذف ${s.title}`}
            onClick={async () => {
              const ok = await confirm({
                title: "حذف الخدمة؟",
                body: `ستُحذف «${s.title}» وصفحتها وأسئلتها الشائعة. الطلبات القديمة تحتفظ باسم الخدمة. للإخفاء المؤقت استخدم زر الإخفاء بدلًا من الحذف.`,
                confirmLabel: "حذف",
                danger: true,
              });
              if (ok) run(() => deleteServiceAction(s.id), { success: "تم حذف الخدمة" });
            }}
            className="inline-flex size-9 items-center justify-center rounded-md text-ink-400 hover:bg-danger-bg hover:text-danger"
          >
            <TrashIcon size={17} />
          </button>
        </div>
      )}
    />
  );
}
