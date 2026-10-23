// Chapter 03 cake, built from the client-supplied photoreal renders (cut out by scripts/process-cake-assets.mjs).
// Geometry is in cqw (% of the cake's width) so the whole cake scales as one piece.
//
// Stacking: each layer render shows 14.1% (of its width) of sponge side below the cream, plus a ~4.5% cream lip,
// so each layer rests 18.6cqw above the one below — the same look as the client's layered reference.

const BASE = import.meta.env.BASE_URL; // '/' locally, '/Jokerz_Website/' on GitHub Pages
const layer = (name, h) => ({ src: `${BASE}assets/cake/layer-${name}.webp`, w: 900, h, name });
// bottom -> top, matching the reference: chocolate, vanilla, cocoa, golden, vanilla
export const LAYERS = [layer('chocolate', 501), layer('vanilla', 515), layer('cocoa', 501), layer('golden', 515), layer('vanilla', 515)];
const STEP = 18.6;
const TOP_LAYER_H = (515 / 900) * 100;            // 57.2cqw
export const STACK_H = (LAYERS.length - 1) * STEP + TOP_LAYER_H;
// The client's frosted render is the "after the magic" cake. Its body (x 37..867 of 900px) is scaled to the
// same width as the sponge stack and sits on the same base line.
const FROST = { w: 900, h: 860, bodyL: 37, bodyR: 867 };
const F_W = 100 * FROST.w / (FROST.bodyR - FROST.bodyL);             // 108.4cqw
const F_LEFT = -F_W * FROST.bodyL / FROST.w;                        // body's left edge lands on 0
const F_H = F_W * FROST.h / FROST.w;
const F_TOP = STACK_H - F_H + 1.5;
const fx = (px) => F_LEFT + (px / FROST.w) * F_W;                    // render px -> stack cqw
const fy = (py) => F_TOP + (py / FROST.h) * F_H;
const SURFACE = { cx: fx(452), cy: fy(276), rx: (414 / FROST.w) * F_W, ry: (172 / FROST.h) * F_H };
// cherry positions measured on the render (centre x, bottom y in px) — falling toppings land on these spots
const CHERRY_SPOTS = [[155, 242], [240, 143], [328, 329], [420, 125], [588, 331], [630, 164], [751, 239]];

// Hand-picked clean pieces from the toppings sheet (see public/assets/cake/cake-assets.json)
const ROSETTES = [1, 2, 3, 4, 5];
const CHERRIES = [1, 3, 2, 4];
const CHOCOLATE = [1, 2, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 17, 18, 20, 21, 22, 23, 24, 26, 28, 29, 30, 31, 32, 33, 34,
  36, 37, 38, 39, 40, 43, 44, 46, 47, 48, 49, 51, 52, 53, 54, 55, 57, 58, 59, 60, 61, 63, 64, 65];

const rand = (a, b) => a + Math.random() * (b - a);
const sparkleSVG = (c) => `<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M0 -11 L2.6 -2.6 L11 0 L2.6 2.6 L0 11 L-2.6 2.6 L-11 0 L-2.6 -2.6 Z" fill="${c}"/></svg>`;

function img(src, cls) {
  const el = document.createElement('img');
  el.src = src; el.alt = ''; el.decoding = 'async'; el.draggable = false; el.className = cls;
  return el;
}

/** Builds the cake inside `stack` (.cake-stack) and returns handles for the timeline. */
export function buildCake(stack, sparkleBox) {
  stack.style.height = `${STACK_H}cqw`;

  const layersWrap = document.createElement('div');
  layersWrap.className = 'layers-wrap';
  stack.appendChild(layersWrap);
  const layers = LAYERS.map((l, i) => {
    const el = img(l.src, 'sponge-layer');
    el.width = l.w; el.height = l.h;
    el.style.cssText = `bottom:${i * STEP}cqw; z-index:${i + 1}`;
    layersWrap.appendChild(el);
    return el;
  });

  // Frosted cake: plain-topped version revealed by the cream wave, the client's finished render cross-fades in at the end
  const frost = document.createElement('div');
  frost.className = 'frost';
  frost.style.cssText = `left:${F_LEFT}cqw; top:${F_TOP}cqw; width:${F_W}cqw; height:${F_H}cqw`;
  const frostPlain = img(`${BASE}assets/cake/black-forest-frosted-plain.webp`, 'frost-img');
  const frostFinal = img(`${BASE}assets/cake/black-forest-frosted.webp`, 'frost-img');
  frostPlain.width = frostFinal.width = FROST.w; frostPlain.height = frostFinal.height = FROST.h;
  const shine = document.createElement('div'); shine.className = 'cream-shine';
  frost.append(frostPlain, frostFinal, shine);
  stack.appendChild(frost);

  const place = (el, x, y, w, z) => { el.style.cssText = `left:${x}cqw; top:${y}cqw; width:${w}cqw; z-index:${z}`; stack.appendChild(el); return el; };

  // Rosettes + cherries land on the same spots as the render's own (back ones first)
  const spots = [...CHERRY_SPOTS].sort((p, q) => p[1] - q[1]);
  const rosettes = spots.map(([x, y], k) => place(img(`${BASE}assets/cake/topping-rosette-${ROSETTES[k % ROSETTES.length]}.webp`, 'topping rosette'), fx(x), fy(y + 52), 19, 20 + k));
  const cherries = spots.map(([x, y], k) => place(img(`${BASE}assets/cake/topping-cherry-${CHERRIES[k % CHERRIES.length]}.webp`, 'topping cherry'), fx(x + 14), fy(y + 6), 12.5, 40 + k));

  // Chocolate curls over the top surface, plus a few that land on the plate
  const shuffled = [...CHOCOLATE].sort(() => Math.random() - 0.5);
  const chocTop = shuffled.slice(0, 24).map((n) => {
    const t = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
    const x = SURFACE.cx + SURFACE.rx * 0.82 * r * Math.cos(t), y = SURFACE.cy + SURFACE.ry * 0.74 * r * Math.sin(t);
    return place(img(`${BASE}assets/cake/topping-chocolate-${n}.webp`, 'topping choc'), x, y, rand(3.8, 6.4), Math.sin(t) > 0 ? 34 : 18);
  });
  const chocPlate = shuffled.slice(24, 34).map((n) => {
    const t = rand(0.06, 0.94) * Math.PI;
    const x = 50 + rand(54, 64) * Math.cos(t), y = STACK_H - 2 + rand(8, 12) * Math.sin(t);
    return place(img(`${BASE}assets/cake/topping-chocolate-${n}.webp`, 'topping choc'), x, y, rand(3.2, 5.4), 60);
  });
  // Sparkles for the magic moment
  const colours = ['#FFFFFF', '#FFD86B', '#F7B9D3', '#BFE9EE', '#FFFFFF'];
  const sparkles = Array.from({ length: 30 }, (_, k) => {
    const sp = document.createElement('i');
    sp.className = 'sparkle';
    sp.innerHTML = sparkleSVG(colours[k % colours.length]);
    const size = rand(10, 26);
    sp.style.cssText = `left:${rand(4, 96)}%; top:${rand(4, 92)}%; width:${size}px; height:${size}px`;
    sparkleBox.appendChild(sp);
    return sp;
  });

  return { layers, layersWrap, frost, frostPlain, frostFinal, shine, rosettes, cherries, chocTop, chocPlate, sparkles };
}
