import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";

export const tags = {
  settings: "settings",
  content: "content",
  services: "services",
  projects: "projects",
  categories: "categories",
  testimonials: "testimonials",
  clients: "clients",
  team: "team",
  faqs: "faqs",
  media: "media",
  seo: "seo",
} as const;
export type CacheTag = (typeof tags)[keyof typeof tags];

/**
 * Cache a public read. Results are JSON-serialised, so Dates come back as
 * strings — public queries should not rely on Date instances.
 */
export function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  key: string,
  cacheTags: CacheTag[],
): (...args: A) => Promise<R> {
  return unstable_cache(fn, [key], { tags: cacheTags, revalidate: 3600 });
}

/** Expire cached reads immediately after an admin change. */
export function invalidate(...cacheTags: CacheTag[]) {
  for (const tag of cacheTags) revalidateTag(tag, { expire: 0 });
}
