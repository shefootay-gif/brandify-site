import "server-only";
import { cache } from "react";
import { getSettings } from "./settings";
import { getPublicServices, getPublicTestimonials, getMediaByIds } from "./catalog";

/** Data needed by the site chrome (header, footer, metadata) on every page. */
export const getSiteChrome = cache(async () => {
  const settings = await getSettings();
  const [services, testimonials, brandMedia] = await Promise.all([
    getPublicServices(),
    getPublicTestimonials(),
    getMediaByIds(
      [settings.brand.logoMediaId, settings.brand.logoOnDarkMediaId, settings.brand.faviconMediaId, settings.seo.ogImageMediaId].filter(
        (x): x is string => Boolean(x),
      ),
    ),
  ]);
  const byId = (id: string | null) => (id ? brandMedia.find((m) => m.id === id) ?? null : null);
  return {
    settings,
    services,
    hasTestimonials: testimonials.length > 0,
    logo: byId(settings.brand.logoMediaId),
    logoOnDark: byId(settings.brand.logoOnDarkMediaId),
    ogImage: byId(settings.seo.ogImageMediaId),
    favicon: byId(settings.brand.faviconMediaId),
  };
});
