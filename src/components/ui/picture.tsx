import type { PublicMedia } from "@/server/db/schema/types";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  media: Pick<PublicMedia, "url" | "width" | "height" | "variants" | "blurDataUrl" | "alt">;
  locale: Locale;
  sizes: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
};

/**
 * Responsive image for uploaded media. Width variants are generated at upload
 * time, so this needs no runtime image optimiser and works with any storage.
 */
export function Picture({ media, locale, sizes, alt, className, priority, fit = "cover" }: Props) {
  const srcSet = [...media.variants]
    .sort((a, b) => a.width - b.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      srcSet={srcSet || undefined}
      sizes={sizes}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      alt={alt ?? pick(media.alt, locale)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain", className)}
      style={
        media.blurDataUrl
          ? { backgroundImage: `url(${media.blurDataUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    />
  );
}
