"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Win = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  ttq?: { track: (event: string, data?: Record<string, unknown>) => void };
  dataLayer?: unknown[];
};

/**
 * Small progressive enhancements, shared by every public page:
 *  - reveal-on-scroll for [data-reveal] elements
 *  - conversion tracking for WhatsApp / social clicks (only fires if the
 *    corresponding pixel was configured in the dashboard)
 *  - magnetic hover for [data-magnetic] CTAs (fine pointers only)
 */
export function Enhancements() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const kind = el.dataset.track;
      const cta = el.dataset.cta ?? "";
      const w = window as Win;
      if (kind === "whatsapp" || kind === "social") {
        try {
          navigator.sendBeacon?.(
            "/api/track",
            JSON.stringify({ type: kind, cta, page: location.pathname, locale: document.documentElement.lang }),
          );
        } catch {
          /* best effort */
        }
      }
      if (kind === "whatsapp") {
        w.gtag?.("event", "whatsapp_click", { cta, page: location.pathname });
        w.dataLayer?.push({ event: "whatsapp_click", cta });
        w.fbq?.("track", "Contact", { method: "whatsapp", cta });
        w.ttq?.track("Contact", { cta });
      } else if (kind === "social") {
        w.gtag?.("event", "social_click", { platform: cta });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const cleanups = els.map((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
        el.style.transform = `translate(${x}px, ${y}px)`;
      };
      const leave = () => {
        el.style.transform = "";
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    });
    return () => cleanups.forEach((c) => c());
  }, [pathname]);

  return null;
}
