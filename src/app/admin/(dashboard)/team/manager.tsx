"use client";

import type { Localized, PublicMedia } from "@/server/db/schema/types";
import { EntityManager, type EntityFormProps, type EntityRow } from "@/components/admin/entity-manager";
import { LocalizedField, Switch } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/media-library";
import { UsersIcon } from "@/components/ui/icons";

export type TeamValue = { name: Localized; role: Localized; bio: Localized; photo: PublicMedia | null; video: PublicMedia | null; isFounder: boolean; visible: boolean };

function TeamForm({ value: v, onChange, errL }: EntityFormProps<TeamValue>) {
  const set = <K extends keyof TeamValue>(k: K, val: TeamValue[K]) => onChange({ ...v, [k]: val });
  return (
    <>
      <LocalizedField label="الاسم" required value={v.name} onChange={(x) => set("name", x)} errors={errL("name")} />
      <LocalizedField label="المسمى / الدور" value={v.role} onChange={(x) => set("role", x)} />
      <LocalizedField label="نبذة" multiline rows={3} value={v.bio} onChange={(x) => set("bio", x)} />
      <div className="grid gap-5 sm:grid-cols-2">
        <MediaPicker label="الصورة" value={v.photo} onChange={(m) => set("photo", m)} folder="team" aspect="aspect-[4/5]" />
        <MediaPicker label="فيديو (اختياري)" kind="video" value={v.video} onChange={(m) => set("video", m)} folder="team" aspect="aspect-[4/5]" hint="للمؤسس: فيديو قصير يظهر بدل الصورة." />
      </div>
      <div className="space-y-4 rounded-[var(--radius-md)] bg-paper p-4">
        <Switch label="المؤسس" hint="يظهر في قسم «من يقف خلف Brandify» في الرئيسية وصفحة من نحن." checked={v.isFounder} onChange={(b) => set("isFounder", b)} />
        <Switch label="ظاهر في الموقع" checked={v.visible} onChange={(b) => set("visible", b)} />
      </div>
    </>
  );
}

export function TeamManager({ rows }: { rows: EntityRow<TeamValue>[] }) {
  return (
    <EntityManager<TeamValue>
      entity="team"
      rows={rows}
      emptyIcon={<UsersIcon size={32} />}
      empty={{ title: "لا يوجد أعضاء", body: "أضف المؤسس أو أعضاء الفريق الحقيقيين." }}
      addLabel="إضافة عضو"
      dialogTitle={{ add: "عضو جديد", edit: "تعديل العضو" }}
      visibleLabels={{ on: "إظهار", off: "مخفي" }}
      newValue={() => ({ name: { ar: "", en: "" }, role: { ar: "", en: "" }, bio: { ar: "", en: "" }, photo: null, video: null, isFounder: false, visible: true })}
      toPayload={(v) => ({ name: v.name, role: v.role, bio: v.bio, photoMediaId: v.photo?.id ?? null, videoMediaId: v.video?.id ?? null, isFounder: v.isFounder, visible: v.visible })}
      Form={TeamForm}
      context={undefined}
    />
  );
}
