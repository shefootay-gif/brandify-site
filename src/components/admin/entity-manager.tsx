"use client";

import { useState, type ReactNode } from "react";
import type { PublicMedia } from "@/server/db/schema/types";
import type { SimpleEntity } from "@/server/admin/simple-crud";
import { deleteEntityAction, reorderEntityAction, saveEntityAction, setEntityVisibleAction } from "@/app/admin/(dashboard)/content-actions";
import { Button } from "@/components/ui/button";
import { EditIcon, EyeIcon, EyeOffIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { Badge, EmptyState } from "./fields";
import { Dialog, useConfirm } from "./dialog";
import { SortableList } from "./sortable-list";
import { MediaThumb } from "./media-library";
import { useAdminAction } from "./use-action";

export type EntityRow<V> = {
  id: string;
  title: string;
  subtitle?: string;
  thumb?: PublicMedia | null;
  visible: boolean;
  badges?: Array<{ label: string; tone: "neutral" | "success" | "warning" | "danger" | "info" | "orange" }>;
  value: V;
};

export type EntityFormProps<V, C = undefined> = {
  value: V;
  onChange: (v: V) => void;
  err: (path: string) => string | undefined;
  errL: (path: string) => { ar?: string; en?: string };
  /** Extra data the form needs (e.g. select options). */
  context: C;
};

/**
 * List + dialog editor for simple content types. `toPayload` converts the
 * form value (which may hold media objects for previews) into the action input.
 */
export function EntityManager<V, C = undefined>({
  entity,
  rows,
  empty,
  addLabel,
  dialogTitle,
  visibleLabels,
  newValue,
  toPayload,
  Form,
  context,
  emptyIcon,
}: {
  entity: SimpleEntity;
  rows: EntityRow<V>[];
  empty: { title: string; body: string };
  addLabel: string;
  dialogTitle: { add: string; edit: string };
  visibleLabels: { on: string; off: string };
  newValue: () => V;
  toPayload: (v: V) => unknown;
  /** Must be defined at module scope (a stable component), not inline. */
  Form: (p: EntityFormProps<V, C>) => ReactNode;
  context: C;
  emptyIcon?: ReactNode;
}) {
  const [editing, setEditing] = useState<{ id: string | null; value: V } | null>(null);
  const { run, pending, err, errL, setFieldErrors } = useAdminAction();
  const confirm = useConfirm();

  const open = (id: string | null, value: V) => {
    setFieldErrors({});
    setEditing({ id, value });
  };

  const save = () => {
    if (!editing) return;
    run(() => saveEntityAction(entity, editing.id, toPayload(editing.value)), { success: "تم الحفظ", onSuccess: () => setEditing(null) });
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" onClick={() => open(null, newValue())}>
          <PlusIcon size={18} /> {addLabel}
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={emptyIcon} title={empty.title} body={empty.body} action={<Button variant="secondary" onClick={() => open(null, newValue())}>{addLabel}</Button>} />
      ) : (
        <SortableList
          label="الترتيب"
          items={rows}
          onReorder={(ids) => reorderEntityAction(entity, ids)}
          renderItem={(r) => (
            <div className="flex items-center gap-3">
              {r.thumb !== undefined && (
                <div className="size-12 shrink-0 overflow-hidden rounded-md bg-paper-2">{r.thumb && <MediaThumb item={r.thumb} />}</div>
              )}
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => open(r.id, r.value)} className="text-start font-semibold text-navy-900 hover:text-orange-700">
                  {r.title}
                </button>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  {!r.visible && <Badge>{visibleLabels.off}</Badge>}
                  {r.badges?.map((b) => (
                    <Badge key={b.label} tone={b.tone}>
                      {b.label}
                    </Badge>
                  ))}
                  {r.subtitle && <span className="truncate text-xs text-ink-600">{r.subtitle}</span>}
                </div>
              </div>
              <button
                type="button"
                disabled={pending}
                aria-label={r.visible ? `إخفاء: ${r.title}` : `${visibleLabels.on}: ${r.title}`}
                title={r.visible ? "إخفاء" : visibleLabels.on}
                onClick={() => run(() => setEntityVisibleAction(entity, r.id, !r.visible), { success: r.visible ? `أصبح: ${visibleLabels.off}` : `تم: ${visibleLabels.on}` })}
                className="inline-flex size-9 items-center justify-center rounded-md text-ink-600 hover:bg-paper-2"
              >
                {r.visible ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
              </button>
              <button type="button" aria-label={`تعديل: ${r.title}`} onClick={() => open(r.id, r.value)} className="inline-flex size-9 items-center justify-center rounded-md text-ink-600 hover:bg-paper-2">
                <EditIcon size={17} />
              </button>
              <button
                type="button"
                aria-label={`حذف: ${r.title}`}
                onClick={async () => {
                  const ok = await confirm({ title: "تأكيد الحذف", body: `سيُحذف «${r.title}» نهائيًا.`, confirmLabel: "حذف", danger: true });
                  if (ok) run(() => deleteEntityAction(entity, r.id), { success: "تم الحذف" });
                }}
                className="inline-flex size-9 items-center justify-center rounded-md text-ink-400 hover:bg-danger-bg hover:text-danger"
              >
                <TrashIcon size={17} />
              </button>
            </div>
          )}
        />
      )}

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? dialogTitle.edit : dialogTitle.add}
        variant="drawer"
        footer={
          <>
            <Button variant="subtle" onClick={() => setEditing(null)}>
              إلغاء
            </Button>
            <Button variant="secondary" onClick={save} disabled={pending}>
              {pending ? "جارٍ الحفظ…" : "حفظ"}
            </Button>
          </>
        }
      >
        {editing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="space-y-5"
          >
            <Form value={editing.value} onChange={(value) => setEditing((s) => (s ? { ...s, value } : s))} err={err} errL={errL} context={context} />
            <button type="submit" hidden />
          </form>
        )}
      </Dialog>
    </>
  );
}
