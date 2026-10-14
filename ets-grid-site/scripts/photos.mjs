// Оптимізація фото для макета (SPEC-010 §5): кадрування, AVIF + WebP у кількох ширинах → public/img/.
// Сирі файли — у ../sources/photos/raw/ (поза git). Запуск: node scripts/photos.mjs
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const sharp = createRequire(import.meta.url)('sharp');
const RAW = new URL('../../sources/photos/raw/2026-10-14/', import.meta.url);
const OUT = new URL('../public/img/photos/', import.meta.url);
mkdirSync(OUT, { recursive: true });

/** crop — частки кадру [x, y, w, h]; ratio результату 4:3. */
export const PHOTOS = [
  { key: 'hero-dc-night', crop: [0, 0.06, 0.78, 0.88] },
  { key: 'home-ac-wallbox', crop: [0.08, 0, 0.67, 1] },
  { key: 'roof-solar', crop: [0, 0, 1, 1] },
  { key: 'bess-container', crop: [0, 0.24, 1, 0.5625] },
  { key: 'carport-charging', crop: [0, 0, 1, 1] },
  { key: 'carport-below', crop: [0, 0.18, 1, 0.56] },
];
const WIDTHS = [640, 1280, 1920];

for (const p of PHOTOS) {
  const src = sharp(new URL(`${p.key}.jpg`, RAW).pathname.replace(/^\/(\w:)/, '$1'));
  const { width, height } = await src.metadata();
  const [x, y, w, h] = p.crop;
  let left = Math.round(x * width), top = Math.round(y * height), cw = Math.round(w * width), ch = Math.round(h * height);
  // приводимо до 4:3 по центру вирізу
  if (cw / ch > 4 / 3) { const nw = Math.round(ch * 4 / 3); left += Math.round((cw - nw) / 2); cw = nw; }
  else { const nh = Math.round(cw * 3 / 4); top += Math.round((ch - nh) / 2); ch = nh; }
  for (const size of WIDTHS.filter((s) => s <= cw)) {
    const base = sharp(new URL(`${p.key}.jpg`, RAW).pathname.replace(/^\/(\w:)/, '$1'))
      .extract({ left, top, width: cw, height: ch })
      .resize({ width: size })
      .modulate({ saturation: 0.9 });
    const dir = OUT.pathname.replace(/^\/(\w:)/, '$1');
    await base.clone().avif({ quality: 50 }).toFile(join(dir, `${p.key}-${size}.avif`));
    await base.clone().webp({ quality: 72 }).toFile(join(dir, `${p.key}-${size}.webp`));
  }
  console.log(p.key, `${cw}x${ch}`, 'from', `${width}x${height}`);
}
