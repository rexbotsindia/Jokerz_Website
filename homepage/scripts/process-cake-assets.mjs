// Turns the client-supplied cake renders (white backgrounds) into transparent cut-outs for Chapter 03.
// - Background removal = flood fill from the image border over near-white neutral pixels only, so the
//   cream (warm off-white, enclosed by the cake) is never removed; then a soft anti-aliased edge.
// - Cocoa / golden layers are tinted from the chocolate / vanilla renders, sponge pixels only.
// - The toppings sheet is split into individual pieces (cherries, rosettes, chocolate) by connected components.
// Usage: node scripts/process-cake-assets.mjs
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '..', '..', 'source-images', 'client');
const OUT = join(here, '..', '..', 'public', 'assets', 'cake');
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.startsWith('topping-')) rmSync(join(OUT, f)); // regenerate pieces from scratch

async function load(file) {
  const { data, info } = await sharp(join(SRC, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { px: data, w: info.width, h: info.height };
}

const isBgColour = (r, g, b) => Math.min(r, g, b) >= 238 && Math.max(r, g, b) - Math.min(r, g, b) <= 12;

/** Flood-fills the border-connected background and returns a Uint8Array mask (1 = background). */
function backgroundMask({ px, w, h }) {
  const bg = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (bg[i]) return;
    const o = i * 4;
    if (!isBgColour(px[o], px[o + 1], px[o + 2])) return;
    bg[i] = 1; stack.push(i);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const i = stack.pop(); const x = i % w, y = (i / w) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return bg;
}

/** Applies the mask as alpha with a soft, de-fringed edge. */
function applyAlpha(img, bg) {
  const { px, w, h } = img;
  const a = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = bg[i] ? 0 : 1;
  // edge pixels next to the background: partial alpha based on how white they are (removes the white halo)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (bg[i]) continue;
    const edge = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w]);
    if (!edge) continue;
    const o = i * 4; const m = Math.min(px[o], px[o + 1], px[o + 2]);
    a[i] = Math.max(0.25, Math.min(1, (255 - m) / 40));
  }
  // light 3x3 blur on alpha for a natural edge
  const out = new Float32Array(a);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    if (a[i] === 1 && a[i - 1] === 1 && a[i + 1] === 1 && a[i - w] === 1 && a[i + w] === 1) continue;
    let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += a[i + dy * w + dx];
    out[i] = s / 9;
  }
  for (let i = 0; i < w * h; i++) px[i * 4 + 3] = Math.round(out[i] * 255);
  return img;
}

/** Recolours sponge pixels only (cream stays untouched) with a smooth luminance ramp. */
function tintSponge(img, fn) {
  const { px, w, h } = img;
  for (let i = 0; i < w * h; i++) {
    const o = i * 4; if (px[o + 3] === 0) continue;
    const r = px[o], g = px[o + 1], b = px[o + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const k = Math.max(0, Math.min(1, (232 - lum) / 22)); // 0 for cream, 1 for sponge
    if (!k) continue;
    const [nr, ng, nb] = fn(r, g, b);
    px[o] = Math.round(r + (nr - r) * k); px[o + 1] = Math.round(g + (ng - g) * k); px[o + 2] = Math.round(b + (nb - b) * k);
  }
  return img;
}

const clamp = (v) => Math.max(0, Math.min(255, v));

async function save(img, name, width, crop = null) {
  let src = await sharp(img.px, { raw: { width: img.w, height: img.h, channels: 4 } }).png().toBuffer();
  if (crop) src = await sharp(src).extract(crop).png().toBuffer(); // extract first: sharp would otherwise trim before extracting
  const buf = await sharp(src).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 }).png().toBuffer();
  const info = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 95, effort: 5 }).toFile(join(OUT, `${name}.webp`));
  console.log('ok', name, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
  return { name, file: `assets/cake/${name}.webp`, width: info.width, height: info.height };
}

const results = { layers: {}, pieces: [] };

const cutout = async (file) => { const img = await load(file); return applyAlpha(img, backgroundMask(img)); };
const clone = (img) => ({ ...img, px: Buffer.from(img.px) });

// --- sponge layers (bottom -> top in the reference: chocolate, vanilla, cocoa, golden, vanilla) ---
const choc = await cutout('layer-chocolate-cream.webp');
const van = await cutout('layer-vanilla-cream.webp');
results.layers.chocolate = await save(clone(choc), 'layer-chocolate', 900);
results.layers.vanilla = await save(clone(van), 'layer-vanilla', 900);
results.layers.cocoa = await save(tintSponge(clone(choc), (r, g, b) => [clamp(r * 1.32 + 30), clamp(g * 1.5 + 26), clamp(b * 1.6 + 20)]), 'layer-cocoa', 900);
results.layers.golden = await save(tintSponge(clone(van), (r, g, b) => [clamp(r * 1.02), clamp(g * 0.84), clamp(b * 0.42)]), 'layer-golden', 900);

// --- finished layered cake (the end state) and the frosted Black Forest (signature six) ---
results.layered = await save(await cutout('black-forest-layered.webp'), 'black-forest-layered', 1100);
results.frosted = await save(await cutout('black-forest-frosted.webp'), 'black-forest-frosted', 900);

// --- toppings sheet -> individual pieces ---
// Pieces overlap on the sheet, so pixels are first split by colour class (cherry red / cream / chocolate),
// then into connected components within each class.
const sheet = await cutout('black-forest-toppings.webp');
{
  const { px, w, h } = sheet;
  const cls = new Uint8Array(w * h); // 0 none, 1 cherry, 2 cream, 3 chocolate
  for (let i = 0; i < w * h; i++) {
    const o = i * 4; if (px[o + 3] < 110) continue;
    const r = px[o], g = px[o + 1], b = px[o + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    cls[i] = (r > 120 && r - g > 75 && r - b > 60) ? 1 : lum > 175 ? 2 : 3;
  }
  const names = { 1: 'cherry', 2: 'rosette', 3: 'chocolate' };
  const minArea = { 1: 900, 2: 6000, 3: 260 };
  const seen = new Uint8Array(w * h);
  const count = { cherry: 0, rosette: 0, chocolate: 0 };
  for (let start = 0; start < w * h; start++) {
    const c = cls[start]; if (!c || seen[start]) continue;
    const comp = []; const stack = [start]; seen[start] = 1;
    let minX = w, minY = h, maxX = 0, maxY = 0;
    while (stack.length) {
      const i = stack.pop(); comp.push(i); const x = i % w, y = (i / w) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      for (const j of [i + 1, i - 1, i + w, i - w]) {
        if (j < 0 || j >= w * h || seen[j] || cls[j] !== c) continue;
        if (Math.abs((j % w) - x) > 1) continue;
        seen[j] = 1; stack.push(j);
      }
    }
    if (comp.length < minArea[c]) continue;
    const keep = new Uint8Array(w * h); comp.forEach((i) => { keep[i] = 1; });
    // grow 2px into anti-aliased edge pixels of the same piece
    for (let pass = 0; pass < 2; pass++) {
      const add = [];
      for (const i of comp) for (const j of [i + 1, i - 1, i + w, i - w]) if (j >= 0 && j < w * h && !keep[j] && px[j * 4 + 3] > 0 && (cls[j] === c || cls[j] === 0)) add.push(j);
      add.forEach((j) => { keep[j] = 1; comp.push(j); });
    }
    const piece = clone(sheet);
    for (let i = 0; i < w * h; i++) if (!keep[i]) piece.px[i * 4 + 3] = 0;
    const pad = 4;
    const crop = { left: Math.max(0, minX - pad), top: Math.max(0, minY - pad) };
    crop.width = Math.min(w, maxX + pad + 1) - crop.left; crop.height = Math.min(h, maxY + pad + 1) - crop.top;
    const type = names[c];
    results.pieces.push({ type, ...(await save(piece, `topping-${type}-${++count[type]}`, 400, crop)) });
  }
  console.log('pieces', count);
}
// --- "plain" frosted cake: the client's frosted render with its toppings smoothed away, so the toppings
//     can fall onto it in the animation. The top surface ellipse is repainted with cream sampled from the
//     cake's own frosting; anything that sticks up above the top surface is made transparent.
{
  const { data, info } = await sharp(join(OUT, 'black-forest-frosted.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const E = { cx: 452, cy: 276, rx: 414, ry: 172 }; // top surface, measured on the 900px cut-out
  // frosting colour: the bright (lit) part of the side, not its shaded average
  const lums = [];
  for (let y = Math.round(h * 0.56); y < Math.round(h * 0.66); y++) for (let x = 300; x < 600; x++) { const o = (y * w + x) * 4; lums.push([0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2], data[o], data[o + 1], data[o + 2]]); }
  lums.sort((p, q) => p[0] - q[0]);
  const top = lums.slice(Math.floor(lums.length * 0.75), Math.floor(lums.length * 0.92));
  const base = [0, 1, 2].map((c) => top.reduce((s, p) => s + p[c + 1], 0) / top.length);
  let seed = 7; const noise = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
  // gentle spatula swirls: a few low-frequency curved bands
  const swirl = (x, y) => 0.012 * Math.sin((x * 0.018) + Math.sin(y * 0.03) * 2.2) + 0.008 * Math.sin((x + y * 1.7) * 0.011);
  const sideRow = (x, y) => { const o = (Math.min(h - 1, y + 26) * w + x) * 4; return [data[o], data[o + 1], data[o + 2]]; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    const dx = (x - E.cx) / E.rx, dy = (y - E.cy) / E.ry, d = Math.sqrt(dx * dx + dy * dy);
    if (d <= 1.004) {
      // dome lighting: brighter towards the front-left, softly darker at the back rim; rounded rim highlight at the front
      let light = 1.055 - 0.045 * d * d - 0.03 * dy + 0.018 * -dx + swirl(x, y) * 1.6 + noise() * 0.024;
      if (d > 0.95) light += (dy > 0 ? 0.02 : -0.025) * ((d - 0.95) / 0.05);
      for (let c = 0; c < 3; c++) data[o + c] = Math.round(Math.max(0, Math.min(255, base[c] * light)));
      data[o + 3] = Math.round(255 * Math.max(0, Math.min(1, (1.004 - d) / 0.008 + (y > E.cy ? 1 : 0))));
    } else if (y < E.cy) {
      data[o + 3] = 0; // anything poking up above the top surface (cherries, rosettes, curls)
    } else if (d < 1.14 && data[o + 3] > 0) {
      // just below the front rim: lift stray chocolate bits back to frosting
      const lum = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
      if (lum < 205) { const s = sideRow(x, y); for (let c = 0; c < 3; c++) data[o + c] = Math.round(Math.max(s[c], base[c] * 0.96)); }
    }
  }  const info2 = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 88, alphaQuality: 95 }).toFile(join(OUT, 'black-forest-frosted-plain.webp'));
  results.frostedPlain = { file: 'assets/cake/black-forest-frosted-plain.webp', width: info2.width, height: info2.height, surface: E };
  console.log('ok black-forest-frosted-plain', `${info2.width}x${info2.height}`);
}

writeFileSync(join(OUT, 'cake-assets.json'), JSON.stringify(results, null, 2));

