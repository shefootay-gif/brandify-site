import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { contentBlocks, settings } from "@/server/db/schema";
import { cached, tags } from "@/server/cache";
import { defaultSettings, siteSettingsSchema, type SiteSettings } from "@/content/settings";
import { blockDefaults, blockSchemas, type BlockData, type BlockKey } from "@/content/blocks";
import { mergeDefaults } from "@/lib/merge";

const SITE_KEY = "site";

export const getSettings = cached(
  async (): Promise<SiteSettings> => {
    const [row] = await db.select().from(settings).where(eq(settings.key, SITE_KEY));
    return mergeDefaults(defaultSettings, row?.value);
  },
  "settings:site",
  [tags.settings],
);

export async function saveSettings(input: unknown): Promise<SiteSettings> {
  const value = siteSettingsSchema.parse(input);
  await db
    .insert(settings)
    .values({ key: SITE_KEY, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  return value;
}

export const getBlock = cached(
  async <K extends BlockKey>(key: K): Promise<BlockData<K>> => {
    const [row] = await db.select().from(contentBlocks).where(eq(contentBlocks.key, key));
    return mergeDefaults(blockDefaults[key], row?.data) as BlockData<K>;
  },
  "content:block",
  [tags.content],
) as <K extends BlockKey>(key: K) => Promise<BlockData<K>>;

export async function saveBlock<K extends BlockKey>(key: K, input: unknown, userId: string) {
  const data = blockSchemas[key].parse(input);
  await db
    .insert(contentBlocks)
    .values({ key, data, updatedBy: userId })
    .onConflictDoUpdate({ target: contentBlocks.key, set: { data, updatedBy: userId, updatedAt: new Date() } });
  return data as BlockData<K>;
}
