import Link from "next/link";
import { pick, href, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/content/settings";
import { formatPhoneDisplay } from "@/lib/whatsapp";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppLink } from "./whatsapp-link";
import { BubbleOutline } from "./section";

type Props = {
  locale: Locale;
  settings: SiteSettings;
  title: string;
  subtitle?: string;
  /** Overrides the default WhatsApp message (e.g. service-specific). */
  message?: string;
  cta: string;
  showForm?: boolean;
};

/** Closing call-to-action used at the end of pages. */
export function CtaBand({ locale, settings, title, subtitle, message, cta, showForm = true }: Props) {
  return (
    <section data-surface="dark" data-final-cta className="relative overflow-hidden bg-navy-900 text-white">
      <BubbleOutline className="pointer-events-none absolute -start-28 -top-32 w-[30rem] text-navy-800" />
      <div className="container-x section-y relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="t-h1" data-reveal>
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/70" data-reveal style={{ ["--reveal-i" as string]: 1 }}>
              {subtitle}
            </p>
          )}
          <div
            className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            data-reveal
            style={{ ["--reveal-i" as string]: 2 }}
          >
            <WhatsAppLink
              number={settings.contact.whatsapp}
              message={message ?? pick(settings.cta.whatsappMessage, locale)}
              label={pick(settings.cta.whatsappLabel, locale)}
              cta={cta}
              size="lg"
              magnetic
            />
            {showForm && (
              <Link href={href(locale, "/start-project")} className={buttonClasses("outline-light", "lg")}>
                {pick(settings.cta.formLabel, locale)}
              </Link>
            )}
          </div>
          <p className="t-small mt-8 text-white/50" data-reveal style={{ ["--reveal-i" as string]: 3 }}>
            <span dir="ltr" className="t-latin">{formatPhoneDisplay(settings.contact.whatsapp)}</span>
            {settings.contact.email && (
              <>
                <span className="mx-3 text-white/25">/</span>
                <a href={`mailto:${settings.contact.email}`} className="t-latin hover:text-white">
                  {settings.contact.email}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
