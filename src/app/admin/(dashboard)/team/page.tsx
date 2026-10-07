import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/server/db";
import { teamMembers } from "@/server/db/schema";
import { mediaFor } from "@/server/admin/common";
import { PageHeader } from "@/components/admin/shell";
import { InfoIcon } from "@/components/ui/icons";
import { TeamManager } from "./manager";

export const metadata: Metadata = { title: "الفريق والمؤسس" };

export default async function TeamAdminPage() {
  const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder));
  const media = await mediaFor(rows.flatMap((r) => [r.photoMediaId, r.videoMediaId]));
  const founderHidden = rows.some((r) => r.isFounder && !r.visible);
  return (
    <>
      <PageHeader title="الفريق والمؤسس" description="قسم المؤسس يبني الثقة. أضف اسمك وصورتك أو فيديو قصيرًا ثم فعّل الظهور." />
      {founderHidden && (
        <p className="mb-5 flex items-start gap-2 rounded-[var(--radius-md)] bg-info-bg p-4 text-sm text-info">
          <InfoIcon size={18} className="mt-0.5 shrink-0" />
          بطاقة المؤسس مخفية حاليًا. عدّل الاسم من «[اسم المؤسس]» إلى اسمك الحقيقي، أضف صورة، ثم فعّل «ظاهر في الموقع».
        </p>
      )}
      <TeamManager
        rows={rows.map((m) => {
          const photo = m.photoMediaId ? media[m.photoMediaId] ?? null : null;
          const video = m.videoMediaId ? media[m.videoMediaId] ?? null : null;
          return {
            id: m.id,
            title: m.name.ar || m.name.en,
            subtitle: m.role.ar,
            thumb: photo,
            visible: m.visible,
            badges: m.isFounder ? [{ label: "المؤسس", tone: "orange" as const }] : [],
            value: { name: m.name, role: m.role, bio: m.bio, photo, video, isFounder: m.isFounder, visible: m.visible },
          };
        })}
      />
    </>
  );
}
