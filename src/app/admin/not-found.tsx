import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="text-center">
        <p className="t-latin text-7xl font-extrabold text-orange-500">404</p>
        <h1 className="mt-3 text-xl font-bold text-navy-900">الصفحة غير موجودة</h1>
        <p className="mt-2 text-ink-600">ربما حُذف العنصر أو تغيّر الرابط.</p>
        <Link href="/admin" className={buttonClasses("secondary", "md", "mt-6")}>
          العودة للوحة التحكم
        </Link>
      </div>
    </main>
  );
}
