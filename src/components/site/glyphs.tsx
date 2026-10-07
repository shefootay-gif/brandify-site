import type { SVGProps } from "react";

// The three shapes inside the Brandify logo — the speech bubble (talk), the
// play button (create) and the price tag (sell) — drawn as line glyphs.
// Used as the visual language for services and the hero motif.

type P = SVGProps<SVGSVGElement> & { size?: number };

export function BubbleGlyph({ size = 48, ...p }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" {...p}>
      <path
        pathLength={1}
        d="M10 6h22a10 10 0 0 1 10 10v8a10 10 0 0 1-10 10H18l-8 8v-8.5A6 6 0 0 1 6 27.8V10a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayGlyph({ size = 48, ...p }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" {...p}>
      <path
        pathLength={1}
        d="M14 9.5v29a2 2 0 0 0 3 1.7l24-14.5a2 2 0 0 0 0-3.4L17 7.8a2 2 0 0 0-3 1.7Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TagGlyph({ size = 48, ...p }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" {...p}>
      <path
        pathLength={1}
        d="M6 10a4 4 0 0 1 4-4h17.3a4 4 0 0 1 2.9 1.2l11 11.5a4 4 0 0 1 0 5.6l-11 11.5a4 4 0 0 1-2.9 1.2H10a4 4 0 0 1-4-4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        transform="translate(0 4)"
      />
      <circle cx="30" cy="25" r="3" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

export const glyphs = { bubble: BubbleGlyph, play: PlayGlyph, tag: TagGlyph } as const;
export type GlyphName = keyof typeof glyphs;

export function Glyph({ name, ...p }: P & { name: string }) {
  const G = glyphs[(name as GlyphName) in glyphs ? (name as GlyphName) : "bubble"];
  return <G {...p} />;
}
