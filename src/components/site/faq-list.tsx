import { PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Item = { id: string; q: string; a: string };

/** Native <details> accordion: accessible and works without JavaScript. */
export function FaqList({ items, tone = "light" }: { items: Item[]; tone?: "light" | "dark" }) {
  if (!items.length) return null;
  return (
    <div className={cn("border-t", tone === "dark" ? "border-white/10" : "border-line")}>
      {items.map((item, i) => (
        <details
          key={item.id}
          className={cn("group border-b", tone === "dark" ? "border-white/10" : "border-line")}
          data-reveal
          style={{ ["--reveal-i" as string]: i % 4 }}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-start text-lg font-semibold transition-colors [&::-webkit-details-marker]:hidden",
              tone === "dark" ? "text-white hover:text-orange-500" : "text-navy-900 hover:text-orange-700",
            )}
          >
            {item.q}
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-open:rotate-45",
                tone === "dark" ? "border-white/20" : "border-line",
              )}
            >
              <PlusIcon size={18} />
            </span>
          </summary>
          <p className={cn("max-w-3xl pb-7", tone === "dark" ? "text-white/70" : "text-ink-600")}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
