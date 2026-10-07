import type { SiteSettings } from "@/content/settings";
import type { PublicService } from "@/server/services/catalog";
import { href, pick, type Locale } from "@/lib/i18n";
import type { Messages } from "@/messages";
import { LeadForm } from "./lead-form";

/** Server wrapper: resolves CMS form config + service options for the client form. */
export function LeadFormBlock({
  locale,
  settings,
  services,
  t,
  initialService,
  sourceCta,
}: {
  locale: Locale;
  settings: SiteSettings;
  services: PublicService[];
  t: Messages;
  initialService?: string;
  sourceCta: string;
}) {
  const serviceOptions = services.map((s) => ({ value: s.id, label: pick(s.title, locale) }));
  return (
    <LeadForm
      locale={locale}
      fields={settings.form.fields}
      services={serviceOptions}
      t={t.form}
      stepOf={t.common.stepOf}
      success={{ title: pick(settings.form.successTitle, locale), message: pick(settings.form.successMessage, locale) }}
      privacyHref={href(locale, "/privacy")}
      initialService={initialService && serviceOptions.some((o) => o.value === initialService) ? initialService : undefined}
      sourceCta={sourceCta}
    />
  );
}
