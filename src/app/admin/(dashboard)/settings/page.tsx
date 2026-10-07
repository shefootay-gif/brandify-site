import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/server/db";
import { user as userTable } from "@/server/db/schema";
import { requireUser } from "@/server/auth/session";
import { getSettings } from "@/server/services/settings";
import { mediaFor } from "@/server/admin/common";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/shell";
import { EmptyState } from "@/components/admin/fields";
import { SettingsIcon } from "@/components/ui/icons";
import { AccountForm, BrandForm, ContactForm, CtaForm, FooterForm, LeadFormBuilder, SeoDefaultsForm, SocialForm, TrackingForm, UsersManager } from "./forms";

export const metadata: Metadata = { title: "الإعدادات" };

const tabs = [
  { key: "contact", label: "التواصل", admin: true },
  { key: "social", label: "السوشيال ميديا", admin: true },
  { key: "cta", label: "أزرار الدعوة", admin: true },
  { key: "form", label: "نموذج الطلب", admin: true },
  { key: "brand", label: "الهوية", admin: true },
  { key: "tracking", label: "التتبع", admin: true },
  { key: "seo", label: "SEO", admin: true },
  { key: "footer", label: "الفوتر", admin: true },
  { key: "account", label: "حسابي", admin: false },
  { key: "users", label: "المستخدمون", admin: true },
] as const;

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const me = await requireUser();
  const { tab: raw } = await searchParams;
  const visibleTabs = tabs.filter((t) => !t.admin || me.role === "admin");
  const tab = visibleTabs.find((t) => t.key === raw) ?? visibleTabs[0]!;
  const settings = await getSettings();

  let content: React.ReactNode;
  switch (tab.key) {
    case "contact":
      content = <ContactForm initial={settings.contact} />;
      break;
    case "social":
      content = <SocialForm initial={settings.social} />;
      break;
    case "cta":
      content = <CtaForm initial={settings.cta} whatsapp={settings.contact.whatsapp} />;
      break;
    case "form":
      content = <LeadFormBuilder initial={settings.form} />;
      break;
    case "brand": {
      const media = await mediaFor([settings.brand.logoMediaId, settings.brand.logoOnDarkMediaId, settings.brand.faviconMediaId]);
      content = <BrandForm initial={settings.brand} media={media} />;
      break;
    }
    case "tracking":
      content = <TrackingForm initial={settings.tracking} />;
      break;
    case "seo": {
      const media = await mediaFor([settings.seo.ogImageMediaId]);
      content = <SeoDefaultsForm initial={settings.seo} media={media} />;
      break;
    }
    case "footer":
      content = <FooterForm initial={settings.footer} />;
      break;
    case "users": {
      const users = await db.select({ id: userTable.id, name: userTable.name, email: userTable.email, role: userTable.role }).from(userTable).orderBy(asc(userTable.createdAt));
      content = <UsersManager users={users} currentId={me.id} />;
      break;
    }
    default:
      content = <AccountForm name={me.name} email={me.email} />;
  }

  return (
    <>
      <PageHeader title="الإعدادات" description="كل ما تحتاج تغييره بدون تعديل الكود." />
      <nav aria-label="أقسام الإعدادات" className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {visibleTabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/settings?tab=${t.key}`}
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
      <div key={tab.key}>{content ?? <EmptyState icon={<SettingsIcon size={30} />} title="غير متاح" />}</div>
    </>
  );
}
