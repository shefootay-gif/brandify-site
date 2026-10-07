"use client";

import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Sticky save bar + unsaved-changes guard for long editor forms. */
export function SaveBar({ dirty, pending, onSave, extra, saveLabel = "حفظ التغييرات" }: { dirty: boolean; pending: boolean; onSave: () => void; extra?: ReactNode; saveLabel?: string }) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!pending) onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSave, pending]);

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      <span className="text-sm text-ink-600" aria-live="polite">
        {pending ? "جارٍ الحفظ…" : dirty ? "لديك تغييرات غير محفوظة" : "كل التغييرات محفوظة"}
      </span>
      <div className="flex items-center gap-2">
        {extra}
        <Button variant="primary" onClick={onSave} disabled={pending}>
          {pending ? "جارٍ الحفظ…" : saveLabel}
        </Button>
      </div>
    </div>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-b border-line py-8 first:pt-0 last:border-0 lg:grid-cols-[16rem_1fr] lg:gap-10">
      <div>
        <h2 className="font-bold text-navy-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-600">{description}</p>}
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}

/** Character counter for SEO fields. */
export function CharCount({ value, max }: { value: string; max: number }) {
  const n = value.length;
  return (
    <span className={`t-latin text-xs ${n > max ? "text-danger" : "text-ink-400"}`}>
      {n}/{max}
    </span>
  );
}
