"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AlertIcon, EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { inputClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("اكتب البريد الإلكتروني وكلمة المرور.");
      return;
    }
    setPending(true);
    try {
      const { error: err } = await authClient.signIn.email({ email: email.trim(), password });
      if (err) {
        setError(
          err.status === 429
            ? "محاولات كثيرة. انتظر بضع دقائق ثم حاول مرة أخرى."
            : "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        );
        setPending(false);
        return;
      }
      window.location.assign(next);
    } catch {
      setError("تعذر الاتصال بالخادم. تحقق من الإنترنت.");
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-8 space-y-5">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-[var(--radius-md)] bg-danger-bg p-3.5 text-sm text-danger">
          <AlertIcon size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy-900">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          type="email"
          dir="ltr"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(inputClass, "h-12 text-end")}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-navy-900">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            dir="ltr"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(inputClass, "h-12 ps-11")}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="absolute start-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded text-ink-600 hover:text-navy-900"
          >
            {show ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
      </div>
      <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={pending}>
        {pending ? "جارٍ الدخول…" : "دخول"}
      </Button>
    </form>
  );
}
