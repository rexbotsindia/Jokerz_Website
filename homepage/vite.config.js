import { defineConfig } from 'vite';

// BASE_PATH lets the same build run at a domain root ('/', the default) or under a sub-path,
// e.g. GitHub Pages serves this repo at /Jokerz_Website/ (set in .github/workflows/pages.yml).
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  server: { port: 5180, open: false },
  preview: { port: 5181 },
  build: { assetsInlineLimit: 0 },
});
