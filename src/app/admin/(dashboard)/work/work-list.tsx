"use client";

import Link from "next/link";
import type { PublicMedia } from "@/server/db/schema/types";
import { SortableList } from "@/components/admin/sortable-list";
import { Badge, EmptyState } from "@/components/admin/fields";
import { MediaThumb } from "@/components/admin/media-library";
import { useAdminAction } from "@/components/admin/use-action";
import { useConfirm } from "@/components/admin/dialog";
import { buttonClasses } from "@/components/ui/button";
import { EditIcon, ExternalIcon, EyeIcon, EyeOffIcon, FolderIcon, StarIcon, TrashIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { deleteProjectAction, reorderProjectsAction, setProjectFlagAction } from "./actions";

type Item = {
  id: string;
  slug: string;
  title: string;
  industry: string;
  status: "draft" | "published";
  isFeatured: boolean;
  isConcept: boolean;
  hasCaseStudy: boolean;
  hasResults: boolean;
  cover: PublicMedia | null;
  categories: string[];
};

export function WorkList({ items }: { items: Item[] }) {
  const { run, pending } = useAdminAction();
  const confirm = useConfirm();

  if (!items.length) {
    return (
      <EmptyState
        icon={<FolderIcon size={32} />}
        title="لا توجد مشاريع بعد"
        body="أضف أول مشروع: العنوان، الصور، التحدي والحل. يمكنك حفظه كمسودة ونشره لاحقًا."
        action={
          <Link href="/admin/work/new" className={buttonClasses("primary", "md")}>
            إضافة مشروع
          </Link>
        }
      />
    );
  }

  return (
    <SortableList
      label="ترتيب المشاريع"
      items={items}
      onReorder={reorderProjectsAction}
      renderItem={(p) => (
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
          <div className="aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-md bg-navy-900">
            {p.cover ? <MediaThumb item={p.cover} /> : <span className="flex h-full items-center justify-center text-lg font-bold text-white">{p.title.charAt(0)}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/admin/work/${p.id}`} className="font-semibold text-navy-900 hover:text-orange-700">
              {p.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge tone={p.status === "published" ? "success" : "neutral"}>{p.status === "published" ? "منشور" : "مسودة"}</Badge>
              {p.isConcept && <Badge tone="info">تصوري</Badge>}
              {p.hasCaseStudy && <Badge tone="orange">دراسة حالة</Badge>}
              {p.hasResults && <Badge tone="success">نتائج</Badge>}
              {p.categories.slice(0, 3).map((c) => (
                <span key={c} className="text-xs text-ink-600">
                  · {c}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={pending}
              aria-pressed={p.isFeatured}
              aria-label={p.isFeatured ? "إزالة من المميزة" : "تمييز في الرئيسية"}
              title={p.isFeatured ? "مميز في الرئيسية" : "تمييز في الرئيسية"}
              onClick={() => run(() => setProjectFlagAction(p.id, "featured", !p.isFeatured), { success: p.isFeatured ? "أُزيل من المميزة" : "سيظهر في الرئيسية" })}
              className={cn("inline-flex size-9 items-center justify-center rounded-md hover:bg-paper-2", p.isFeatured ? "text-orange-500" : "text-ink-400")}
            >
              <StarIcon size={18} />
            </button>
            <button
              type="button"
              disabled={pending}
              aria-label={p.status === "published" ? "إخفاء من الموقع" : "نشر في الموقع"}
              title={p.status === "published" ? "إخفاء" : "نشر"}
              onClick={() =>
                run(() => setProjectFlagAction(p.id, "status", p.status !== "published"), { success: p.status === "published" ? "أصبح مسودة" : "تم النشر" })
              }
              className="inline-flex size-9 items-center justify-center rounded-md text-ink-600 hover:bg-paper-2"
            >
              {p.status === "published" ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
            </button>
            {p.status === "published" && (
              <a href={`/ar/work/${p.slug}`} target="_blank" rel="noopener" aria-label="عرض في الموقع" className="inline-flex size-9 items-center justify-center rounded-md text-ink-600 hover:bg-paper-2">
                <ExternalIcon size={17} />
              </a>
            )}
            <Link href={`/admin/work/${p.id}`} aria-label={`تعديل ${p.title}`} className="inline-flex size-9 items-center justify-center rounded-md text-ink-600 hover:bg-paper-2">
              <EditIcon size={17} />
            </Link>
            <button
              type="button"
              aria-label={`حذف ${p.title}`}
              onClick={async () => {
                const ok = await confirm({ title: "حذف المشروع؟", body: `سيُحذف «${p.title}» نهائيًا من الموقع. الصور تبقى في مكتبة الوسائط.`, confirmLabel: "حذف", danger: true });
                if (ok) run(() => deleteProjectAction(p.id), { success: "تم حذف المشروع" });
              }}
              className="inline-flex size-9 items-center justify-center rounded-md text-ink-400 hover:bg-danger-bg hover:text-danger"
            >
              <TrashIcon size={17} />
            </button>
          </div>
        </div>
      )}
    />
  );
}
