"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getMessages } from "@/messages";
import { buttonClasses } from "@/components/ui/button";
import { StatusPage } from "@/components/site/status-page";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = isLocale(params?.locale) ? params.locale : "ar";
  const t = getMessages(locale);
  return (
    <StatusPage
      code={t.notFound.code}
      title={t.notFound.title}
      body={t.notFound.body}
      actions={
        <>
          <Link href={`/${locale}`} className={buttonClasses("primary", "lg")}>
            {t.notFound.home}
          </Link>
          <Link href={`/${locale}/contact`} className={buttonClasses("outline-light", "lg")}>
            {t.nav.contact}
          </Link>
        </>
      }
    />
  );
}
