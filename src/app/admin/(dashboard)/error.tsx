"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <AlertIcon size={36} className="mx-auto text-danger" />
      <h1 className="mt-4 text-xl font-bold text-navy-900">حدث خطأ أثناء تحميل الصفحة</h1>
      <p className="mt-2 text-ink-600">لم تُفقد أي بيانات. حاول مرة أخرى، وإذا تكرر الخطأ تأكد من أن قاعدة البيانات تعمل.</p>
      {error.digest && <p className="t-latin mt-2 text-xs text-ink-400">ref: {error.digest}</p>}
      <Button variant="secondary" className="mt-6" onClick={reset}>
        حاول مرة أخرى
      </Button>
    </div>
  );
}
