"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon, GripIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useAdminAction } from "./use-action";

type Result = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Reorderable rows: drag the handle (pointer) or use the arrow buttons
 * (keyboard / touch). The new order is saved immediately.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  label,
}: {
  items: T[];
  onReorder: (ids: string[]) => Promise<Result>;
  renderItem: (item: T) => ReactNode;
  label: string;
}) {
  const [list, setList] = useState(items);
  const [dragId, setDragId] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const { run } = useAdminAction();
  const before = useRef(items);

  useEffect(() => {
    setList(items);
    before.current = items;
  }, [items]);

  const commit = (next: T[]) => {
    setList(next);
    if (next.map((x) => x.id).join() === before.current.map((x) => x.id).join()) return;
    const prev = before.current;
    before.current = next;
    run(() => onReorder(next.map((x) => x.id)), {
      success: "تم حفظ الترتيب",
      refresh: false,
      onError: () => {
        before.current = prev;
        setList(prev);
      },
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x!);
    setAnnounce(`نُقل العنصر إلى الموضع ${to + 1}`);
    commit(next);
  };

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <ul aria-label={label} className="divide-y divide-line overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white">
        {list.map((item, i) => (
          <li
            key={item.id}
            onDragOver={(e) => {
              if (!dragId || dragId === item.id) return;
              e.preventDefault();
              const from = list.findIndex((x) => x.id === dragId);
              if (from === -1 || from === i) return;
              const next = [...list];
              const [x] = next.splice(from, 1);
              next.splice(i, 0, x!);
              setList(next);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragId(null);
              commit(list);
            }}
            className={cn("flex items-center gap-2 px-2 py-2.5 sm:px-3", dragId === item.id && "bg-orange-50 opacity-70")}
          >
            <span
              draggable
              onDragStart={(e) => {
                setDragId(item.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => {
                if (dragId) commit(list);
                setDragId(null);
              }}
              title="اسحب لإعادة الترتيب"
              className="hidden cursor-grab text-ink-400 active:cursor-grabbing sm:block"
              aria-hidden="true"
            >
              <GripIcon size={18} />
            </span>
            <div className="flex flex-col">
              <button type="button" aria-label="تحريك لأعلى" disabled={i === 0} onClick={() => move(i, i - 1)} className="rounded p-0.5 text-ink-400 hover:bg-paper-2 hover:text-navy-900 disabled:opacity-25">
                <ArrowUpIcon size={14} />
              </button>
              <button type="button" aria-label="تحريك لأسفل" disabled={i === list.length - 1} onClick={() => move(i, i + 1)} className="rounded p-0.5 text-ink-400 hover:bg-paper-2 hover:text-navy-900 disabled:opacity-25">
                <ArrowDownIcon size={14} />
              </button>
            </div>
            <div className="min-w-0 flex-1">{renderItem(item)}</div>
          </li>
        ))}
      </ul>
    </>
  );
}
