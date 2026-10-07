"use client";

import { useId, useState, type ReactNode } from "react";
import type { Localized, LocalizedItem } from "@/server/db/schema/types";
import { ArrowDownIcon, ArrowUpIcon, CloseIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { LocalizedField, inputClass } from "./fields";
import { cn } from "@/lib/utils";

const emptyL = (): Localized => ({ ar: "", en: "" });

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x!);
  return next;
}

/** Row chrome with move up/down and delete (keyboard + touch friendly). */
function RowShell({
  index,
  total,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  total: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-md)] border border-line bg-paper/60 p-3">
      <div className="flex flex-col items-center gap-1 pt-1">
        <span className="t-latin text-xs font-semibold text-ink-400">{String(index + 1).padStart(2, "0")}</span>
        <button type="button" aria-label="تحريك لأعلى" disabled={index === 0} onClick={() => onMove(index - 1)} className="rounded p-1 text-ink-600 hover:bg-white disabled:opacity-30">
          <ArrowUpIcon size={15} />
        </button>
        <button type="button" aria-label="تحريك لأسفل" disabled={index === total - 1} onClick={() => onMove(index + 1)} className="rounded p-1 text-ink-600 hover:bg-white disabled:opacity-30">
          <ArrowDownIcon size={15} />
        </button>
      </div>
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
      <button type="button" aria-label="حذف" onClick={onRemove} className="self-start rounded p-1.5 text-ink-400 hover:bg-danger-bg hover:text-danger">
        <TrashIcon size={17} />
      </button>
    </div>
  );
}

export function LocalizedItemsEditor({
  label,
  value,
  onChange,
  max = 20,
  addLabel = "إضافة عنصر",
  titleLabel = "العنوان",
  descriptionLabel = "الوصف",
}: {
  label: string;
  value: LocalizedItem[];
  onChange: (v: LocalizedItem[]) => void;
  max?: number;
  addLabel?: string;
  titleLabel?: string;
  descriptionLabel?: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-1.5 text-sm font-semibold text-navy-900">{label}</legend>
      {value.map((item, i) => (
        <RowShell
          key={i}
          index={i}
          total={value.length}
          onMove={(to) => onChange(move(value, i, to))}
          onRemove={() => onChange(value.filter((_, j) => j !== i))}
        >
          <LocalizedField label={titleLabel} value={item.title} onChange={(title) => onChange(value.map((x, j) => (j === i ? { ...x, title } : x)))} />
          <LocalizedField
            label={descriptionLabel}
            multiline
            rows={2}
            value={item.description}
            onChange={(description) => onChange(value.map((x, j) => (j === i ? { ...x, description } : x)))}
          />
        </RowShell>
      ))}
      {value.length < max && (
        <Button variant="subtle" size="sm" onClick={() => onChange([...value, { title: emptyL(), description: emptyL() }])}>
          <PlusIcon size={16} /> {addLabel}
        </Button>
      )}
    </fieldset>
  );
}

export function LocalizedListEditor({
  label,
  value,
  onChange,
  max = 20,
  addLabel = "إضافة",
  multiline,
}: {
  label: string;
  value: Localized[];
  onChange: (v: Localized[]) => void;
  max?: number;
  addLabel?: string;
  multiline?: boolean;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-1.5 text-sm font-semibold text-navy-900">{label}</legend>
      {value.map((item, i) => (
        <RowShell key={i} index={i} total={value.length} onMove={(to) => onChange(move(value, i, to))} onRemove={() => onChange(value.filter((_, j) => j !== i))}>
          <LocalizedField label={`${label} ${i + 1}`} multiline={multiline} rows={2} value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
        </RowShell>
      ))}
      {value.length < max && (
        <Button variant="subtle" size="sm" onClick={() => onChange([...value, emptyL()])}>
          <PlusIcon size={16} /> {addLabel}
        </Button>
      )}
    </fieldset>
  );
}

/** Free-form tags (Enter or comma to add). */
export function TagInput({ label, value, onChange, hint, max = 30 }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string; max?: number }) {
  const [draft, setDraft] = useState("");
  const id = useId();
  const add = () => {
    const v = draft.trim().replace(/,$/, "");
    if (v && !value.includes(v) && value.length < max) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label}
      </label>
      <div className={cn(inputClass, "flex min-h-11 flex-wrap items-center gap-1.5 py-1.5")}>
        {value.map((tag) => (
          <span key={tag} className="t-latin inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-900">
            {tag}
            <button type="button" aria-label={`حذف ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))} className="opacity-60 hover:opacity-100">
              <CloseIcon size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={add}
          className="min-w-24 flex-1 bg-transparent py-1 text-sm outline-none"
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-600">{hint}</p>}
    </div>
  );
}

/** Checkbox group for choosing related records (categories, services…). */
export function CheckboxGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-navy-900">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = value.includes(o.value);
          return (
            <label
              key={o.value}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500",
                checked ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-navy-900 hover:border-navy-600/40",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onChange(checked ? value.filter((v) => v !== o.value) : [...value, o.value])}
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export { move };
