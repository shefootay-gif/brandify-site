"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import type { Localized } from "@/server/db/schema/types";
import { cn } from "@/lib/utils";

export const errorText: Record<string, string> = {
  required: "هذا الحقل مطلوب.",
  slug: "استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطة (-) فقط.",
  duplicate: "هذه القيمة مستخدمة بالفعل.",
  url: "اكتب رابطًا صحيحًا يبدأ بـ https://",
  min10: "10 أحرف على الأقل.",
  mismatch: "كلمتا المرور غير متطابقتين.",
  "invalid id": "المعرّف غير صحيح.",
  email: "اكتب بريدًا إلكترونيًا صحيحًا.",
  wrong_password: "كلمة المرور الحالية غير صحيحة.",
  self: "لا يمكنك تنفيذ هذا الإجراء على حسابك.",
  locked: "لا يمكن حذف هذا الحقل.",
};
export const fieldError = (code?: string) => (code ? errorText[code] ?? code : "");

export const inputClass =
  "w-full rounded-[var(--radius-md)] border border-line bg-white px-3.5 text-[0.95rem] text-navy-900 placeholder:text-ink-400 " +
  "transition-colors hover:border-navy-600/40 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 " +
  "aria-[invalid=true]:border-danger disabled:bg-paper-2";

export function FieldShell({
  label,
  hint,
  error,
  htmlFor,
  required,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-600">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{fieldError(error)}</p>}
    </div>
  );
}

type TextProps = Omit<ComponentProps<"input">, "onChange" | "value"> & {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  error?: string;
};

export function TextField({ label, value, onChange, hint, error, required, className, ...rest }: TextProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id} required={required} className={className}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error) || undefined}
        className={cn(inputClass, "h-11")}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  error,
  rows = 4,
  dir,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  error?: string;
  rows?: number;
  dir?: "rtl" | "ltr";
  className?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <textarea
        id={id}
        dir={dir}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error) || undefined}
        className={cn(inputClass, "py-2.5 leading-relaxed")}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  error,
  className,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: ReactNode;
  error?: string;
  className?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "h-11")}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Switch({
  label,
  checked,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-semibold text-navy-900">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-600">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-success" : "bg-line",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px] rtl:-translate-x-[22px]" : "translate-x-0.5 rtl:-translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

/** Arabic + English inputs side by side (stacked on small screens). */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
  required,
  hint,
  errors,
  className,
}: {
  label: string;
  value: Localized;
  onChange: (v: Localized) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  hint?: ReactNode;
  errors?: { ar?: string; en?: string };
  className?: string;
}) {
  const id = useId();
  const field = (lang: "ar" | "en") => {
    const common = {
      id: `${id}-${lang}`,
      dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const),
      lang,
      value: value?.[lang] ?? "",
      "aria-invalid": Boolean(errors?.[lang]) || undefined,
      "aria-label": `${label} (${lang === "ar" ? "عربي" : "English"})`,
    };
    return (
      <div className="relative">
        <span className="t-latin pointer-events-none absolute end-2.5 top-2 rounded bg-paper-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-600">
          {lang === "ar" ? "AR" : "EN"}
        </span>
        {multiline ? (
          <textarea
            {...common}
            rows={rows}
            onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
            className={cn(inputClass, "py-2.5 pe-11 leading-relaxed", lang === "en" && "font-[family-name:var(--font-latin)]")}
          />
        ) : (
          <input
            {...common}
            onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
            className={cn(inputClass, "h-11 pe-11", lang === "en" && "font-[family-name:var(--font-latin)]")}
          />
        )}
        {errors?.[lang] && <p className="mt-1 text-xs font-medium text-danger">{fieldError(errors[lang])}</p>}
      </div>
    );
  };
  return (
    <fieldset className={className}>
      <legend className="mb-1.5 text-sm font-semibold text-navy-900">
        {label}
        {required && <span className="text-danger"> *</span>}
      </legend>
      <div className="grid gap-2.5 md:grid-cols-2">
        {field("ar")}
        {field("en")}
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-600">{hint}</p>}
    </fieldset>
  );
}

export function Card({ title, description, children, actions, className }: { title?: string; description?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[var(--radius-lg)] border border-line bg-white", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="font-bold text-navy-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-600">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger" | "info" | "orange"; children: ReactNode }) {
  const tones = {
    neutral: "bg-paper-2 text-ink-600",
    success: "bg-success-bg text-success",
    warning: "bg-warning-bg text-warning",
    danger: "bg-danger-bg text-danger",
    info: "bg-info-bg text-info",
    orange: "bg-orange-100 text-orange-700",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", tones[tone])}>{children}</span>;
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-line bg-white px-6 py-14 text-center">
      {icon && <div className="mb-4 text-ink-400">{icon}</div>}
      <p className="font-bold text-navy-900">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-sm text-ink-600">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
