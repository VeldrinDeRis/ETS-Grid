import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { ILLUSTRATION_LABEL, PHOTOS, PRODUCT_ILLUSTRATION } from '../../src/lib/photos';
import { DIST, PROJECT, page } from '../helpers/dist';

const IMG = join(PROJECT, 'public', 'img');
const credits = readFileSync(join(IMG, 'CREDITS.md'), 'utf8');
const files = (dir: string, prefix = ''): string[] =>
  readdirSync(join(IMG, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`],
  );

describe('SPEC-010/AC-08 кожне фото має джерело в CREDITS.md', () => {
  test.each(files('').filter((f) => f !== 'CREDITS.md'))('%s', (file) => {
    const key = file.replace(/-\d+\.(avif|webp)$/, '');
    expect(credits, file).toContain(`\`${key}-*.{avif,webp}\``);
  });

  test('у кожного рядка фото — джерело, ліцензія й позначка «макет, замінити»', () => {
    for (const line of credits.split('\n').filter((l) => l.startsWith('| `photos/'))) {
      expect(line).toMatch(/https:\/\/(unsplash\.com|www\.pexels\.com)\//);
      expect(line).toMatch(/(Unsplash|Pexels) License/);
      expect(line).toContain('макет, замінити');
    }
  });

  test('для кожного ключа є AVIF і WebP усіх ширин', () => {
    const all = new Set(files('photos'));
    for (const [key, info] of Object.entries(PHOTOS)) {
      for (const w of info.widths) for (const ext of ['avif', 'webp']) expect(all.has(`${key}-${w}.${ext}`), `${key}-${w}.${ext}`).toBe(true);
    }
  });
});

describe('SPEC-010 §5 фото на сторінках', () => {
  test.each([
    ['/', 'hero-dc-night'],
    ['/', 'carport-charging'],
    ['/zaryadni-stantsii/', 'home-ac-wallbox'],
    ['/sonyachni-paneli/', 'roof-solar'],
    ['/batarei/', 'bess-container'],
    ['/solar-carport/', 'carport-below'],
  ])('%s → %s: <picture> з AVIF, alt і розмірами', (url, key) => {
    const pic = page(url).document.querySelector(`picture[data-photo="${key}"]`)!;
    expect(pic, `${url} ${key}`).not.toBeNull();
    expect(pic.querySelector('source[type="image/avif"]')).not.toBeNull();
    const img = pic.querySelector('img')!;
    expect(img.getAttribute('alt')).toBe(PHOTOS[key as keyof typeof PHOTOS].alt);
    expect(img.getAttribute('width')).toBeTruthy();
    expect(img.getAttribute('height')).toBeTruthy();
  });

  test('«Обʼєкти» — без чужих фото (D-005)', () => {
    expect(page('/obiekty/').document.querySelector('main picture, main img')).toBeNull();
  });

  test('файли фото потрапляють у dist', () => {
    expect(readdirSync(join(DIST, 'img', 'photos')).length).toBeGreaterThan(0);
  });
});

describe('D-042 ілюстративні фото товарів', () => {
  test.each(Object.entries(PRODUCT_ILLUSTRATION))('%s → %s: галерея й картка з міткою', (slug, key) => {
    const doc = page(`/product/${slug}/`).document;
    const main = doc.querySelector('[data-product-block="gallery"] .gallery__item--main');
    expect(main?.querySelector(`picture[data-photo="${key}"]`), slug).not.toBeNull();
    expect(main?.querySelector('.photo-note')?.textContent).toBe(ILLUSTRATION_LABEL);
    const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join('');
    expect(ld).not.toContain(`/img/photos/${key}`);
  });

  test.each(['ets-portable-7', 'cable-gbt-type2'])('%s — без ілюстрації (інший розʼєм на стоках)', (slug) => {
    expect(PRODUCT_ILLUSTRATION[slug]).toBeUndefined();
    const doc = page(`/product/${slug}/`).document;
    expect(doc.querySelector('[data-product-block="gallery"] picture')).toBeNull();
    expect(doc.querySelector('[data-product-block="gallery"] [data-gallery-placeholder]')).not.toBeNull();
  });

  test('у картках лістингу ілюстрація завжди з міткою', () => {
    const cards = [...page('/zaryadni-stantsii/').document.querySelectorAll('[data-product-card]')];
    for (const card of cards) {
      const pic = card.querySelector('.product-card__photo picture');
      if (pic) expect(card.querySelector('.photo-note')?.textContent, card.getAttribute('data-slug')!).toBe(ILLUSTRATION_LABEL);
    }
    expect(cards.filter((c) => c.querySelector('.product-card__photo picture')).length).toBeGreaterThan(0);
  });
});
