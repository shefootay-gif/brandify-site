"use client";

import { useState } from "react";
import type { Localized, PublicMedia } from "@/server/db/schema/types";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { Dialog } from "./dialog";
import { LocalizedField } from "./fields";
import { MediaLibrary, MediaThumb } from "./media-library";
import { move } from "./list-editors";

export type GalleryItem = { media: PublicMedia; caption: Localized };

/** Ordered images/videos with bilingual captions (project gallery). */
export function GalleryEditor({ value, onChange, folder = "projects" }: { value: GalleryItem[]; onChange: (v: GalleryItem[]) => void; folder?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-navy-900">معرض الصور والفيديو ({value.length})</p>
        <Button variant="subtle" size="sm" onClick={() => setOpen(true)}>
          <PlusIcon size={16} /> إضافة صور / فيديو
        </Button>
      </div>
      {value.length === 0 ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-[var(--radius-md)] border-2 border-dashed border-line px-4 py-10 text-sm text-ink-600 hover:border-orange-500"
        >
          لا توجد صور بعد. اضغط لإضافة صور أو فيديوهات من المكتبة أو رفع جديدة.
        </button>
      ) : (
        <ul className="space-y-3">
          {value.map((g, i) => (
            <li key={`${g.media.id}-${i}`} className="flex gap-3 rounded-[var(--radius-md)] border border-line bg-paper/60 p-3">
              <div className="aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md">
                <MediaThumb item={g.media} />
              </div>
              <div className="min-w-0 flex-1">
                <LocalizedField label={`وصف ${i + 1} (اختياري)`} value={g.caption} onChange={(caption) => onChange(value.map((x, j) => (j === i ? { ...x, caption } : x)))} />
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" aria-label="تحريك لأعلى" disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))} className="rounded p-1 text-ink-600 hover:bg-white disabled:opacity-30">
                  <ArrowUpIcon size={15} />
                </button>
                <button type="button" aria-label="تحريك لأسفل" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))} className="rounded p-1 text-ink-600 hover:bg-white disabled:opacity-30">
                  <ArrowDownIcon size={15} />
                </button>
                <button type="button" aria-label="إزالة من المعرض" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-ink-400 hover:bg-danger-bg hover:text-danger">
                  <TrashIcon size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} title="إضافة إلى المعرض" size="xl">
        {open && (
          <MediaLibrary
            mode="select"
            multiple
            defaultFolder={folder}
            onSelect={(items) => {
              onChange([...value, ...items.map((m) => ({ media: m, caption: { ar: "", en: "" } }))]);
              setOpen(false);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
