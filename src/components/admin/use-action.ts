"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "./toast";

type Result<T> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const messages: Record<string, string> = {
  unauthorized: "انتهت الجلسة. سجّل الدخول مرة أخرى.",
  forbidden: "ليست لديك صلاحية لهذا الإجراء.",
  invalid: "راجع الحقول المعلّمة باللون الأحمر.",
  duplicate: "الرابط (slug) مستخدم بالفعل. اختر رابطًا آخر.",
  not_found: "العنصر غير موجود، ربما حُذف.",
  in_use: "لا يمكن حذف هذا العنصر لأنه مستخدم في مكان آخر.",
  server: "حدث خطأ في الخادم. حاول مرة أخرى.",
  network: "تعذر الاتصال بالخادم. تحقق من الإنترنت.",
};

/** Runs a server action with pending state, toasts and field errors. */
export function useAdminAction() {
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const router = useRouter();

  function run<T>(
    action: () => Promise<Result<T>>,
    opts: { success?: string; onSuccess?: (data: T | undefined) => void; onError?: () => void; refresh?: boolean } = {},
  ) {
    startTransition(async () => {
      let res: Result<T>;
      try {
        res = await action();
      } catch {
        toast(messages.network!, "error");
        opts.onError?.();
        return;
      }
      if (res.ok) {
        setFieldErrors({});
        if (opts.success) toast(opts.success, "success");
        opts.onSuccess?.(res.data);
        if (opts.refresh !== false) router.refresh();
      } else {
        setFieldErrors(res.fieldErrors ?? {});
        toast(messages[res.error] ?? messages.server!, "error");
        opts.onError?.();
        if (res.error === "unauthorized") router.push("/admin/login");
      }
    });
  }

  /** Error for a nested path, e.g. err("title.ar"). */
  const err = (path: string) => fieldErrors[path];
  const errL = (path: string) => ({ ar: fieldErrors[`${path}.ar`], en: fieldErrors[`${path}.en`] });

  return { run, pending, fieldErrors, err, errL, setFieldErrors };
}
