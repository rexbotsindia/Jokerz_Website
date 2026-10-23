# Jokerz — website demos

Two concept sites for **Jokerz Bakery (Bakery · Boba · Café)**. Both use the official logo guideline (vector logo, six brand colours), real menu content from jokerzbakery.com and one shared, documented asset library.

| Folder | What it is | Run |
|---|---|---|
| `homepage/` | **"A day at Jokerz"**: the animated storytelling homepage (Vite + GSAP + Lenis) | `cd homepage`, then `npm install`, then `npm run dev` → http://localhost:5180 |
| `public/` | The first static one-page demo (no build step) | `powershell -ExecutionPolicy Bypass -File serve.ps1` → http://localhost:5173 |

See `homepage/README.md` for the chapter-by-chapter breakdown of the animated homepage.

## Structure

```
homepage/               animated storytelling homepage (Vite app)
  src/                  main.js (all animation), cake.js (Chapter 03 cake), prices.js (placeholder prices), style.css
  scripts/              sync-assets, import-jokerz-assets, process-cake-assets, derive-classic-milk-tea
public/                 static demo + the shared asset library
  assets/
    hero/ food/ cafe/ story/   Unsplash photography (WebP, full + "-sm")
    jokerz/             images from jokerzbakery.com (client-supplied)
    cake/               cut-outs made from the client's cake renders (Chapter 03)
    brand/              logo SVGs extracted from the guideline PDF
    fonts/              self-hosted Fraunces, DM Sans, Barlow Condensed (OFL)
source-images/client/   original cake renders supplied by the client
tools/                  PowerShell: fetch-assets (Unsplash), build-docs (manifest + credits)
ASSET-MANIFEST.md       every image: source, licence, sizes, intended use
```

`homepage/public/assets` is generated: `npm run dev` and `npm run build` copy the shared library into it automatically.

## Notes for reviewers

- **Prices** are placeholders in USD, all kept in `homepage/src/prices.js`. Opening hours and the address are still to be supplied.
- **Photography** mixes Unsplash stock (free licence, credited in `ASSET-MANIFEST.md` and `public/credits.html`) with client-supplied images. The stock images are stand-ins and don't show actual Jokerz products. Jokerz should confirm it has the rights to the images on its current website. One of them (Honey cake) is a watermarked Vecteezy preview and is not used here.
- **Forms** are demos and send nothing.

## Publishing a public link

- **GitHub Pages (permanent):** `.github/workflows/pages.yml` builds `homepage/` and deploys it on every push to `main`. One-time setup: in the repo, **Settings → Pages → Source: GitHub Actions**. The site appears at `https://<owner>.github.io/<repo>/`. On free GitHub plans the repository must be public.
- **Netlify Drop (instant):** run `npm run build` in `homepage/`, then drag `homepage/dist` (or `jokerz-homepage-site.zip`) onto https://app.netlify.com/drop.
- **Locally:** double-click `start-demo.cmd`.
