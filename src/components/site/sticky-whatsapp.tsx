"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp button for small screens. Appears after the first screen
 * (the hero already has a CTA) and hides near the footer, where the final
 * CTA is visible, so it never covers another WhatsApp button.
 */
export function StickyWhatsApp({ href, label }: { href: string; label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("[data-final-cta]") ?? document.querySelector("footer");
    let nearEnd = false;
    const io = footer
      ? new IntersectionObserver(([entry]) => {
          nearEnd = Boolean(entry?.isIntersecting);
          update();
        })
      : null;
    if (footer && io) io.observe(footer);
    function update() {
      setVisible(window.scrollY > window.innerHeight * 0.7 && !nearEnd);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      io?.disconnect();
    };
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-track="whatsapp"
      data-cta="sticky"
      aria-label={label}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "shape-bubble fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-4 z-40 inline-flex h-14 items-center gap-2 bg-orange-500 px-5 font-semibold text-navy-950 shadow-[var(--shadow-lift)] md:hidden",
        "transition-[opacity,transform] duration-300 ease-[var(--ease-out-quint)]",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <WhatsAppIcon size={22} />
      <span className="text-sm">{label}</span>
    </a>
  );
}
