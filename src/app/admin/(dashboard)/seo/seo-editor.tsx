"use client";

import { useState } from "react";
import type { Localized, PublicMedia } from "@/server/db/schema/types";
import { Card, LocalizedField, Switch } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/media-library";
import { CharCount } from "@/components/admin/form-layout";
import { useAdminAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import { saveSeoAction } from "./actions";

export type SeoRow = { routeKey: string; label: string; path: string; title: Localized; description: Localized; ogImage: PublicMedia | null; noindex: boolean; fallbackTitle: string; fallbackDescription: string };

/** Google-style preview + editor for one page's SEO. */
export function SeoEditor({ row, siteUrl }: { row: SeoRow; siteUrl: string }) {
  const [v, setV] = useState(row);
  const { run, pending, errL } = useAdminAction();
  const previewTitle = v.title.ar || row.fallbackTitle;
  const previewDesc = v.description.ar || row.fallbackDescription;
  return (
    <Card title={row.label} description={`${siteUrl}/ar${row.path}`}>
      <div className="rounded-[var(--radius-md)] bg-paper p-4" aria-label="معاينة نتيجة البحث">
        <p className="t-latin truncate text-xs text-ink-600" dir="ltr">
          {siteUrl.replace(/^https?:\/\//, "")} › ar{row.path}
        </p>
        <p className="mt-1 truncate text-lg text-[#1a0dab]">{previewTitle}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-ink-600">{previewDesc}</p>
      </div>
      <LocalizedField label="العنوان" value={v.title} onChange={(title) => setV({ ...v, title })} errors={errL("title")} hint={<span>فارغ = {row.fallbackTitle} · <CharCount value={v.title.ar} max={60} /></span>} />
      <LocalizedField label="الوصف" multiline rows={2} value={v.description} onChange={(description) => setV({ ...v, description })} hint={<CharCount value={v.description.ar} max={160} />} />
      <MediaPicker label="صورة المشاركة (1200×630 مثالي)" value={v.ogImage} onChange={(ogImage) => setV({ ...v, ogImage })} folder="seo" aspect="aspect-[1200/630]" />
      <Switch label="إخفاء الصفحة من محركات البحث (noindex)" checked={v.noindex} onChange={(noindex) => setV({ ...v, noindex })} />
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() => run(() => saveSeoAction({ routeKey: v.routeKey, title: v.title, description: v.description, ogImageId: v.ogImage?.id ?? null, noindex: v.noindex }), { success: "تم حفظ SEO" })}
        >
          {pending ? "جارٍ الحفظ…" : "حفظ"}
        </Button>
      </div>
    </Card>
  );
}
