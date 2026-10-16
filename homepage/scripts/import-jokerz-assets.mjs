// Downloads selected product / catering images from the live jokerzbakery.com site (supplied by the client)
// and converts them to optimized WebP in ../public/assets/jokerz/, keeping transparency on cut-outs.
// Writes ../public/assets/jokerz/manifest.json. Usage: npm run import-jokerz
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', '..', 'public', 'assets', 'jokerz');
mkdirSync(outDir, { recursive: true });
const BASE = 'https://jokerzbakery.com/assets/';

// [output name, source file on jokerzbakery.com, max width, alt text, kind, intended use]
const list = [
  ['boba-jokerz-cups', 'boba-BJRwKqAy.png', 1100, 'Two Jokerz-branded boba milk teas with tapioca pearls splashing', 'cutout', 'Hero sticker, boba chapter lead'],
  ['soft-serve-jokerz', 'soft%20scope-DEUHZQN5.png', 800, 'Soft-serve ice cream in a Jokerz-branded cup', 'cutout', 'Hero sticker, scoops row'],
  ['hard-scoop-jokerz', 'hard%20scoop-CcokFxBu.png', 800, 'Hard-scoop ice cream in a Jokerz-branded tub', 'cutout', 'Scoops row'],
  ['sundae', 'Sundaes-h9gEm77d.png', 500, 'Strawberry sundae with whipped cream', 'cutout', 'Scoops row'],
  ['classic-milk-tea', 'brown%20sugar%20boba-BUW8Exyn.png', 540, 'Caramel-striped milk tea with tapioca pearls', 'cutout', 'Boba chapter'],
  ['taro-milk-tea', 'Taro%20Milk%20Tea-DVE-yISN.png', 540, 'Lilac taro milk tea with tapioca pearls', 'cutout', 'Boba chapter'],
  ['black-forest-cake', 'black-forst-ixZk-Z42.png', 500, 'Black Forest cake with cherries and chocolate shavings on a stand', 'cutout', 'Signature cakes'],
  ['butterscotch-cake', 'butterscotchaa-BhhPTGcR.png', 500, 'Butterscotch cake with caramel drip on a stand', 'cutout', 'Signature cakes'],
  ['chocolate-mousse-cake', 'Choco-moussee-l03nzt4e.png', 578, 'Chocolate mousse cake with glossy glaze', 'cutout', 'Signature cakes'],
  ['pineapple-cake', 'pineapple-BFnWZ1RN.png', 500, 'Pineapple cake with golden glaze and cream rosettes', 'cutout', 'Signature cakes'],
  ['mango-cake', 'mango-C2CQgnxl.png', 500, 'Mango cake topped with fresh fruit and mango glaze', 'cutout', 'Signature cakes'],
  ['rasamalai-cake', 'Rasmalai%20cake-CZ5zTbCT.png', 500, 'Rasamalai cake with saffron cream and pistachio', 'cutout', 'Signature cakes'],
  ['custom-cake', 'Custom%20cake-CpjcMPvu.png', 500, 'Two-tier custom wedding cake with couple topper and pink ruffles', 'cutout', 'Celebrate chapter'],
  ['assorted-cake-slices', 'cakes%20-DmSpbOFH.png', 1000, 'Platter of assorted cake slices', 'cutout', 'Celebrate chapter'],
  ['strawberry-crepe', 'crepe-DGM8h-Bm.png', 900, 'Strawberry crepe with chocolate drizzle', 'cutout', 'Crepes row'],
  ['nutella-crepe', 'Nutella%20Crepe-BowRVFYB.png', 500, 'Folded Nutella crepe', 'cutout', 'Crepes row'],
  ['banana-chocolate-crepe', 'banana%20crepe-YaeOJsDS.png', 500, 'Banana chocolate crepe', 'cutout', 'Crepes row'],
  ['oreo-crumble-crepe', 'oreo%20crumble%20crepe-BdqWSTCf.png', 612, 'Oreo crumble crepe with chocolate drizzle', 'cutout', 'Crepes row'],
  ['cafe-latte', 'cafe%20latte-DpzKESkE.png', 900, 'Cafe latte with leaf latte art', 'cutout', 'Dawn chapter'],
  ['mocha', 'mocah-D4DSYDjE.png', 500, 'Mocha topped with whipped cream and chocolate', 'cutout', 'Dawn chapter'],
  ['espresso', 'espresso-tk_CUzjp.png', 612, 'Espresso cup with coffee beans on the saucer', 'cutout', 'Dawn chapter'],
  ['black-forest-pastry', 'BlackForest%20Pastry-nWMCbxy_.png', 600, 'Black Forest pastry slice with a cherry on top', 'photo', 'Pastry counter'],
  ['strawberry-pastry', 'stawberry%20pastry-Cg2rl2l-.webp', 800, 'Strawberry pastry on a plate against lavender', 'photo', 'Pastry counter'],
  ['butterscotch-pastry', 'Butterscotch%20Pastry-C0CQssuT.jpg', 800, 'Butterscotch pastry with caramel crunch', 'photo', 'Pastry counter'],
  ['pineapple-pastry', 'Pine%20apple%20pastry-BNqrQMeT.jpg', 800, 'Pineapple pastry with a cherry on top', 'photo', 'Pastry counter'],
  ['mango-pastry', 'Mango%20pastry-3UaUu-RO.jpg', 500, 'Mango pastry slice with a cherry', 'photo', 'Pastry counter'],
  ['vanilla-pastry', 'vanilla%20ckae-DJAnbT10.jpg', 360, 'Vanilla pastry with strawberry', 'photo', 'Pastry counter'],
  ['catering-wedding', 'wedding-DAGF5T0z.jpg', 1000, 'Outdoor wedding reception set with lanterns and flowers', 'photo', 'Celebrate grid'],
  ['catering-corporate', 'corporate%20eventss-U6i9frgv.jpg', 1000, 'Corporate event hall with guests at tables', 'photo', 'Celebrate grid'],
  ['catering-birthday', 'birthday-BOicPd-k.jpg', 1000, 'Birthday party table with balloons and cake', 'photo', 'Celebrate grid'],
  ['catering-community', 'community%20parties-5aMdqW6A.jpg', 1000, 'Friends celebrating together at a party', 'photo', 'Celebrate grid'],
  ['dessert-table', 'desser1-BQQC4e_M.jpeg', 720, 'Dessert table with tiers of mini desserts', 'photo', 'Celebrate grid'],
  ['dessert-cups', 'dessert%202-CHA6z_77.jpg', 1000, 'Rows of individual dessert cups', 'photo', 'Celebrate grid'],
  ['dessert-cupcakes', 'dessert5-DY_J2Mj3.jpg', 1000, 'Tray of frosted cupcakes', 'photo', 'Celebrate grid'],
];

const manifest = [];
for (const [name, src, maxW, alt, kind, use] of list) {
  const res = await fetch(BASE + src);
  if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(input).metadata();
  const files = [];
  for (const [suffix, w] of [['', maxW], ['-sm', Math.round(maxW / 2)]]) {
    const out = join(outDir, `${name}${suffix}.webp`);
    const info = await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: kind === 'cutout' ? 82 : 78, alphaQuality: 90, effort: 5 })
      .toFile(out);
    files.push({ path: `assets/jokerz/${name}${suffix}.webp`, width: info.width, height: info.height, bytes: info.size });
  }
  manifest.push({
    name, use, alt, kind,
    type: 'Client-supplied image (jokerzbakery.com)',
    source: BASE + src,
    original: `${meta.width}x${meta.height} ${meta.format}${meta.hasAlpha ? ' (transparent)' : ''}`,
    license: 'Supplied by the client via their live website; individual image provenance not verified by us',
    files,
  });
  console.log('ok', name, files.map((f) => `${f.width}x${f.height}`).join(' / '));
}
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Wrote ${manifest.length} images + manifest.json`);
