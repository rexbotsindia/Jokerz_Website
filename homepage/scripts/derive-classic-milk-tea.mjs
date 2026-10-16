// Creates a "classic milk tea" cut-out by hue-shifting the client's taro milk tea image (lilac -> milk-tea beige).
// Derived image, documented in ASSET-MANIFEST.md. Usage: node scripts/derive-classic-milk-tea.mjs
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'assets', 'jokerz');
const src = join(dir, 'taro-milk-tea.webp');
for (const [suffix, w] of [['', 540], ['-sm', 270]]) {
  await sharp(src)
    .modulate({ saturation: 0, brightness: 1.06 })
    .tint({ r: 206, g: 160, b: 112 })
    .resize({ width: w })
    .webp({ quality: 84, alphaQuality: 90 })
    .toFile(join(dir, `classic-milk-tea-tinted${suffix}.webp`));
}
console.log('ok');
