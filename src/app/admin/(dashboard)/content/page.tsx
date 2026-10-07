import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/server/db";
import { services } from "@/server/db/schema";
import { getBlock } from "@/server/services/settings";
import { mediaFor } from "@/server/admin/common";
import { pick } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/shell";
import { buttonClasses } from "@/components/ui/button";
import { ExternalIcon } from "@/components/ui/icons";
import { AboutForm, HomeForm, LegalForm, ProcessForm } from "./forms";

export const metadata: Metadata = { title: "محتوى الصفحات" };

const tabs = [
  { key: "home", label: "الرئيسية", path: "" },
  { key: "about", label: "من نحن", path: "/about" },
  { key: "process", label: "طريقة العمل", path: "/process" },
  { key: "privacy", label: "سياسة الخصوصية", path: "/privacy" },
  { key: "terms", label: "الشروط والأحكام", path: "/terms" },
] as const;

export default async function ContentAdminPage({ searchParams }: PageProps<"/admin/content">) {
  const { tab: raw } = await searchParams;
  const tab = tabs.find((t) => t.key === raw) ?? tabs[0];

  let form: React.ReactNode;
  if (tab.key === "home") {
    const [home, svcs] = await Promise.all([getBlock("home"), db.select({ slug: services.slug, title: services.title }).from(services).orderBy(asc(services.sortOrder))]);
    const media = await mediaFor(home.reels.mediaIds);
    const { mediaIds, ...reelsRest } = home.reels;
    form = (
      <HomeForm
        initial={{ ...home, reels: { ...reelsRest, media: mediaIds.map((id) => media[id]).filter((m) => m !== undefined) } }}
        services={svcs.map((s) => ({ value: s.slug, label: pick(s.title, "ar") }))}
      />
    );
  } else if (tab.key === "about") form = <AboutForm initial={await getBlock("about")} />;
  else if (tab.key === "process") form = <ProcessForm initial={await getBlock("process")} />;
  else if (tab.key === "privacy") form = <LegalForm blockKey="legal.privacy" initial={await getBlock("legal.privacy")} />;
  else form = <LegalForm blockKey="legal.terms" initial={await getBlock("legal.terms")} />;

  return (
    <>
      <PageHeader
        title="محتوى الصفحات"
        description="كل نص هنا بالعربي والإنجليزي. الإنجليزي اختياري: إذا تُرك فارغًا يظهر النص العربي."
        actions={
          <a href={`/ar${tab.path}`} target="_blank" rel="noopener" className={buttonClasses("subtle", "sm")}>
            <ExternalIcon size={16} /> معاينة الصفحة
          </a>
        }
      />
      <nav aria-label="الصفحات" className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/content?tab=${t.key}`}
            aria-current={tab.key === t.key ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium",
              tab.key === t.key ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-navy-900 hover:border-navy-600/40",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div key={tab.key}>{form}</div>
    </>
  );
}
