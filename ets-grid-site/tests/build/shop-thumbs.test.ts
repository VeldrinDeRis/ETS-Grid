// SPEC-005 ревізія 1 (D-071): мініатюри й плитки рівнів у мові вітрини (AC-13, AC-14).
import { describe, expect, test } from 'vitest';
import { page } from '../helpers/dist';

/** Props острова Astro: значення серіалізовані як [тип, значення]; розгортаємо в звичайний JSON. */
function unwrap(v: unknown): unknown {
  if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') {
    const [type, value] = v as [number, unknown];
    if (type === 0) return value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, x]) => [k, unwrap(x)])) : value;
    if (type === 1) return (value as unknown[]).map(unwrap);
    return value;
  }
  return v;
}

function islandProps(url: string, component: string): Record<string, unknown> {
  const island = [...page(url).document.querySelectorAll('astro-island')].find((i) => (i.getAttribute('component-url') ?? '').includes(component));
  expect(island, `${url}: ${component}`).toBeTruthy();
  return unwrap([0, JSON.parse(island!.getAttribute('props')!)]) as Record<string, unknown>;
}

type Thumb = { src: string; avif?: string; webp?: string; illustrative: boolean } | null;
type ShopProduct = { slug: string; thumb: Thumb };

describe('SPEC-005/AC-13 мініатюра — кадр товару', () => {
  for (const [url, component] of [
    ['/koshyk/', 'Cart'],
    ['/oformlennya/', 'Checkout'],
    ['/porivnyannya/', 'Compare'],
  ] as const) {
    test(`${url}: у кожного товару є кадр або явне «немає»`, () => {
      const products = islandProps(url, component).products as ShopProduct[];
      expect(products.length).toBeGreaterThan(10);
      const withThumb = products.filter((p) => p.thumb);
      // Ілюстрація є майже в усіх (без неї — лише товари, де стоковий кадр суперечить товару, D-042).
      expect(withThumb.length / products.length).toBeGreaterThan(0.85);
      for (const p of withThumb) {
        expect(p.thumb!.src, p.slug).toMatch(/^\/img\/photos\/.+\.webp$|^\/img\//);
        if (p.thumb!.illustrative) {
          expect(p.thumb!.avif, p.slug).toMatch(/\.avif \d+w/);
          expect(p.thumb!.webp, p.slug).toMatch(/\.webp \d+w/);
        }
      }
    });
  }

  test('картка товару: індекс «Недавно переглянуті» несе мініатюри', () => {
    const doc = page('/product/ets-home-7/').document;
    const index = JSON.parse(doc.querySelector('[data-product-index]')!.textContent!) as Record<string, { thumb: Thumb }>;
    expect(index['ets-home-22'].thumb).toMatchObject({ illustrative: true });
    expect(index['ets-home-22'].thumb!.src).toMatch(/^\/img\/photos\/.+\.webp$/);
  });
});

describe('SPEC-005/AC-14 плитки рівнів у граматиці героя', () => {
  test('«Дякуємо»: чотири плитки з іконкою, ціною «від» і вогником', () => {
    const doc = page('/dyakuyemo/').document;
    const tiles = [...doc.querySelectorAll('.shop-tile[data-shop-tile]')];
    expect(tiles).toHaveLength(4);
    for (const t of tiles) {
      expect(t.querySelector('svg.icon path')?.getAttribute('d')).toBeTruthy();
      expect(t.querySelector('.shop-tile__name')?.textContent?.trim()).toBeTruthy();
      expect(t.querySelector('.shop-tile__price')?.textContent).toMatch(/^від \d|Ціна за розрахунком/);
    }
  });

  test('кошик і порівняння отримують ті самі плитки', () => {
    for (const [url, component] of [
      ['/koshyk/', 'Cart'],
      ['/porivnyannya/', 'Compare'],
    ] as const) {
      const levels = islandProps(url, component).levels as { icon: string; from: string }[];
      expect(levels).toHaveLength(4);
      for (const l of levels) {
        expect(l.icon).toMatch(/^M/);
        expect(l.from).toMatch(/^від \d|Ціна за розрахунком/);
      }
    }
  });
});
