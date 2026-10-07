import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Allow-list sanitiser for rich text coming from the dashboard editor.
 * Everything else (scripts, styles, event handlers, iframes) is stripped.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "a", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          href: attribs.href ?? "#",
          ...(attribs.href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
      }),
    },
  }).trim();
}

export function sanitizeLocalizedHtml(value: { ar: string; en: string }) {
  return { ar: sanitizeRichText(value.ar), en: sanitizeRichText(value.en) };
}
