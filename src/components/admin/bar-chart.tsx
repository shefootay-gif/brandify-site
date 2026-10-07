"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Point = { key: string; label: string; value: number };

/**
 * Single-series daily bar chart: one hue (navy), thin bars with 2px gaps,
 * 4px rounded data-ends on a shared baseline, recessive gridline, hover/focus
 * tooltip, and a table view for screen readers and exact values.
 */
export function DailyBars({ title, unit, data }: { title: string; unit: string; data: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((a, b) => a + b.value, 0);
  const current = active !== null ? data[active] : null;
  const niceMax = max <= 4 ? max : Math.ceil(max / 2) * 2;

  return (
    <figure>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-navy-900">{title}</span>
        <span className="t-latin text-sm text-ink-600">
          {total} {unit}
        </span>
      </figcaption>

      <div className="relative mt-5">
        {/* Tooltip */}
        <div aria-live="polite" className="pointer-events-none absolute -top-2 start-0 z-10 h-6 text-xs">
          {current && (
            <span className="rounded bg-navy-900 px-2 py-1 font-medium text-white">
              {current.label}: <span className="t-latin">{current.value}</span> {unit}
            </span>
          )}
        </div>
        <div className="relative mt-6 h-36" role="img" aria-label={`${title}: ${total} ${unit} خلال آخر ${data.length} يومًا`}>
          <span aria-hidden="true" className="t-latin absolute -top-2 end-0 text-[10px] text-ink-400">{niceMax}</span>
          <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-line" />
          <div className="absolute inset-0 flex items-end gap-[2px]" dir="ltr" onMouseLeave={() => setActive(null)}>
            {data.map((d, i) => (
              <div
                key={d.key}
                className="group relative flex h-full flex-1 items-end"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                aria-label={`${d.label}: ${d.value} ${unit}`}
              >
                <div
                  className={cn(
                    "w-full rounded-t-[4px] transition-colors",
                    d.value === 0 ? "h-[2px] bg-line" : active === i ? "bg-orange-500" : "bg-navy-900",
                  )}
                  style={d.value ? { height: `${(d.value / niceMax) * 100}%` } : undefined}
                />
              </div>
            ))}
          </div>
        </div>
        <div aria-hidden="true" dir="ltr" className="t-latin mt-2 flex justify-between text-[10px] text-ink-400">
          <span>{data[0]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-ink-600 hover:text-navy-900">عرض كجدول</summary>
        <table className="mt-2 w-full text-start text-sm">
          <thead>
            <tr className="text-ink-600">
              <th className="py-1 text-start font-medium">اليوم</th>
              <th className="py-1 text-start font-medium">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((d) => d.value > 0)
              .map((d) => (
                <tr key={d.key} className="border-t border-line">
                  <td className="py-1">{d.label}</td>
                  <td className="t-latin py-1">{d.value}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
