// Extracts transparent logo assets from the original logo image (white
// background) without altering the logo's colours or shapes.
//   node scripts/prepare-brand-assets.mjs "<path-to-logo.jpg>"
// Outputs to public/brand/: logo.png, logo-light.png (navy→white for dark
// backgrounds), mark.png, mark-light.png, plus app icons in src/app/.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/prepare-brand-assets.mjs <logo.jpg>");
  process.exit(1);
}
const outDir = path.join(process.cwd(), "public", "brand");
mkdirSync(outDir, { recursive: true });

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

// Un-composite from white: alpha from the darkest channel, then recover colour.
const rgba = Buffer.alloc(width * height * 4);
const rgbaLight = Buffer.alloc(width * height * 4);
const alphaAt = new Float32Array(width * height);
for (let i = 0; i < width * height; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  const min = Math.min(r, g, b);
  const x = i % width, y = Math.floor(i / width);
  // Ignore screenshot borders/edges around the artwork.
  const edge = x < 30 || y < 30 || x >= width - 30 || y >= height - 30;
  let a = edge ? 0 : (255 - min) / 255;
  a = a < 0.06 ? 0 : Math.min(1, (a - 0.06) / 0.9);
  alphaAt[i] = a;
  const un = (c) => (a > 0 ? Math.max(0, Math.min(255, Math.round((c - (1 - a) * 255) / a))) : 0);
  const [R, G, B] = [un(r), un(g), un(b)];
  const A = Math.round(a * 255);
  rgba.set([R, G, B, A], i * 4);
  const isNavy = B >= R; // orange has R ≫ B; navy has B > R
  rgbaLight.set(isNavy ? [255, 255, 255, A] : [R, G, B, A], i * 4);
}

// Bounding boxes: whole logo, and the mark (rows above the wordmark gap).
const rowHas = (y) => {
  for (let x = 0; x < width; x++) if (alphaAt[y * width + x] > 0.2) return true;
  return false;
};
const rows = [];
for (let y = 0; y < height; y++) rows.push(rowHas(y));
const top = rows.indexOf(true);
const bottom = rows.lastIndexOf(true);
let gap = -1;
for (let y = top + 50; y < bottom; y++) {
  if (!rows[y]) { gap = y; break; }
}

function bbox(y0, y1) {
  let x0 = width, x1 = 0;
  for (let y = y0; y <= y1; y++)
    for (let x = 0; x < width; x++)
      if (alphaAt[y * width + x] > 0.2) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}
const pad = (b, p) => ({ left: Math.max(0, b.left - p), top: Math.max(0, b.top - p), width: Math.min(width - Math.max(0, b.left - p), b.width + 2 * p), height: Math.min(height - Math.max(0, b.top - p), b.height + 2 * p) });

const full = pad(bbox(top, bottom), 4);
const mark = pad(bbox(top, gap - 1), 4);

const raw = (buf) => sharp(buf, { raw: { width, height, channels: 4 } });

await raw(rgba).extract(full).png().toFile(path.join(outDir, "logo.png"));
await raw(rgbaLight).extract(full).png().toFile(path.join(outDir, "logo-light.png"));
await raw(rgba).extract(mark).png().toFile(path.join(outDir, "mark.png"));
await raw(rgbaLight).extract(mark).png().toFile(path.join(outDir, "mark-light.png"));

// Horizontal lockup for the header: the same mark and wordmark, side by side.
let wTop = gap;
while (wTop < bottom && !rows[wTop]) wTop++;
const word = pad(bbox(wTop, bottom), 2);
for (const [buf, name] of [[rgba, "logo-horizontal.png"], [rgbaLight, "logo-horizontal-light.png"]]) {
  const m = await raw(buf).extract(mark).png().toBuffer();
  const w = await raw(buf).extract(word).png().toBuffer();
  const markH = Math.round(word.height * 1.75);
  const mRes = await sharp(m).resize({ height: markH }).toBuffer({ resolveWithObject: true });
  const spacing = Math.round(word.height * 0.35);
  const H = markH;
  const W = mRes.info.width + spacing + word.width;
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: mRes.data, left: 0, top: 0 },
      // Baseline-align the wordmark slightly above the bubble tail.
      { input: w, left: mRes.info.width + spacing, top: Math.round((H - word.height) * 0.42) },
    ])
    .png()
    .toFile(path.join(outDir, name));
}

// App icons: mark centred on white (favicon) and on navy (apple touch).
const markBuf = await raw(rgba).extract(mark).png().toBuffer();
const square = async (size, bg, inset) => {
  const inner = Math.round(size * inset);
  const m = await sharp(markBuf).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: m, gravity: "center" }])
    .png();
};
const appDir = path.join(process.cwd(), "src", "app");
await (await square(512, { r: 255, g: 255, b: 255, alpha: 1 }, 0.78)).toFile(path.join(appDir, "icon.png"));
await (await square(180, { r: 255, g: 255, b: 255, alpha: 1 }, 0.72)).toFile(path.join(appDir, "apple-icon.png"));

const meta = async (f) => sharp(path.join(outDir, f)).metadata();
for (const f of ["logo.png", "mark.png"]) {
  const m = await meta(f);
  console.log(`${f}: ${m.width}x${m.height}`);
}
