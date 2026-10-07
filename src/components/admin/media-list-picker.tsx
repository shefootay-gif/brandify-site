"use client";

import { useState } from "react";
import type { PublicMedia } from "@/server/db/schema/types";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { Dialog } from "./dialog";
import { MediaLibrary, MediaThumb } from "./media-library";
import { move } from "./list-editors";

/** Ordered list of media (no captions) — e.g. homepage reels. */
export function MediaListPicker({ label, value, onChange, kind = "all", folder = "general", hint }: { label: string; value: PublicMedia[]; onChange: (v: PublicMedia[]) => void; kind?: "image" | "video" | "all"; folder?: string; hint?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-navy-900">{label}</span>
        <Button variant="subtle" size="sm" onClick={() => setOpen(true)}>
          <PlusIcon size={16} /> إضافة
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-line px-4 py-6 text-center text-sm text-ink-600">لا توجد ملفات. القسم لن يظهر في الموقع حتى تضيف ملفًا واحدًا على الأقل.</p>
      ) : (
        <ul className="flex flex-wrap gap-2.5">
          {value.map((m, i) => (
            <li key={`${m.id}-${i}`} className="group relative w-24">
              <div className="aspect-[9/16] overflow-hidden rounded-md">
                <MediaThumb item={m} />
              </div>
              <div className="mt-1 flex justify-between">
                <button type="button" aria-label="تحريك للخلف" disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))} className="rounded px-1.5 text-sm text-ink-600 hover:bg-paper-2 disabled:opacity-30">
                  →
                </button>
                <button type="button" aria-label="إزالة" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-ink-400 hover:text-danger">
                  <TrashIcon size={14} />
                </button>
                <button type="button" aria-label="تحريك للأمام" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))} className="rounded px-1.5 text-sm text-ink-600 hover:bg-paper-2 disabled:opacity-30">
                  ←
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {hint && <p className="mt-1.5 text-xs text-ink-600">{hint}</p>}
      <Dialog open={open} onClose={() => setOpen(false)} title={label} size="xl">
        {open && (
          <MediaLibrary
            mode="select"
            multiple
            kind={kind}
            defaultFolder={folder}
            onSelect={(items) => {
              onChange([...value, ...items]);
              setOpen(false);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
