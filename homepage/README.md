# Jokerz — "A day at Jokerz" storytelling homepage

An animated homepage concept told in six time-of-day chapters. Built with Vite, GSAP (ScrollTrigger and SplitText) and Lenis smooth scrolling.

## Run

```
npm install
npm run dev        # http://localhost:5180
npm run build      # production build in dist/
npm run preview    # serve the build on http://localhost:5181
```

`dev` and `build` first run `sync-assets`. This copies the licensed image library from `../public/assets`, so both demos share one asset source (see `../ASSET-MANIFEST.md` for licensing).

## The story

| Chapter | Time | Interaction |
|---|---|---|
| Intro | — | The jester-cupcake logo assembles piece by piece while a 0–100% counter runs, then the screen lifts away to reveal the hero |
| Hero | 05:45 | Headline rises in word by word, the cake photo opens out of an arch shape, the pastel background blurs follow the mouse, and the layers drift apart on scroll |
| 01 Dawn | 06:00 | Pinned: the dough photo opens up, a latte cut-out slides in, a "signature cakes" counter runs to 6, and espresso, latte and mocha pop in |
| 02 Pastries | 08:00 | Pinned horizontal scroll through the real pastry range (Black Forest, Strawberry, Butterscotch, Pineapple, Mango, Vanilla); on mobile it becomes a native swipe carousel |
| 03 Cakes | 12:00 | Pinned cake builder using the client's photoreal renders (`src/cake.js`, assets made by `npm run process-cake`). Five sponge layers fall and stack, each fading in over the first half of its fall, and the chapter clips its contents so nothing shows in the section before. A magic cream wave (glow and sparkles) then sweeps down: the naked layers vanish top-down and the client's frosted cake appears with a plain top. Rosettes swirl on, cherries and chocolate curls rain onto the render's own topping spots, and everything settles into the client's finished Black Forest render |
| 04 Boba & treats | 15:00 | The Jokerz-branded boba cups spin up out of a glowing halo, with falling pearls. Drink tabs (Classic, Brown Sugar, Taro, Latte, Mocha, Espresso): tapping one sends the side drinks flying out, then brings the chosen drink in from the left and the next drink in from the right. Then "Something cold" (hard scoop, sundaes, soft serve) and "Something warm" (four crepes) |
| 05 Celebrate | 18:00 | Pinned zoom-out: a lavender butterfly cake fills the whole screen (on phones it opens as large as fits with the cake whole), then shrinks into a landscape hero tile in a lavender grid of custom cakes and catering photos. A compact copy card sits at the bottom so the cake stays visible |
| 06 Night | 21:00 | Floating photos, delivery options (Standard 2–3 h, Express 1 h, Scheduled), order and catering calls to action |

Throughout the page:
- The page background shifts to a different pastel for each chapter.
- A sun clock in the corner tracks the time of day.
- The nav hides while you scroll down and highlights the current chapter.
- On desktop there is a custom cursor, and the buttons pull towards the pointer.
- `prefers-reduced-motion` turns all motion off.

## Content sources

- **From jokerzbakery.com:** product names and descriptions, egg/eggless availability, catering services and delivery times, plus 34 product and catering images. `npm run import-jokerz` re-downloads and converts the images into `../public/assets/jokerz/`.
- **Prices:** placeholders in USD, all kept in `src/prices.js`. Each one shows with a dashed outline and a "placeholder" tooltip. To go live, edit the numbers there and set `confirmed: true`, which removes the placeholder styling and notes.
- **Still missing (not on the live site):** opening hours and the address.
- **Unsplash stock:** the hero cake, dough, café interiors and the pink drip cake.
- **Excluded:** the live site's Honey cake image is a watermarked Vecteezy preview.
