// Copies the shared, licensed asset library from ../public/assets into this app's public folder,
// so both demos use one source of truth (see ../ASSET-MANIFEST.md).
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'public', 'assets');
const dest = join(here, '..', 'public', 'assets');

if (!existsSync(src)) {
  console.error(`Asset library not found at ${src}`);
  process.exit(1);
}
rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log('Synced assets ->', dest);
