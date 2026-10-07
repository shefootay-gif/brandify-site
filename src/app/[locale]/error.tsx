"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getMessages } from "@/messages";
import { Button, buttonClasses } from "@/components/ui/button";
import { StatusPage } from "@/components/site/status-page";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale?: string }>();
  const locale = isLocale(params?.locale) ? params.locale : "ar";
  const t = getMessages(locale);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      title={t.error.title}
      body={t.error.body}
      actions={
        <>
          <Button variant="primary" size="lg" onClick={reset}>
            {t.error.retry}
          </Button>
          <Link href={`/${locale}`} className={buttonClasses("outline-light", "lg")}>
            {t.notFound.home}
          </Link>
        </>
      }
    />
  );
}
