import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
const BASE = import.meta.env.BASE_URL; // '/' locally, '/Jokerz_Website/' on GitHub Pages
import { renderPrices } from './prices.js';
import { buildCake } from './cake.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ------------------------------------------------------------------ */
/* Smooth scroll                                                        */
/* ------------------------------------------------------------------ */
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  if (import.meta.env.DEV) { window.__lenis = lenis; window.__ST = ScrollTrigger; } // used by visual QA scripts
}

$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.8 });
    else target.scrollIntoView();
  });
});

/* ------------------------------------------------------------------ */
/* Split headings                                                       */
/* ------------------------------------------------------------------ */
const splits = new Map();
function splitHeadings() {
  $$('[data-split]').forEach((el) => {
    splits.set(el, SplitText.create(el, { type: 'lines,words', mask: 'lines', linesClass: 'line-mask' }));
  });
}

/* ------------------------------------------------------------------ */
/* Intro: logo pieces assemble, counter runs, curtain lifts             */
/* ------------------------------------------------------------------ */
function intro() {
  const loader = $('[data-loader]');
  const pieces = $$('[data-piece]', loader);
  const count = $('[data-count]', loader);
  const heroWords = splits.get($('.hero-title')).words;

  const tl = gsap.timeline({
    defaults: { ease: 'expo.out' },
    onComplete: () => {
      loader.remove();
      document.body.classList.remove('is-loading');
      lenis?.start();
      ScrollTrigger.refresh();
    },
  });

  const from = [
    { x: 0, y: 140 }, { x: -120, y: 60 }, { x: 120, y: 80 },
    { x: -80, y: 140 }, { x: 60, y: -160 }, { x: -140, y: -120 },
  ];
  tl.from(pieces, {
    x: (i) => from[i].x, y: (i) => from[i].y,
    rotation: (i) => (i % 2 ? -1 : 1) * 40, scale: 0.2, opacity: 0,
    transformOrigin: '50% 50%', duration: 1.1, stagger: 0.11, ease: 'back.out(1.6)',
  })
    .to({ v: 0 }, {
      v: 100, duration: 1.7, ease: 'power2.inOut',
      onUpdate() { count.textContent = Math.round(this.targets()[0].v); },
    }, 0)
    .to('.loader-mark', { y: -12, scale: 0.86, duration: 0.5, ease: 'power2.inOut' }, '>-0.1')
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '>-0.15')
    .from('.nav', { yPercent: -160, duration: 1.2 }, '<0.45')
    .from(heroWords, { yPercent: 115, rotate: 4, duration: 1.3, stagger: 0.05 }, '<0.05')
    .from('[data-hero-kicker], [data-hero-sub]', { y: 24, opacity: 0, duration: 1.1, stagger: 0.1 }, '<0.2')
    .fromTo('[data-hero-arch]', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 32px 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 32px 32px)', duration: 1.5, ease: 'expo.inOut' }, '<-0.4')
    .from('[data-hero-arch] img', { scale: 1.45, duration: 1.8 }, '<')
    .from('.hero-cutout', { scale: 0, y: 80, rotate: -30, duration: 1.2, stagger: 0.12, ease: 'back.out(1.8)' }, '<0.7')
    .from('.blob', { scale: 0.4, opacity: 0, duration: 2, stagger: 0.1 }, '<-0.6')
    .from('[data-cue]', { opacity: 0, y: 20, duration: 0.8 }, '<0.5')
    .to('[data-clock]', { opacity: 1, y: 0, duration: 0.8 }, '<');
}

/* ------------------------------------------------------------------ */
/* Cursor, magnetic buttons, hero mouse parallax                         */
/* ------------------------------------------------------------------ */
function pointerFx() {
  if (!finePointer || reduceMotion) return;
  const cursor = $('[data-cursor]');
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); });
  $$('a, button').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
  });

  $$('[data-magnetic]').forEach((btn) => {
    const label = btn.querySelector('span');
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: dx * 0.25, y: dy * 0.35, duration: 0.5, ease: 'power3' });
      gsap.to(label, { x: dx * 0.12, y: dy * 0.18, duration: 0.5, ease: 'power3' });
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to([btn, label], { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
    });
  });

  const hero = $('.hero');
  const layers = $$('[data-depth]', hero).map((el) => ({
    d: parseFloat(el.dataset.depth),
    x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }),
    y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }),
  }));
  hero.addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    layers.forEach((l) => { l.x(nx * 40 * l.d); l.y(ny * 40 * l.d); });
  });
}

/* ------------------------------------------------------------------ */
/* Day clock + chapter backgrounds                                      */
/* ------------------------------------------------------------------ */
function dayClock() {
  const sun = $('[data-sun]');
  const arc = $('[data-arc]');
  const timeEl = $('[data-clock-time]');
  const labelEl = $('[data-clock-label]');
  const nav = $('[data-nav]');
  const links = $$('.nav-links a');
  arc.setAttribute('pathLength', '1');
  arc.style.strokeDasharray = '1';
  arc.style.strokeDashoffset = '1';

  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate(self) {
      const p = self.progress;
      const w = sun.offsetWidth, s = w / 120, h = 64 * s;
      const a = Math.PI * (1 - p);
      sun.style.setProperty('--sx', `${(60 + 52 * Math.cos(a)) * s}px`);
      sun.style.setProperty('--sy', `${(60 - 52 * Math.sin(a)) * s - h}px`);
      arc.style.strokeDashoffset = String(1 - p);
    },
  });

  const setChapter = (section) => {
    gsap.to(document.body, { backgroundColor: section.dataset.bg, duration: reduceMotion ? 0 : 1.2, ease: 'power2.out', overwrite: true });
    if (timeEl.textContent !== section.dataset.time) {
      gsap.timeline()
        .to([timeEl, labelEl], { yPercent: -60, opacity: 0, duration: 0.2, ease: 'power2.in' })
        .call(() => { timeEl.textContent = section.dataset.time; labelEl.textContent = section.dataset.label; })
        .fromTo([timeEl, labelEl], { yPercent: 60 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'expo.out' });
    }
    links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${section.id}`));
  };
  $$('[data-bg]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => self.isActive && setChapter(section),
    });
  });

  gsap.to('[data-clock]', { autoAlpha: 0, y: 20, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top 98%', end: 'top 80%', scrub: true } });
  let navHidden = false;
  lenis?.on('scroll', ({ direction, scroll }) => {
    const hide = direction === 1 && scroll > 300;
    if (hide === navHidden) return;
    navHidden = hide;
    gsap.to(nav, { yPercent: hide ? -170 : 0, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
  });
}

/* ------------------------------------------------------------------ */
/* Generic reveals                                                      */
/* ------------------------------------------------------------------ */
function reveals() {
  splits.forEach((split, el) => {
    if (el.classList.contains('hero-title')) return;
    gsap.from(split.words, {
      yPercent: 115, rotate: 3, duration: 1.2, ease: 'expo.out', stagger: 0.045,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  });
  $$('[data-fade]').forEach((el) => {
    gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // Hero drifts apart as you leave it; hero cut-outs keep a gentle idle float
  $$('.hero-cutout img').forEach((img, i) => gsap.to(img, { y: -12, rotate: i ? -3 : 3, duration: 2.4 + i * 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero-inner', { yPercent: -30, opacity: 0.2, ease: 'none' }, 0)
    .to('[data-hero-arch]', { yPercent: 18, ease: 'none' }, 0)
    .to('[data-hero-arch] img', { yPercent: -10, ease: 'none' }, 0)
    .to('.hero-cutout.s1', { yPercent: -120, rotate: -24, ease: 'none' }, 0)
    .to('.hero-cutout.s2', { yPercent: -160, rotate: 26, ease: 'none' }, 0);
}

/* ------------------------------------------------------------------ */
/* Chapter 01 · Dawn                                                    */
/* ------------------------------------------------------------------ */
function dawn(pinIt) {
  const n = $('[data-layers-n]');
  const counter = { v: 0 };
  const tl = gsap.timeline({
    scrollTrigger: pinIt
      ? { trigger: '#dawn', start: 'top top', end: '+=130%', scrub: 1, pin: '[data-dawn]' }
      : { trigger: '.dawn-stage', start: 'top 80%', end: 'bottom 40%', scrub: 1 },
  });
  tl.fromTo('[data-dawn-a]', { clipPath: 'inset(18% 22% 18% 22% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'power2.out' }, 0)
    .from('[data-dawn-a] img', { scale: 1.35, ease: 'power2.out' }, 0)
    .from('[data-dawn-b]', { xPercent: 40, yPercent: 50, rotate: 18, opacity: 0, ease: 'power3.out' }, 0.3)
    .from('[data-layers]', { scale: 0, rotate: -90, ease: 'back.out(1.8)' }, 0.15)
    .to(counter, { v: 6, ease: 'power1.inOut', onUpdate: () => { n.textContent = Math.round(counter.v); } }, 0.15);
}

/* ------------------------------------------------------------------ */
/* Chapter 02 · Bake — horizontal counter                               */
/* ------------------------------------------------------------------ */
function bake() {
  const track = $('[data-track]');
  const dist = () => track.scrollWidth - innerWidth;
  const move = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '#bake', start: 'top top', end: () => `+=${dist()}`, scrub: 1,
      pin: '[data-bake]', invalidateOnRefresh: true,
    },
  });
  $$('.bake-card', track).forEach((card, i) => {
    gsap.fromTo(card, { rotate: i % 2 ? 5 : -5, y: 40 }, {
      rotate: i % 2 ? -2 : 2, y: 0, ease: 'none',
      scrollTrigger: { trigger: card, containerAnimation: move, start: 'left right', end: 'center center', scrub: true },
    });
    gsap.fromTo($('img', card), { scale: 1.25 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: card, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Chapter 03 · Signature cakes — photoreal sponges fall and stack, rosettes are piped with a little magic,
   then cherries and chocolate curls rain down. Built from the client's renders (src/cake.js).          */
/* ------------------------------------------------------------------ */
let cakeParts = null;
function colour(pinIt) {
  const steps = $$('[data-steps] li');
  if (!cakeParts) cakeParts = buildCake($('[data-stack]'), $('[data-sparkles]'));
  const { layers, layersWrap, frostPlain, frostFinal, shine, rosettes, cherries, chocTop, chocPlate, sparkles } = cakeParts;
  const photos = $$('[data-cphoto]');
  const stepTimes = [];
  const drop = () => -innerHeight * 0.9;
  // anchors: rosettes/cherries sit on the cream by their base, chocolate pieces by their centre
  gsap.set([...rosettes, ...cherries], { xPercent: -50, yPercent: -88 });
  gsap.set([...chocTop, ...chocPlate], { xPercent: -50, yPercent: -50 });
  // nothing is visible until its moment (and the pinned chapter clips anything waiting above the stage)
  gsap.set([...layers, ...rosettes, ...cherries, ...chocTop, ...chocPlate, frostFinal], { autoAlpha: 0 });
  gsap.set(frostPlain, { clipPath: 'inset(0% 0% 100% 0%)' });
  const setStep = (idx) => steps.forEach((li, i) => li.classList.toggle('is-on', i === idx));

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onUpdate() {
      const t = tl.time();
      let idx = 0;
      stepTimes.forEach((st, i) => { if (t >= st - 0.001) idx = i; });
      setStep(idx);
    },
    scrollTrigger: pinIt
      ? { trigger: '#colour', start: 'top top', end: innerWidth > 960 ? '+=300%' : '+=240%', scrub: 1, pin: '[data-colour]' }
      : { trigger: '.cake-stage', start: 'top 70%', toggleActions: 'play none none reverse' },
  });

  // A falling piece fades in over the first half of its fall: invisible above the stage, fully solid by mid-way.
  const fall = (targets, { dur = 1, from = drop, rot = 0, ease = 'power2.in', stagger = 0 } = {}, at = undefined) => {
    tl.fromTo(targets, { y: from, rotate: rot }, { y: 0, rotate: 0, duration: dur, ease, stagger, immediateRender: false }, at)
      .fromTo(targets, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur * 0.5, ease: 'none', stagger, immediateRender: false }, '<');
  };

  // 1–5 · sponge layers drop one after another and settle with a soft squash
  layers.forEach((layer, i) => {
    stepTimes.push(tl.duration());
    fall(layer, { dur: 1, rot: (i % 2 ? -1 : 1) * 6 });
    tl.to(layer, { scaleY: 0.92, scaleX: 1.03, transformOrigin: '50% 100%', duration: 0.1, ease: 'power1.out' })
      .to(layer, { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'elastic.out(1, 0.45)' });
    if (i > 0) tl.to(layers.slice(0, i), { y: 3, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.out' }, '<-0.1');
    if (photos[i / 2]) tl.from(photos[i / 2], { scale: 0, rotate: '+=30', opacity: 0, duration: 0.7, ease: 'back.out(2)' }, '<');
    tl.to({}, { duration: 0.2 });
  });

  // 6 · the magic: a glow blooms, sparkles burst and a wave of whipped cream sweeps down over the whole stack.
  //     The naked layers disappear top-down while the client's frosted cake (plain top) is revealed in their place.
  stepTimes.push(tl.duration());
  const sweep = { duration: 1.6, ease: 'power2.inOut', immediateRender: false };
  tl.addLabel('magic')
    .to('[data-glow]', { opacity: 1, scale: 1.1, duration: 0.8, ease: 'power2.out' }, 'magic')
    .fromTo(sparkles, { scale: 0, rotate: -120, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.45, ease: 'back.out(3)', stagger: { each: 0.03, from: 'random' }, immediateRender: false }, 'magic+=0.1')
    .fromTo(frostPlain, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ...sweep }, 'magic+=0.2')
    .fromTo(layersWrap, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(100% 0% 0% 0%)', ...sweep }, 'magic+=0.2')
    .fromTo(shine, { top: '-18%', opacity: 1 }, { top: '100%', opacity: 0, ...sweep }, 'magic+=0.2')
    .to(sparkles, { scale: 0, autoAlpha: 0, rotate: 90, duration: 0.4, stagger: { each: 0.025, from: 'random' } }, 'magic+=1.3')
    .to('[data-cake]', { scale: 1.035, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 'magic+=1.6')
    .to('[data-glow]', { opacity: 0.45, scale: 1, duration: 0.6 }, 'magic+=1.9');

  // 7 · Black Forest finish: rosettes swirl on, curls and cherries rain down onto the spots of the client's
  //     finished render, then everything settles into that exact image.
  stepTimes.push(tl.duration());
  tl.addLabel('rain')
    .fromTo(rosettes, { scale: 0, rotate: -140, y: -16, autoAlpha: 0 }, { scale: 1, rotate: 0, y: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.07, immediateRender: false }, 'rain');
  fall(chocTop, { dur: 0.8, from: () => drop() * 0.7, rot: () => gsap.utils.random(-220, 220), stagger: { each: 0.02, from: 'random' } }, 'rain+=0.3');
  fall(chocPlate, { dur: 0.9, from: () => drop() * 0.8, rot: () => gsap.utils.random(-220, 220), stagger: { each: 0.03, from: 'random' } }, 'rain+=0.45');
  fall(cherries, { dur: 0.95, from: () => drop() * 0.75, ease: 'bounce.out', stagger: 0.09 }, 'rain+=0.6');
  tl.addLabel('settle', '>+0.05')
    .to(frostFinal, { autoAlpha: 1, duration: 0.6, ease: 'power1.inOut' }, 'settle')
    .to([frostPlain, ...rosettes, ...cherries, ...chocTop], { autoAlpha: 0, duration: 0.6, ease: 'power1.inOut' }, 'settle')
    .to('[data-cake]', { scale: 1.04, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 'settle+=0.3')
    .to({}, { duration: 0.5 });
}
/* ------------------------------------------------------------------ */
/* Boba tabs — tapped drink slides in from the left, its neighbour from the right */
/* ------------------------------------------------------------------ */
const DRINKS = [
  { key: 'classic', name: 'Classic Milk Tea', img: `${BASE}assets/jokerz/classic-milk-tea-tinted.webp`, w: 540, h: 462, alt: 'Classic milk tea with tapioca pearls', price: 'classic-milk-tea' },
  { key: 'brown-sugar', name: 'Brown Sugar Milk Tea', img: `${BASE}assets/jokerz/classic-milk-tea.webp`, w: 540, h: 462, alt: 'Brown sugar milk tea with caramel stripes and pearls', price: 'brown-sugar-milk-tea' },
  { key: 'taro', name: 'Taro Milk Tea', img: `${BASE}assets/jokerz/taro-milk-tea.webp`, w: 540, h: 462, alt: 'Taro milk tea with pearls', price: 'taro-milk-tea' },
  { key: 'latte', name: 'Cafe Latte', img: `${BASE}assets/jokerz/cafe-latte.webp`, w: 900, h: 557, alt: 'Cafe latte with leaf latte art', price: 'cafe-latte' },
  { key: 'mocha', name: 'Mocha', img: `${BASE}assets/jokerz/mocha.webp`, w: 500, h: 500, alt: 'Mocha topped with whipped cream', price: 'mocha' },
  { key: 'espresso', name: 'Espresso', img: `${BASE}assets/jokerz/espresso.webp`, w: 612, h: 408, alt: 'Espresso with coffee beans', price: 'espresso' },
];
function drinkTabs() {
  const left = $('[data-side="l"]');
  const right = $('[data-side="r"]');
  const buttons = $$('.flav');
  DRINKS.forEach((d) => { const im = new Image(); im.src = d.img; }); // preload
  let current = 'brown-sugar';
  let swap = null;

  const fill = (fig, d) => {
    const img = $('img', fig);
    img.src = d.img; img.width = d.w; img.height = d.h; img.alt = d.alt;
    $('[data-side-name]', fig).textContent = d.name;
    const price = $('[data-price]', fig) || fig.querySelector('figcaption').appendChild(Object.assign(document.createElement('span'), { className: 'price' }));
    price.dataset.price = d.price;
    renderPrices(fig);
  };

  const show = (key) => {
    if (key === current) return;
    const i = DRINKS.findIndex((d) => d.key === key);
    const main = DRINKS[i];
    const pair = DRINKS[(i + 1) % DRINKS.length];
    current = key;
    buttons.forEach((b) => { const on = b.dataset.drink === key; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    swap?.progress(1);
    if (reduceMotion) { fill(left, main); fill(right, pair); return; }
    const far = innerWidth * 0.6;
    swap = gsap.timeline()
      .to(left, { x: -far, rotation: -35, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, 0)
      .to(right, { x: far, rotation: 35, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, 0)
      .call(() => { fill(left, main); fill(right, pair); })
      .fromTo(left, { x: -far, rotation: -40 }, { x: 0, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)' })
      .fromTo(right, { x: far, rotation: 40 }, { x: 0, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)' }, '<0.08')
      .fromTo('[data-boba-hero]', { scale: 0.94 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.45)' }, '<');
  };
  buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.drink)));
}

/* ------------------------------------------------------------------ */
/* Chapter 04 · Boba — falling pearls, parallax, flavour pop            */
/* ------------------------------------------------------------------ */
function boba() {
  const box = $('[data-pearls]');
  const tints = ['#C9B3D9', '#FFE08A', '#9FDCE4', '#F9B8A0', '#A8DDBA', '#F5A9CB', '#6B4A3A'];
  const tweens = [];
  const count = innerWidth < 700 ? 16 : 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    const size = gsap.utils.random(10, 30);
    p.className = 'pearl';
    p.style.cssText = `width:${size}px;height:${size}px;left:${gsap.utils.random(0, 100)}%;--pc:${tints[i % tints.length]}`;
    box.appendChild(p);
    tweens.push(gsap.to(p, {
      y: () => box.offsetHeight + 80, duration: gsap.utils.random(7, 14), ease: 'none', repeat: -1,
      delay: gsap.utils.random(-14, 0), paused: true,
    }));
    tweens.push(gsap.to(p, { x: gsap.utils.random(-30, 30), duration: gsap.utils.random(1.5, 3), yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true }));
  }
  ScrollTrigger.create({
    trigger: '#boba', start: 'top bottom', end: 'bottom top',
    onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.play() : t.pause())),
  });

  $$('[data-parallax]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -parseFloat(el.dataset.parallax) }, {
      yPercent: parseFloat(el.dataset.parallax), ease: 'none',
      scrollTrigger: { trigger: '.boba-stage', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  // The branded cups spin up out of a glowing halo, then keep bobbing
  gsap.timeline({ scrollTrigger: { trigger: '.boba-stage', start: 'top 72%' } })
    .from('[data-halo]', { scale: 0, duration: 1.4, ease: 'expo.out' })
    .from('[data-boba-hero]', { y: 160, rotate: -18, scale: 0.6, opacity: 0, duration: 1.4, ease: 'back.out(1.4)' }, 0.1)
    .from('.boba-side', { y: 120, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, 0.35);
  gsap.to('[data-boba-hero]', { y: -14, rotate: 2, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('[data-halo]', { scale: 1.06, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.from('.flav', {
    y: 50, scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(2)', stagger: 0.07,
    scrollTrigger: { trigger: '[data-flavours]', start: 'top 90%' },
  });
  $$('[data-treats]').forEach((row) => {
    gsap.from(row.children, {
      y: 90, rotate: (i) => (i % 2 ? 6 : -6), opacity: 0, duration: 1.1, ease: 'back.out(1.5)', stagger: 0.09,
      scrollTrigger: { trigger: row, start: 'top 85%' },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Hover: GSAP-driven so it never fights the scroll animations          */
/* (GSAP folds CSS scale/translate into its own transform, which        */
/*  silently cancels CSS :hover rules on animated elements)             */
/* ------------------------------------------------------------------ */
function hoverFx(cards, { img, lift = 8, zoom = 1.12 } = {}) {
  if (!finePointer || reduceMotion) return;
  cards.forEach((card) => {
    const pic = img ? card.querySelector(img) : null;
    card.addEventListener('pointerenter', () => {
      gsap.to(card, { y: -lift, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
      if (pic) gsap.to(pic, { scale: zoom, duration: 1.1, ease: 'expo.out', overwrite: 'auto' });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, { y: 0, duration: 0.8, ease: 'expo.out', overwrite: 'auto' });
      if (pic) gsap.to(pic, { scale: 1, duration: 1, ease: 'expo.out', overwrite: 'auto' });
    });
  });
}

/* ------------------------------------------------------------------ */
/* Signature six + coffee row                                           */
/* ------------------------------------------------------------------ */
function menuReveals() {
  gsap.from('[data-sig] li', {
    y: 110, opacity: 0, scale: 0.92, duration: 1.2, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: '[data-sig]', start: 'top 82%' },
  });
  $$('[data-sig] img').forEach((img, i) => {
    gsap.fromTo(img, { rotate: i % 2 ? 8 : -8, yPercent: 10 }, {
      rotate: 0, yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  gsap.from('[data-coffee] li', {
    y: 40, opacity: 0, scale: 0.8, duration: 0.9, ease: 'back.out(2)', stagger: 0.1,
    scrollTrigger: { trigger: '[data-coffee]', start: 'top 92%' },
  });
}

/* ------------------------------------------------------------------ */
/* Chapter 05 · Celebrate — one cake zooms out into a party             */
/* ------------------------------------------------------------------ */
function celebrate(isDesktop) {
  const center = $('[data-cg-center]');
  const others = $$('.cg:not([data-cg-center])').filter((el) => getComputedStyle(el).display !== 'none');
  // Desktop: the landscape hero fills the screen edge to edge (cover). Phones: a landscape photo can't fill a
  // portrait screen without cutting the cake, so it opens as large as fits (contain).
  const cover = () => isDesktop
    ? Math.max(innerWidth / center.offsetWidth, innerHeight / center.offsetHeight) * 1.02
    : Math.min(innerWidth / (center.offsetWidth * 0.8), innerHeight / center.offsetHeight) * 0.98; // cake (~60% of the photo) fills the phone width
  gsap.timeline({
    scrollTrigger: {
      trigger: '#celebrate', start: 'top top', end: isDesktop ? '+=190%' : '+=130%', scrub: 1,
      pin: '[data-celebrate]', invalidateOnRefresh: true,
    },
  })
    // fromTo with explicit end values: a plain from() re-captures its end state on every refresh
    // (mobile fires several), which compounded the offset and cropped the cake.
    .fromTo(center, {
      x: () => innerWidth / 2 - (center.offsetLeft + center.offsetWidth / 2),
      y: () => innerHeight / 2 - (center.offsetTop + center.offsetHeight / 2),
      scale: cover, borderRadius: 0,
    }, { x: 0, y: 0, scale: 1, borderRadius: 24, ease: 'power2.inOut', duration: 1 })
    .fromTo(others, { scale: 0.5, opacity: 0, y: 80 }, { scale: 1, opacity: 1, y: 0, ease: 'power3.out', duration: 0.7, stagger: 0.06 }, 0.35)
    .fromTo('[data-celebrate-copy]', { y: 80, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: 'expo.out', duration: 0.6 }, 0.85)
    .to({}, { duration: 0.3 });
}

/* ------------------------------------------------------------------ */
/* Chapter 06 · Night                                                   */
/* ------------------------------------------------------------------ */
function night() {
  const figs = $$('[data-float]');
  gsap.from(figs, {
    y: 120, opacity: 0, rotate: (i) => [-6, 3, 6][i], duration: 1.4, ease: 'expo.out', stagger: 0.12,
    scrollTrigger: { trigger: '.night-photos', start: 'top 85%' },
  });
  figs.forEach((f, i) => gsap.to(f, { y: -14, duration: 2.6 + i * 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.3 }));
  gsap.from('[data-delivery] li, .night-cta .pill-btn', {
    y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: '[data-delivery]', start: 'top 92%' },
  });
}

/* ------------------------------------------------------------------ */
/* Boot                                                                 */
/* ------------------------------------------------------------------ */
async function boot() {
  renderPrices();
  await document.fonts.ready;
  splitHeadings();

  if (reduceMotion) {
    // Static version: show the finished cake and keep the drink tabs working
    const parts = buildCake($('[data-stack]'), $('[data-sparkles]'));
    gsap.set([...parts.rosettes, ...parts.cherries], { xPercent: -50, yPercent: -88 });
    gsap.set([...parts.chocTop, ...parts.chocPlate], { xPercent: -50, yPercent: -50 });
    gsap.set([...parts.layers, ...parts.rosettes, ...parts.cherries, ...parts.chocTop, parts.frostPlain], { autoAlpha: 0 });
    drinkTabs();
    $('[data-loader]').remove();
    document.body.classList.remove('is-loading');
    dayClock();
    gsap.set('[data-clock]', { opacity: 1, y: 0 });
    return;
  }

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 961px)', mobile: '(max-width: 960px)' }, (ctx) => {
    const { desktop } = ctx.conditions;
    dawn(desktop);
    if (desktop) bake();
    colour(true); // pinned on every size; mobile CSS shows only the active step
    celebrate(desktop);
  });
  boba();
  drinkTabs();
  menuReveals();
  hoverFx($$('[data-sig] li'), { img: 'img', lift: 10, zoom: 1.14 });
  hoverFx($$('[data-treats] li'), { img: 'img', lift: 8, zoom: 1.1 });
  hoverFx($$('.flav'), { lift: 3 });
  night();
  reveals();
  dayClock(); // after pins so chapter triggers account for pin spacing
  ScrollTrigger.sort();
  pointerFx();
  intro();
}

document.body.classList.add('is-loading');
boot();
