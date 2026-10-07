"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  BellIcon,
  BuildingIcon,
  CloseIcon,
  ExternalIcon,
  FileTextIcon,
  FolderIcon,
  GlobeIcon,
  GridIcon,
  HelpIcon,
  ImageIcon,
  InboxIcon,
  LayersIcon,
  LogoutIcon,
  MenuIcon,
  QuoteOutlineIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { ToastProvider } from "./toast";
import { ConfirmProvider } from "./dialog";

type NavItem = { href: string; label: string; icon: (p: { size?: number }) => ReactNode; badge?: number; exact?: boolean };

export function AdminShell({
  user,
  newLeads,
  logo,
  children,
}: {
  user: { name: string; email: string; role: string };
  newLeads: number;
  logo: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const groups: Array<{ title: string; items: NavItem[] }> = [
    {
      title: "عام",
      items: [
        { href: "/admin", label: "نظرة عامة", icon: GridIcon, exact: true },
        { href: "/admin/leads", label: "الطلبات", icon: InboxIcon, badge: newLeads },
      ],
    },
    {
      title: "المحتوى",
      items: [
        { href: "/admin/work", label: "الأعمال ودراسات الحالة", icon: FolderIcon },
        { href: "/admin/services", label: "الخدمات", icon: LayersIcon },
        { href: "/admin/testimonials", label: "آراء العملاء", icon: QuoteOutlineIcon },
        { href: "/admin/clients", label: "لوجوهات العملاء", icon: BuildingIcon },
        { href: "/admin/team", label: "الفريق والمؤسس", icon: UsersIcon },
        { href: "/admin/faqs", label: "الأسئلة الشائعة", icon: HelpIcon },
      ],
    },
    {
      title: "الموقع",
      items: [
        { href: "/admin/content", label: "محتوى الصفحات", icon: FileTextIcon },
        { href: "/admin/seo", label: "SEO", icon: GlobeIcon },
        { href: "/admin/media", label: "مكتبة الوسائط", icon: ImageIcon },
        { href: "/admin/settings", label: "الإعدادات", icon: SettingsIcon },
      ],
    },
  ];

  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));

  const signOut = async () => {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const sidebar = (
    <nav aria-label="قائمة لوحة التحكم" className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin" aria-label="Brandify — لوحة التحكم">
          {logo}
        </Link>
        <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق القائمة" className="text-white/70 lg:hidden">
          <CloseIcon size={22} />
        </button>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-2 px-3 text-xs font-semibold text-white/55">{g.title}</p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.93rem] font-medium transition-colors",
                        active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <span className={active ? "text-orange-500" : undefined}>
                        <Icon size={19} />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? (
                        <span className="t-latin rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-navy-950">{item.badge}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-3">
        <a href="/ar" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
          <ExternalIcon size={18} /> عرض الموقع
        </a>
      </div>
    </nav>
  );

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
          {/* Desktop sidebar */}
          <aside data-surface="dark" className="sticky top-0 hidden h-dvh bg-navy-950 lg:block">
            {sidebar}
          </aside>
          {/* Mobile sidebar */}
          {open && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button type="button" aria-label="إغلاق القائمة" className="absolute inset-0 bg-navy-950/50" onClick={() => setOpen(false)} />
              <aside data-surface="dark" className="absolute inset-y-0 start-0 w-72 max-w-[85vw] bg-navy-950 shadow-[var(--shadow-lift)]">
                {sidebar}
              </aside>
            </div>
          )}

          <div className="min-w-0">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur md:px-6">
              <button type="button" onClick={() => setOpen(true)} aria-label="فتح القائمة" className="inline-flex size-10 items-center justify-center rounded-md hover:bg-paper-2 lg:hidden">
                <MenuIcon size={22} />
              </button>
              <form action="/admin/search" role="search" className="relative max-w-md flex-1">
                <SearchIcon size={17} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  name="q"
                  type="search"
                  placeholder="ابحث في الطلبات والمشاريع والخدمات…"
                  aria-label="بحث"
                  className="h-10 w-full rounded-[var(--radius-md)] border border-line bg-paper ps-9 pe-3 text-sm focus:border-navy-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </form>
              <div className="ms-auto flex items-center gap-1">
                <Link
                  href="/admin/leads?status=new"
                  aria-label={newLeads ? `${newLeads} طلبات جديدة` : "لا توجد طلبات جديدة"}
                  className="relative inline-flex size-10 items-center justify-center rounded-md text-navy-900 hover:bg-paper-2"
                >
                  <BellIcon size={20} />
                  {newLeads > 0 && <span className="absolute end-2 top-2 size-2.5 rounded-full bg-orange-500 ring-2 ring-white" />}
                </Link>
                <details className="group relative">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 hover:bg-paper-2 [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                      {user.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden text-sm font-semibold text-navy-900 sm:block">{user.name}</span>
                  </summary>
                  <div className="absolute end-0 top-full z-40 mt-2 w-64 rounded-[var(--radius-md)] border border-line bg-white p-2 shadow-[var(--shadow-lift)]">
                    <div className="border-b border-line px-3 pb-3 pt-2">
                      <p className="font-semibold text-navy-900">{user.name}</p>
                      <p className="t-latin truncate text-xs text-ink-600">{user.email}</p>
                      <p className="mt-1 text-xs text-ink-600">{user.role === "admin" ? "مدير" : "محرر"}</p>
                    </div>
                    <Link href="/admin/settings?tab=account" className="mt-1 flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-paper-2">
                      <SettingsIcon size={16} /> الحساب وكلمة المرور
                    </Link>
                    <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-danger hover:bg-danger-bg">
                      <LogoutIcon size={16} /> تسجيل الخروج
                    </button>
                  </div>
                </details>
              </div>
            </header>
            <main id="main" className="px-4 py-6 md:px-8 md:py-8">
              {children}
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm text-ink-600 hover:text-navy-900">
            → {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold text-navy-900 md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-ink-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
