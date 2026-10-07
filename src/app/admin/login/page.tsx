import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { Logo } from "@/components/site/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getSessionUser()) redirect("/admin");
  const { next } = await searchParams;
  // Only allow internal admin redirects (no open redirect).
  const target = typeof next === "string" && /^\/admin(\/[\w\-/]*)?$/.test(next) ? next : "/admin";

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section data-surface="dark" className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-12 text-white lg:flex">
        <Logo tone="light" height={40} priority />
        <div>
          <p className="t-display text-white">
            نتكلم. نصنع. <span className="text-orange-500">نبيع.</span>
          </p>
          <p className="mt-6 max-w-md text-white/60">لوحة تحكم Brandify: إدارة الطلبات والأعمال والمحتوى في مكان واحد.</p>
        </div>
        <p className="t-small text-white/55">© Brandify</p>
      </section>
      <section className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo height={36} priority />
          </div>
          <h1 className="t-h2 text-navy-900">تسجيل الدخول</h1>
          <p className="mt-2 text-ink-600">ادخل إلى لوحة التحكم.</p>
          <LoginForm next={target} />
        </div>
      </section>
    </main>
  );
}
