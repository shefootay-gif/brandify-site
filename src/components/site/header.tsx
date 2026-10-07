"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "@/components/ui/icons";
import { LanguageSwitcher } from "./language-switcher";

type NavItem = { href: string; label: string };

type Props = {
  locale: Locale;
  logo: ReactNode;
  nav: NavItem[];
  whatsappHref: string;
  whatsappLabel: string;
  socials: ReactNode;
  t: { menu: string; close: string; switchLanguage: string; switchLanguageLabel: string; primary: string };
};

export function Header({ locale, logo, nav, whatsappHref, whatsappLabel, socials, t }: Props) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock scroll, trap focus and support Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab") {
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      data-surface="dark"
      className={cn(
        "fixed inset-x-0 top-0 z-50 text-white transition-[background-color,box-shadow] duration-300",
        scrolled || open ? "bg-navy-950 shadow-[0_1px_0_rgb(255_255_255/0.06)]" : "bg-navy-900",
      )}
    >
      <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href={`/${locale}`} className="shrink-0 rounded-sm" aria-label="Brandify">
          {logo}
        </Link>

        <nav aria-label={t.primary} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-10 items-center px-3.5 text-[0.95rem] font-medium text-white/75 transition-colors hover:text-white",
                    "after:absolute after:inset-x-3.5 after:bottom-1.5 after:h-0.5 after:origin-[inline-start] after:scale-x-0 after:bg-orange-500 after:transition-transform after:duration-300",
                    "hover:after:scale-x-100 aria-[current=page]:text-white aria-[current=page]:after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher
            locale={locale}
            label={t.switchLanguage}
            ariaLabel={t.switchLanguageLabel}
            className="px-2 text-white/80 hover:bg-white/5 hover:text-white sm:px-3"
          />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp"
            data-cta="header"
            className="shape-bubble hidden h-10 items-center gap-2 bg-orange-500 px-4 text-sm font-semibold text-navy-950 transition-colors hover:bg-orange-600 md:inline-flex"
          >
            <WhatsAppIcon size={18} />
            {whatsappLabel}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp"
            data-cta="header-mobile"
            aria-label={whatsappLabel}
            className="shape-bubble inline-flex size-11 items-center justify-center bg-orange-500 text-navy-950 md:hidden"
          >
            <WhatsAppIcon size={21} />
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] text-white hover:bg-white/5 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.close : t.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-navy-950 lg:hidden"
      >
        <nav aria-label={t.primary} className="container-x flex min-h-full flex-col pb-10 pt-6">
          <ul className="flex flex-col">
            {nav.map((item, i) => (
              <li key={item.href} className="border-b border-white/8">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-baseline gap-4 py-4 font-[family-name:var(--font-display)] text-2xl font-bold text-white aria-[current=page]:text-orange-500"
                >
                  <span className="t-latin w-7 text-sm font-medium text-white/55">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-5 pt-10">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp"
              data-cta="mobile-menu"
              className="shape-bubble inline-flex h-14 items-center justify-center gap-2 bg-orange-500 text-base font-semibold text-navy-950"
            >
              <WhatsAppIcon size={22} />
              {whatsappLabel}
            </a>
            <div className="flex items-center justify-between">
              <LanguageSwitcher
                locale={locale}
                label={t.switchLanguage}
                ariaLabel={t.switchLanguageLabel}
                className="text-white/80 hover:bg-white/5"
                onNavigate={() => setOpen(false)}
              />
              <div className="flex items-center gap-1">{socials}</div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
