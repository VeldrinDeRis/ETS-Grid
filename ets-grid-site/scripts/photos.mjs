// Оптимізація фото для макета (SPEC-010 §5, D-042): кадрування, AVIF + WebP у кількох ширинах → public/img/photos/.
// Сирі файли — у ../sources/photos/raw/ (поза git). Запуск: node scripts/photos.mjs [ключ…]
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sharp = createRequire(import.meta.url)('sharp');
const RAW = fileURLToPath(new URL('../../sources/photos/raw/2026-10-14/', import.meta.url));
// Кадри обʼєктів (D-061) — окрема тека за датою скачування.
const RAW_CASES = fileURLToPath(new URL('../../sources/photos/raw/2026-10-15/', import.meta.url));
// Кадри міні-галерей карток (D-065): нові кадри Pexels pf-{id}.jpg; набори — src/data/product-frames.json.
const RAW_PRODUCTS = fileURLToPath(new URL('../../sources/photos/raw/2026-10-15-products/', import.meta.url));
const frames = JSON.parse(readFileSync(new URL('../src/data/product-frames.json', import.meta.url), 'utf8'));
const OUT = fileURLToPath(new URL('../public/img/photos/', import.meta.url));
mkdirSync(OUT, { recursive: true });

/**
 * src — сирий файл; crop — частки кадру [x, y, w, h], результат приводиться до ratio по центру вирізу.
 * Герої — 4:3 (640/1280/1920); товарні ілюстрації — 1:1 (480/960), ключі з префіксом «p-».
 */
const HERO = { ratio: 4 / 3, widths: [640, 1280, 1920] };
const PRODUCT = { ratio: 1, widths: [480, 960] };
// Галереї обʼєктів (D-061): 16:9 (ТЗ §8.3), два розміри — картка 3-в-ряд і телефон; кадр цілком, центр.
const CASE = { ratio: 16 / 9, widths: [640, 1280], raw: RAW_CASES };
/** Кадри наборів карток 1:1 (D-065): нові — з RAW_PRODUCTS, повтори «Обʼєкти» — 1:1-версії кадрів case-*. */
const productFrames = () =>
  Object.entries(frames.sets).flatMap(([set, s]) => [
    ...s.frames.map((f, i) => ({ key: `pf-${set}-${i + 1}`, src: `pf-${f.id}`, crop: [0, 0, 1, 1], ...PRODUCT, raw: RAW_PRODUCTS })),
    ...s.reuse.map((k) => ({ key: `p-${k}`, src: k, crop: [0, 0, 1, 1], ...PRODUCT, raw: RAW_CASES })),
  ]);
const cases = (group, n) => Array.from({ length: n }, (_, i) => ({ key: `case-${group}-${i + 1}`, src: `case-${group}-${i + 1}`, crop: [0, 0, 1, 1], ...CASE }));
export const PHOTOS = [
  ...productFrames(),
  ...cases('parking', 10),
  ...cases('home', 10),
  ...cases('biz', 10),
  { key: 'hero-dc-night', src: 'hero-dc-night', crop: [0, 0.06, 0.78, 0.88], ...HERO },
  { key: 'home-ac-wallbox', src: 'home-ac-wallbox', crop: [0.08, 0, 0.67, 1], ...HERO },
  { key: 'roof-solar', src: 'roof-solar', crop: [0, 0, 1, 1], ...HERO },
  { key: 'bess-container', src: 'bess-container', crop: [0, 0.24, 1, 0.5625], ...HERO },
  { key: 'carport-charging', src: 'carport-charging', crop: [0, 0, 1, 1], ...HERO },
  { key: 'carport-below', src: 'carport-below', crop: [0, 0.18, 1, 0.56], ...HERO },
  // ілюстрації товарів (D-042)
  { key: 'p-ac-wallbox', src: 'home-ac-wallbox', crop: [0.25, 0, 0.5, 1], ...PRODUCT },
  { key: 'p-ac-duo', src: 'duo-two-cables', crop: [0.15, 0, 0.7, 1], ...PRODUCT },
  { key: 'p-dc-charging', src: 'dc-charging-car', crop: [0, 0.2, 1, 0.6], ...PRODUCT },
  { key: 'p-panel', src: 'panel-on-roof', crop: [0.1, 0, 0.8, 1], ...PRODUCT },
  { key: 'p-inverter', src: 'inverter-battery-wall', crop: [0, 0.05, 1, 0.75], ...PRODUCT },
  { key: 'p-solar-kit', src: 'roof-solar', crop: [0.2, 0, 0.6, 1], ...PRODUCT },
  { key: 'p-home-battery', src: 'home-battery', crop: [0.44, 0.37, 0.56, 0.63], ...PRODUCT },
  { key: 'p-bess', src: 'bess-container', crop: [0, 0.2, 1, 0.75], ...PRODUCT },
  { key: 'p-carport', src: 'carport-charging', crop: [0.15, 0, 0.7, 1], ...PRODUCT },
  { key: 'p-carport-below', src: 'carport-below', crop: [0, 0.15, 1, 0.6], ...PRODUCT },
];

const only = new Set(process.argv.slice(2));
for (const p of PHOTOS.filter((x) => only.size === 0 || only.has(x.key))) {
  const file = join(p.raw ?? RAW, `${p.src}.jpg`);
  const { width, height } = await sharp(file).metadata();
  const [x, y, w, h] = p.crop;
  let left = Math.round(x * width), top = Math.round(y * height), cw = Math.round(w * width), ch = Math.round(h * height);
  if (cw / ch > p.ratio) {
    const nw = Math.round(ch * p.ratio);
    left += Math.round((cw - nw) / 2);
    cw = nw;
  } else {
    const nh = Math.round(cw / p.ratio);
    top += Math.round((ch - nh) / 2);
    ch = nh;
  }
  for (const size of p.widths.filter((s) => s <= cw)) {
    const base = sharp(file).extract({ left, top, width: cw, height: ch }).resize({ width: size }).modulate({ saturation: 0.9 });
    await base.clone().avif({ quality: 50 }).toFile(join(OUT, `${p.key}-${size}.avif`));
    await base.clone().webp({ quality: 72 }).toFile(join(OUT, `${p.key}-${size}.webp`));
  }
  console.log(p.key, `${cw}x${ch}`, 'from', `${p.src} ${width}x${height}`);
}
