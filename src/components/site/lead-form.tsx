"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormField } from "@/content/settings";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { UNSURE_SERVICE, validateLead } from "@/lib/validation/lead-client";
import { format, type Messages } from "@/messages";
import { submitLead, type LeadFormState } from "@/app/[locale]/actions";
import { Button } from "@/components/ui/button";
import { AlertIcon, ArrowIcon, CheckIcon, ChevronDownIcon, WhatsAppIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  fields: FormField[];
  services: Array<{ value: string; label: string }>;
  t: Messages["form"];
  stepOf: string;
  success: { title: string; message: string };
  privacyHref: string;
  initialService?: string;
  sourceCta: string;
  tone?: "light" | "dark";
};

const UTM_KEY = "brandify_utm";

/** Two-step project enquiry form. Server validation is the source of truth. */
export function LeadForm({ locale, fields, services, t, stepOf, success, privacyHref, initialService, sourceCta }: Props) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, { status: "idle" });
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of fields) v[f.key] = "";
    if (initialService) v.service = initialService;
    return v;
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [startedAt] = useState(() => Date.now());
  const [utm, setUtm] = useState("{}");
  const [page, setPage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const enabled = useMemo(() => fields.filter((f) => f.enabled), [fields]);
  const hasStep2 = enabled.some((f) => f.step === 2);
  const serviceValues = useMemo(() => services.map((s) => s.value), [services]);

  // First-touch UTM attribution, kept for the browser session.
  useEffect(() => {
    setPage(window.location.pathname);
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl: Record<string, string> = {};
      for (const k of ["source", "medium", "campaign", "term", "content"]) {
        const v = params.get(`utm_${k}`);
        if (v) fromUrl[k] = v.slice(0, 100);
      }
      const stored = sessionStorage.getItem(UTM_KEY);
      if (Object.keys(fromUrl).length && !stored) sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
      setUtm(sessionStorage.getItem(UTM_KEY) ?? JSON.stringify(fromUrl));
    } catch {
      /* storage unavailable — attribution is optional */
    }
  }, []);

  const serverErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const errors = { ...serverErrors, ...clientErrors };

  useEffect(() => {
    if (state.status === "error") {
      // If the server flagged a step-1 field, go back to it.
      const keys = Object.keys(state.fieldErrors ?? {});
      if (keys.some((k) => enabled.find((f) => f.key === k)?.step === 1)) setStep(1);
      summaryRef.current?.focus();
    }
    if (state.status === "success") {
      successRef.current?.focus();
      const w = window as Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; ttq?: { track: (e: string) => void } };
      w.gtag?.("event", "generate_lead", { form: sourceCta });
      w.fbq?.("track", "Lead");
      w.ttq?.track("SubmitForm");
    }
  }, [state, enabled, sourceCta]);

  const validate = (keys: string[]) => {
    const next = validateLead(enabled, values, serviceValues, keys);
    setClientErrors(next);
    return next;
  };

  const goNext = () => {
    const e = validate(enabled.filter((f) => f.step === 1).map((f) => f.key));
    if (Object.keys(e).length) {
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus();
      return;
    }
    setStep(2);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[data-step='2'] input, [data-step='2'] select, [data-step='2'] textarea")?.focus());
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Enter on step 1 advances instead of submitting early.
    if (hasStep2 && step === 1) {
      e.preventDefault();
      goNext();
      return;
    }
    const errs = validate(enabled.map((f) => f.key));
    if (Object.keys(errs).length) {
      e.preventDefault();
      if (Object.keys(errs).some((k) => enabled.find((f) => f.key === k)?.step === 1)) setStep(1);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  };

  const set = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (clientErrors[key]) setClientErrors((c) => ({ ...c, [key]: "" }));
  };

  const errText = (code?: string) => (code ? t.errors[code as keyof typeof t.errors] ?? t.errors.generic : "");

  if (state.status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="flex flex-col items-start outline-none">
        <span className="shape-bubble inline-flex size-14 items-center justify-center bg-success text-white">
          <CheckIcon size={28} />
        </span>
        <h3 className="t-h3 mt-6 text-navy-900">{success.title}</h3>
        <p className="mt-3 max-w-lg text-ink-600">{success.message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {state.whatsappUrl && (
            <a
              href={state.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp"
              data-cta="form-success"
              className="shape-bubble inline-flex h-14 items-center justify-center gap-2 bg-orange-500 px-7 font-semibold text-navy-950 hover:bg-orange-600"
            >
              <WhatsAppIcon size={22} />
              {t.continueWhatsapp}
            </a>
          )}
          <Button variant="subtle" size="lg" onClick={() => window.location.reload()}>
            {t.sendAnother}
          </Button>
        </div>
      </div>
    );
  }

  const errorKeys = Object.entries(errors).filter(([, v]) => v);
  const topError =
    state.status === "error" && state.code !== "invalid"
      ? t.errors[state.code]
      : errorKeys.length
        ? t.errors.generic
        : "";

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} noValidate aria-describedby={`${formId}-steps`}>
      {/* Spam honeypot (hidden from people and assistive tech) */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="_ts" value={startedAt} />
      <input type="hidden" name="_utm" value={utm} />
      <input type="hidden" name="_page" value={page} />
      <input type="hidden" name="_cta" value={sourceCta} />
      <input type="hidden" name="_locale" value={locale} />

      {hasStep2 && (
        <div id={`${formId}-steps`} className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-navy-900">{step === 1 ? t.step1 : t.step2}</span>
            <span className="t-latin text-ink-600">{format(stepOf, { current: step, total: 2 })}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5" aria-hidden="true">
            <span className="h-1 rounded-full bg-orange-500" />
            <span className={cn("h-1 rounded-full transition-colors duration-500", step === 2 ? "bg-orange-500" : "bg-line")} />
          </div>
        </div>
      )}

      <div ref={summaryRef} tabIndex={-1} aria-live="assertive" className="outline-none">
        {topError && (
          <p className="mb-6 flex items-start gap-2.5 rounded-[var(--radius-md)] bg-danger-bg p-4 text-sm text-danger">
            <AlertIcon size={18} className="mt-0.5 shrink-0" />
            {topError}
          </p>
        )}
      </div>

      {[1, 2].map((s) => (
        <fieldset key={s} data-step={s} hidden={hasStep2 && step !== s} className="grid gap-5 sm:grid-cols-2">
          <legend className="sr-only">{s === 1 ? t.step1 : t.step2}</legend>
          {enabled
            .filter((f) => (hasStep2 ? f.step === s : s === 1))
            .map((f) => (
              <Field
                key={f.key}
                field={f}
                locale={locale}
                value={values[f.key] ?? ""}
                onChange={(v) => set(f.key, v)}
                error={errText(errors[f.key])}
                services={services}
                t={t}
                formId={formId}
              />
            ))}
        </fieldset>
      ))}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-small text-ink-600">
          {t.privacyNote.split("{privacy}")[0]}
          <Link href={privacyHref} className="text-orange-700 underline underline-offset-2">
            {t.privacyLink}
          </Link>
          {t.privacyNote.split("{privacy}")[1]}
        </p>
        <div className="flex gap-3">
          {hasStep2 && step === 2 && (
            <Button key="back" variant="subtle" size="lg" onClick={() => setStep(1)}>
              {t.back}
            </Button>
          )}
          {/* Distinct keys: reusing one <button> and flipping its type mid-click would submit the form. */}
          {hasStep2 && step === 1 ? (
            <Button key="next" variant="secondary" size="lg" onClick={goNext} className="flex-1 sm:flex-none">
              {t.next}
              <ArrowIcon size={18} className="flip-rtl" />
            </Button>
          ) : (
            <Button key="submit" type="submit" variant="primary" size="lg" disabled={pending} aria-disabled={pending} className="flex-1 sm:flex-none">
              {pending ? t.submitting : t.submit}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({
  field,
  locale,
  value,
  onChange,
  error,
  services,
  t,
  formId,
}: {
  field: FormField;
  locale: Locale;
  value: string;
  onChange: (v: string) => void;
  error: string;
  services: Array<{ value: string; label: string }>;
  t: Messages["form"];
  formId: string;
}) {
  const id = `${formId}-${field.key}`;
  const required = field.required || field.key === "name" || field.key === "whatsapp";
  const label = pick(field.label, locale);
  const placeholder = pick(field.placeholder, locale);
  const wide = field.type === "textarea" || field.key === "service";
  const common = {
    id,
    name: field.key,
    value,
    required,
    "aria-required": required,
    "aria-invalid": Boolean(error) || undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
    className: cn(
      "w-full rounded-[var(--radius-md)] border bg-white px-4 text-navy-900 transition-colors placeholder:text-ink-400",
      "focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40",
      error ? "border-danger" : "border-line hover:border-navy-600/40",
    ),
  };
  const autoComplete: Record<string, string> = { name: "name", email: "email", whatsapp: "tel", company: "organization" };

  let control: React.ReactNode;
  if (field.type === "select") {
    const options =
      field.key === "service"
        ? [...services, { value: UNSURE_SERVICE, label: t.unsureService }]
        : field.options.map((o) => ({ value: o.value, label: pick(o.label, locale) }));
    control = (
      <div className="relative">
        <select {...common} onChange={(e) => onChange(e.target.value)} className={cn(common.className, "h-13 appearance-none pe-10")}>
          <option value="">{placeholder || "—"}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon size={18} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-ink-600" />
      </div>
    );
  } else if (field.type === "textarea") {
    control = (
      <textarea {...common} rows={5} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(common.className, "py-3")} />
    );
  } else {
    control = (
      <input
        {...common}
        type={field.type}
        inputMode={field.type === "tel" ? "tel" : field.type === "email" ? "email" : undefined}
        dir={field.type === "tel" || field.type === "email" ? "ltr" : undefined}
        autoComplete={autoComplete[field.key]}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(common.className, "h-13", (field.type === "tel" || field.type === "email") && "text-start rtl:text-end")}
      />
    );
  }

  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-2 text-sm font-semibold text-navy-900">
        <span>
          {label}
          {required && <span className="text-danger" aria-hidden="true"> *</span>}
        </span>
        {!required && <span className="text-xs font-normal text-ink-400">{t.optional}</span>}
      </label>
      {control}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
