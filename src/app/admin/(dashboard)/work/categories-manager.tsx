"use client";

import { useState } from "react";
import type { Localized } from "@/server/db/schema/types";
import { Card, LocalizedField, Switch, TextField, Badge } from "@/components/admin/fields";
import { Dialog, useConfirm } from "@/components/admin/dialog";
import { SortableList } from "@/components/admin/sortable-list";
import { useAdminAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { slugify } from "@/lib/utils";
import { deleteCategoryAction, reorderCategoriesAction, saveCategoryAction } from "./actions";

type Cat = { id: string; slug: string; name: Localized; visible: boolean; count: number };

export function CategoriesManager({ categories }: { categories: Cat[] }) {
  const [editing, setEditing] = useState<Cat | "new" | null>(null);
  const confirm = useConfirm();
  const { run } = useAdminAction();

  return (
    <Card
      title="تصنيفات الأعمال (الفلاتر)"
      description="تظهر كفلاتر في صفحة الأعمال. التصنيف الذي لا يحتوي مشاريع منشورة لا يظهر للزوار."
      actions={
        <Button variant="subtle" size="sm" onClick={() => setEditing("new")}>
          <PlusIcon size={16} /> تصنيف جديد
        </Button>
      }
    >
      <SortableList
        label="ترتيب التصنيفات"
        items={categories}
        onReorder={reorderCategoriesAction}
        renderItem={(c) => (
          <div className="flex items-center gap-3">
            <span className="flex-1">
              <span className="font-semibold text-navy-900">{c.name.ar}</span>
              <span className="t-latin ms-2 text-sm text-ink-600">{c.name.en}</span>
            </span>
            {!c.visible && <Badge>مخفي</Badge>}
            <span className="text-xs text-ink-600">{c.count} مشروع</span>
            <button type="button" aria-label={`تعديل ${c.name.ar}`} onClick={() => setEditing(c)} className="inline-flex size-8 items-center justify-center rounded-md text-ink-600 hover:bg-paper-2">
              <EditIcon size={16} />
            </button>
            <button
              type="button"
              aria-label={`حذف ${c.name.ar}`}
              onClick={async () => {
                const ok = await confirm({
                  title: "حذف التصنيف؟",
                  body: c.count ? `سيُزال من ${c.count} مشروع (المشاريع نفسها لن تُحذف).` : "سيُحذف التصنيف نهائيًا.",
                  confirmLabel: "حذف",
                  danger: true,
                });
                if (ok) run(() => deleteCategoryAction(c.id), { success: "تم حذف التصنيف" });
              }}
              className="inline-flex size-8 items-center justify-center rounded-md text-ink-400 hover:bg-danger-bg hover:text-danger"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        )}
      />
      {editing && <CategoryDialog cat={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}

function CategoryDialog({ cat, onClose }: { cat: Cat | null; onClose: () => void }) {
  const [name, setName] = useState<Localized>(cat?.name ?? { ar: "", en: "" });
  const [slug, setSlug] = useState(cat?.slug ?? "");
  const [visible, setVisible] = useState(cat?.visible ?? true);
  const { run, pending, err, errL } = useAdminAction();
  const save = () =>
    run(() => saveCategoryAction(cat?.id ?? null, { name, slug: slug || slugify(name.en || name.ar), visible }), {
      success: "تم حفظ التصنيف",
      onSuccess: onClose,
    });
  return (
    <Dialog
      open
      onClose={onClose}
      title={cat ? "تعديل التصنيف" : "تصنيف جديد"}
      size="md"
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="secondary" onClick={save} disabled={pending}>
            {pending ? "جارٍ الحفظ…" : "حفظ"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <LocalizedField label="الاسم" required value={name} onChange={(v) => {
          setName(v);
          if (!cat && v.en) setSlug(slugify(v.en));
        }} errors={errL("name")} />
        <TextField label="الرابط (slug)" value={slug} onChange={setSlug} dir="ltr" error={err("slug")} hint="يظهر في رابط الفلتر، مثل: ?category=branding" />
        <Switch label="ظاهر في الموقع" checked={visible} onChange={setVisible} />
      </div>
    </Dialog>
  );
}
