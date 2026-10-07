"use client";

import type { PublicMedia } from "@/server/db/schema/types";
import { EntityManager, type EntityFormProps, type EntityRow } from "@/components/admin/entity-manager";
import { Switch, TextField } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/media-library";
import { AlertIcon, BuildingIcon } from "@/components/ui/icons";

export type ClientValue = { name: string; logo: PublicMedia | null; url: string; visible: boolean };

function ClientForm({ value: v, onChange, err }: EntityFormProps<ClientValue>) {
  const set = <K extends keyof ClientValue>(k: K, val: ClientValue[K]) => onChange({ ...v, [k]: val });
  return (
    <>
      <p className="flex items-start gap-2 rounded-[var(--radius-md)] bg-warning-bg p-3 text-sm text-warning">
        <AlertIcon size={17} className="mt-0.5 shrink-0" />
        أضف لوجوهات العملاء الذين تعاملت معهم فعلًا ووافقوا على عرض شعارهم فقط.
      </p>
      <TextField label="اسم العميل" required value={v.name} onChange={(x) => set("name", x)} error={err("name")} />
      <MediaPicker label="اللوجو" value={v.logo} onChange={(m) => set("logo", m)} folder="clients" aspect="aspect-[3/2]" hint="يُفضّل PNG بخلفية شفافة. اللوجو يظهر بالرمادي ويتلوّن عند المرور عليه." />
      <TextField label="رابط الموقع (اختياري)" dir="ltr" value={v.url} onChange={(x) => set("url", x)} error={err("url")} placeholder="https://" />
      <Switch label="ظاهر في الموقع" checked={v.visible} onChange={(b) => set("visible", b)} />
    </>
  );
}

export function ClientsManager({ rows }: { rows: EntityRow<ClientValue>[] }) {
  return (
    <EntityManager<ClientValue>
      entity="clients"
      rows={rows}
      emptyIcon={<BuildingIcon size={32} />}
      empty={{ title: "لا توجد لوجوهات بعد", body: "قسم «عملوا معنا» مخفي في الموقع حتى تضيف أول لوجو ظاهر." }}
      addLabel="إضافة عميل"
      dialogTitle={{ add: "عميل جديد", edit: "تعديل العميل" }}
      visibleLabels={{ on: "إظهار", off: "مخفي" }}
      newValue={() => ({ name: "", logo: null, url: "", visible: true })}
      toPayload={(v) => ({ name: v.name, logoMediaId: v.logo?.id ?? null, url: v.url, visible: v.visible })}
      Form={ClientForm}
      context={undefined}
    />
  );
}
