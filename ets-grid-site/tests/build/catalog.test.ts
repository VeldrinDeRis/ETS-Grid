import { describe, expect, test } from 'vitest';
import carsJson from '../../src/data/cars.json';
import catalog from '../../src/data/catalog.json';
import filtersJson from '../../src/data/filters.json';
import structure from '../../src/data/structure.json';
import { applyFilters, cardBadge, keyChars, resolveFacets, type Car, type FiltersFile } from '../../src/lib/filters';
import { priceView } from '../../src/lib/price';
import { routes } from '../../src/lib/routes';
import type { Product } from '../../src/lib/schema';
import { page } from '../helpers/dist';

const filters = filtersJson as unknown as FiltersFile;
const products = catalog.products.map((p) => ({ docs: [], related: [], ...p })) as unknown as Product[];
const levelBy = (key: string) => structure.levels.find((l) => l.key === key)!;
const cards = (url: string) => [...page(url).document.querySelectorAll('main [data-product-card]')];
const cardSlugs = (url: string) => cards(url).map((c) => c.getAttribute('data-slug'));
const text = (s: string) => s.replace(/[ \t\r\n]+/g, ' ').trim();

function expectProductsInHtml(url: string, list: Product[]) {
  const html = page(url).document.querySelector('main')!.textContent!.replace(/[ \t\r\n]+/g, ' ');
  expect(cardSlugs(url).sort()).toEqual(list.map((p) => p.slug).sort());
  for (const p of list) {
    expect(html).toContain(p.name);
    expect(html).toContain(priceView(p).primary);
  }
}

describe('SPEC-002/AC-14 товари й ціни в HTML без JS', () => {
  const listings = structure.categories.map((c) => {
    const level = levelBy(c.level);
    return [routes.category(level.slug, c.slug), products.filter((p) => p.level === level.id && p.category === c.slug)] as const;
  });

  test.each(listings.filter(([, list]) => list.length > 0))('лістинг %s', (url, list) => expectProductsInHtml(url, list));

  test.each(structure.levels.filter((l) => l.key !== 'carport').map((l) => [routes.level(l.slug), l.id] as const))(
    'рівень %s',
    (url, id) => expectProductsInHtml(url, products.filter((p) => p.level === id)),
  );

  test.each(filters.presets.map((p) => [routes.preset(levelBy(p.level).slug, p.category, p.slug), p] as const))(
    'ЧПУ %s: лише відповідні товари, свій H1, index, canonical на себе',
    (url, preset) => {
      const level = levelBy(preset.level);
      const all = products.filter((p) => p.level === level.id && p.category === preset.category);
      const ctx = { cars: carsJson as Car[] };
      const expected = applyFilters(all, { filters: preset.filters, sort: null }, resolveFacets(filters.levels[preset.level], all, ctx), ctx);
      expect(expected.length).toBeGreaterThan(0);
      expectProductsInHtml(url, expected);
      const doc = page(url).document;
      expect(doc.querySelector('h1')?.textContent?.trim()).toBe(preset.h1);
      expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
      expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`https://ets-grid.test${url}`);
    },
  );

  test('«Популярні добірки» на лістингу ведуть на ЧПУ-сторінки', () => {
    const links = [...page('/zaryadni-stantsii/dlya-domu/').document.querySelectorAll('nav[aria-label="Популярні добірки"] a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toEqual(['/zaryadni-stantsii/dlya-domu/gbt/', '/zaryadni-stantsii/dlya-domu/22-kvt/']);
  });
});

describe('SPEC-002/AC-15 сторінка рівня', () => {
  test.each(structure.levels.filter((l) => l.key !== 'carport').map((l) => [routes.level(l.slug), l.key] as const))('%s', (url, key) => {
    const doc = page(url).document;
    const blocks = [...doc.querySelectorAll('[data-level-block]')].map((b) => b.getAttribute('data-level-block'));
    expect(blocks).toEqual(['hero', 'tiles', 'picker', 'catalog', 'guide', 'cross', 'faq', 'form']);
    expect(doc.getElementById('pidbir')).not.toBeNull();

    const tiles = [...doc.querySelectorAll('[data-level-block="tiles"] .tile')];
    expect(tiles).toHaveLength(structure.categories.filter((c) => c.level === key).length);
    for (const tile of tiles) expect(text(tile.textContent!)).toMatch(/від \d|Ціна за розрахунком|Підберемо під ваш обʼєкт/);

    expect(doc.querySelectorAll('[data-level-block="faq"] details').length).toBeGreaterThanOrEqual(3);
  });

  test('порожня категорія в плитках — «Підберемо під ваш обʼєкт»', () => {
    const tile = [...page('/sonyachni-paneli/').document.querySelectorAll('.tile')].find((t) => t.textContent!.includes('Кріплення'));
    expect(text(tile!.textContent!)).toContain('Підберемо під ваш обʼєкт');
  });
});

describe('SPEC-002/AC-16 картка в лістингу', () => {
  test.each(products.map((p) => [p.slug, p] as const))('%s', (slug, product) => {
    const level = structure.levels.find((l) => l.id === product.level)!;
    const card = cards(routes.category(level.slug, product.category)).find((c) => c.getAttribute('data-slug') === slug)!;
    expect(card).toBeDefined();
    const titleLinks = card.querySelectorAll('.product-card__title a');
    expect(titleLinks).toHaveLength(1);
    expect(titleLinks[0].getAttribute('href')).toBe(routes.product(slug));
    const chars = [...card.querySelectorAll('.product-card__chars li')].map((li) => li.textContent!.trim());
    expect(chars).toEqual(keyChars(product));
    expect(chars.join(' ')).not.toMatch(/\[/);
    expect(card.querySelector('.price')).not.toBeNull();
    expect(text(card.querySelector('.product-card__stock')!.textContent!)).toMatch(/^(В наявності|Під замовлення · \d+ дн\.)$/);
    const badge = card.querySelector('.product-card__badge')?.textContent?.trim() ?? null;
    expect(badge).toBe(cardBadge(product));
    if (product.sale_mode === 'quote') expect(card.querySelector('a.product-card__cta')?.getAttribute('href')).toBe(routes.quoteFor(slug));
    else expect(card.querySelector('button[data-add-to-cart]')).not.toBeNull();
  });
});

describe('SPEC-002/AC-17 порожня категорія', () => {
  test('/sonyachni-paneli/kriplennya/: екран порожньої видачі з 3 товарами рівня', () => {
    const doc = page('/sonyachni-paneli/kriplennya/').document;
    const empty = doc.querySelector('[data-empty-state]');
    expect(empty).not.toBeNull();
    expect(text(empty!.textContent!)).toContain('Таких товарів немає. Скиньте фільтр або дайте нам 3 питання — підберемо.');
    const slugs = [...empty!.querySelectorAll('[data-product-card]')].map((c) => c.getAttribute('data-slug'));
    expect(slugs).toHaveLength(3);
    for (const s of slugs) expect(products.find((p) => p.slug === s)?.level).toBe(2);
  });
});
