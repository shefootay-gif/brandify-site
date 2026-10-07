import { count, eq } from "drizzle-orm";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { leads } from "@/server/db/schema";
import { AdminShell } from "@/components/admin/shell";
import { Logo } from "@/components/site/logo";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [row] = await db.select({ n: count() }).from(leads).where(eq(leads.status, "new"));
  return (
    <AdminShell user={user} newLeads={row?.n ?? 0} logo={<Logo tone="light" height={30} />}>
      {children}
    </AdminShell>
  );
}
