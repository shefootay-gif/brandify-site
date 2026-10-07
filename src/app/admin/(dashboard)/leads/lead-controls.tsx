"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { leadStatusMeta } from "@/lib/lead-status";
import type { LeadStatus } from "@/server/db/schema/leads";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";
import { useAdminAction } from "@/components/admin/use-action";
import { useConfirm } from "@/components/admin/dialog";
import { inputClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";
import { addLeadNoteAction, deleteLeadAction, setLeadStatusAction } from "./actions";

const statuses = Object.keys(leadStatusMeta) as LeadStatus[];

const toneClass: Record<string, string> = {
  orange: "bg-orange-100 text-orange-700 border-orange-100",
  info: "bg-info-bg text-info border-info-bg",
  warning: "bg-warning-bg text-warning border-warning-bg",
  neutral: "bg-paper-2 text-ink-600 border-paper-2",
  success: "bg-success-bg text-success border-success-bg",
  danger: "bg-danger-bg text-danger border-danger-bg",
};

export function StatusSelect({ id, status, label }: { id: string; status: LeadStatus; label?: string }) {
  const [value, setValue] = useState(status);
  const { run, pending } = useAdminAction();
  return (
    <select
      aria-label={label ?? "حالة الطلب"}
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as LeadStatus;
        const prev = value;
        setValue(next);
        run(() => setLeadStatusAction(id, next), {
          success: `الحالة: ${leadStatusMeta[next].label}`,
          onError: () => setValue(prev),
        });
      }}
      className={cn("h-9 cursor-pointer rounded-full border px-3 text-xs font-semibold", toneClass[leadStatusMeta[value].tone])}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {leadStatusMeta[s].label}
        </option>
      ))}
    </select>
  );
}

export function NoteForm({ id }: { id: string }) {
  const [body, setBody] = useState("");
  const { run, pending } = useAdminAction();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        run(() => addLeadNoteAction(id, body), { success: "تمت إضافة الملاحظة", onSuccess: () => setBody("") });
      }}
      className="space-y-2"
    >
      <label htmlFor="note" className="sr-only">
        ملاحظة جديدة
      </label>
      <textarea
        id="note"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="اكتب ملاحظة: ماذا اتفقتم؟ ما الخطوة التالية؟"
        className={cn(inputClass, "py-2.5")}
      />
      <Button type="submit" variant="secondary" size="sm" disabled={pending || !body.trim()}>
        {pending ? "جارٍ الحفظ…" : "إضافة ملاحظة"}
      </Button>
    </form>
  );
}

export function DeleteLeadButton({ id, name }: { id: string; name: string }) {
  const confirm = useConfirm();
  const router = useRouter();
  const { run, pending } = useAdminAction();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-danger hover:bg-danger-bg"
      onClick={async () => {
        const ok = await confirm({ title: "حذف الطلب؟", body: `سيُحذف طلب «${name}» وكل ملاحظاته نهائيًا.`, confirmLabel: "حذف", danger: true });
        if (ok) run(() => deleteLeadAction(id), { success: "تم حذف الطلب", refresh: false, onSuccess: () => router.push("/admin/leads") });
      }}
    >
      <TrashIcon size={16} /> حذف الطلب
    </Button>
  );
}
