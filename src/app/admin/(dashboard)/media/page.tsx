import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shell";
import { MediaLibrary } from "@/components/admin/media-library";

export const metadata: Metadata = { title: "مكتبة الوسائط" };

export default function MediaAdminPage() {
  return (
    <>
      <PageHeader
        title="مكتبة الوسائط"
        description="ارفع الصور والفيديوهات مرة واحدة واستخدمها في أي مكان. الصور تُضغط وتُحوَّل تلقائيًا إلى WebP بعدة مقاسات للسرعة. الحد الأقصى: صور 15MB، فيديو 120MB."
      />
      <div className="rounded-[var(--radius-lg)] border border-line bg-white p-4 md:p-5">
        <MediaLibrary mode="manage" />
      </div>
    </>
  );
}
