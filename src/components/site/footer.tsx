import Link from "next/link";
import type { SiteSettings } from "@/content/settings";
import type { PublicService } from "@/server/services/catalog";
import type { Messages } from "@/messages";
import { href, pick, type Locale } from "@/lib/i18n";
import { formatPhoneDisplay, whatsappLink } from "@/lib/whatsapp";
import { MailIcon, MapPinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";
import { LanguageSwitcher } from "./language-switcher";
import type { PublicMedia } from "@/server/db/schema/types";

type Props = {
  locale: Locale;
  settings: SiteSettings;
  services: PublicService[];
  nav: Array<{ href: string; label: string }>;
  t: Messages;
  logo: PublicMedia | null;
};

export function Footer({ locale, settings, services, nav, t, logo }: Props) {
  const year = new Date().getFullYear();
  const motto = pick(settings.brand.tagline, locale);
  const address = pick(settings.contact.address, locale);
  const note = pick(settings.footer.note, locale);

  return (
    <footer data-surface="dark" className="bg-navy-950 text-white">
      <div className="container-x pt-20 pb-10 md:pt-28">
        {motto && (
          <p
            aria-hidden="true"
            className="t-display mb-16 max-w-5xl text-white/95 md:mb-24 [&>span:last-child]:text-orange-500"
          >
            {motto.split(/(?<=\.)\s+/).map((part, i) => (
              <span key={i} className="me-[0.25em] inline-block">
                {part}
              </span>
            ))}
          </p>
        )}

        <div className="grid gap-12 border-t border-white/10 pt-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo variant="horizontal" tone="light" height={40} custom={logo} />
            <p className="mt-5 max-w-sm text-white/65 t-small leading-relaxed">{pick(settings.footer.description, locale)}</p>
            <SocialLinks
              social={settings.social}
              labels={t.social}
              className="mt-5 text-white/70 hover:bg-white/5 hover:text-white"
            />
          </div>

          <nav aria-label={t.footer.explore} className="md:col-span-2">
            <h2 className="t-eyebrow mb-4 text-white/55">{t.footer.explore}</h2>
            <ul className="space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/80 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.services} className="md:col-span-3">
            <h2 className="t-eyebrow mb-4 text-white/55">{t.footer.services}</h2>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={href(locale, `/services/${s.slug}`)} className="text-white/80 transition-colors hover:text-white">
                    {pick(s.title, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="t-eyebrow mb-4 text-white/55">{t.footer.contact}</h2>
            <ul className="space-y-3.5">
              <li>
                <a
                  href={whatsappLink(settings.contact.whatsapp, pick(settings.cta.whatsappMessage, locale))}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="whatsapp"
                  data-cta="footer"
                  className="inline-flex items-center gap-2.5 text-white/85 hover:text-white"
                >
                  <WhatsAppIcon size={18} className="text-orange-500" />
                  <span dir="ltr" className="t-latin">{formatPhoneDisplay(settings.contact.whatsapp)}</span>
                </a>
              </li>
              {settings.contact.email && (
                <li>
                  <a href={`mailto:${settings.contact.email}`} className="inline-flex items-center gap-2.5 text-white/85 hover:text-white">
                    <MailIcon size={18} className="text-orange-500" />
                    <span className="t-latin break-all">{settings.contact.email}</span>
                  </a>
                </li>
              )}
              {address && (
                <li className="inline-flex items-center gap-2.5 text-white/70">
                  <MapPinIcon size={18} className="text-orange-500" />
                  {address}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-white/50 t-small md:flex-row md:items-center md:justify-between">
          <p>
            © {year} <span className="t-latin">{settings.brand.name}</span>. {t.footer.rights}
            {note && <span className="ms-2">{note}</span>}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href={href(locale, "/privacy")} className="hover:text-white">
              {t.footer.privacy}
            </Link>
            <Link href={href(locale, "/terms")} className="hover:text-white">
              {t.footer.terms}
            </Link>
            <LanguageSwitcher
              locale={locale}
              label={t.nav.switchLanguage}
              ariaLabel={t.nav.switchLanguageLabel}
              className="-mx-3 text-white/60 hover:text-white"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
