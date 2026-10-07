// Shapes stored in jsonb columns. Bilingual text is stored as { ar, en } so a
// third language can be added later without a migration.
export type Localized = { ar: string; en: string };

export type LocalizedItem = { title: Localized; description: Localized };

export type MediaVariant = { width: number; url: string };

/** Media fields safe to send to the browser. */
export type PublicMedia = {
  id: string;
  kind: "image" | "video" | "file";
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  variants: MediaVariant[];
  alt: Localized;
  mime: string;
};

export type ProjectCaseStudy = {
  strategy: Localized;
  creative: Localized;
  execution: Localized;
};

export type Utm = Partial<Record<"source" | "medium" | "campaign" | "term" | "content", string>>;
