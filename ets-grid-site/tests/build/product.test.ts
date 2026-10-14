import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import { routes } from '../../src/lib/routes';
import type { Product } from '../../src/lib/schema';
import { fullRows } from '../../src/lib/product';
import { page } from '../helpers/dist';

const products = catalog.products.map((p) => ({ docs: [], related: [], ...p })) as unknown as Product[];
const BLOCKS = ['gallery', 'header', 'price', 'chars', 'fit', 'install', 'delivery', 'docs', 'cross', 'reviews', 'sticky'];
const text = (s: string | null | undefined) => (s ?? '').replace(/[ \t\r\n]+/g, ' ').trim();

describe('SPEC-003/AC-03 11 блоків у порядку ТЗ, відсутнє — видимими плейсхолдерами', () => {
  test.each(products.map((p) => [p.slug, p] as const))('%s', (slug, product) => {
    const doc = page(routes.product(slug)).document;
    const blocks = [...doc.querySelectorAll('[data-product-block]')].map((b) => b.getAttribute('data-product-block'));
    expect(blocks).toEqual(BLOCKS);

    const gallery = doc.querySelector('[data-product-block="gallery"]')!;
    expect(gallery.querySelectorAll('.gallery__item')).toHaveLength(4);
    expect(text(doc.querySelector('[data-product-block="header"]')?.textContent)).toContain('[АРТИКУЛ]');
    if (product.docs.length === 0) expect(text(doc.querySelector('[data-product-block="docs"]')?.textContent)).toContain('[ПАСПОРТ, PDF]');
    if (product.related.length === 0) expect(text(doc.querySelector('[data-product-block="cross"]')?.textContent)).toContain('[АКСЕСУАРИ]');
    expect(text(doc.querySelector('[data-product-block="reviews"]')?.textContent)).toContain('Відгуки зʼявляться після перших покупок');
  });
});

describe('SPEC-003/AC-04 повна таблиця характеристик', () => {
  test.each(products.map((p) => [p.slug, p] as const))('%s', (slug, product) => {
    const table = page(routes.product(slug)).document.querySelector('[data-product-part="spec-table"] table')!;
    const rows = [...table.querySelectorAll('tr')].map((tr) => [text(tr.querySelector('th')?.textContent), text(tr.querySelector('td')?.textContent)]);
    const expected = fullRows(product);
    expect(rows.map((r) => r[0])).toEqual(expected.map((r) => r.label));
    expected.forEach((row, i) => {
      if (row.value === null) expect(rows[i][1]).toBe('[ДАНІ]');
    });
  });
});

describe('SPEC-003/AC-05 перехресний блок за ТЗ §5', () => {
  test.each([
    ['ets-dc-60', 'Додайте накопичувач, якщо мережі не вистачає', ['ets-bess-100']],
    ['ets-battery-home-10', 'Заряджайте від сонця', ['inverter-hybrid-10', 'ets-solar-home-5']],
    ['carport-commercial-8', 'Додайте зарядні станції', ['ets-duo-22-ocpp', 'ets-bess-100']],
  ])('%s', (slug, title, cards) => {
    const block = page(routes.product(slug)).document.querySelector('[data-product-block="cross"]')!;
    expect(text(block.querySelector('h2')?.textContent)).toBe(title);
    expect([...block.querySelectorAll('[data-product-card]')].map((c) => c.getAttribute('data-slug'))).toEqual(cards);
  });

  test('DC з порожнім cross_level — видима плашка', () => {
    const block = page(routes.product('ets-dc-120-battery')).document.querySelector('[data-product-block="cross"]')!;
    expect(text(block.textContent)).toContain('[ПОВʼЯЗАНІ ТОВАРИ]');
  });
});

describe('SPEC-003 без JS', () => {
  test('перемикач: обидві ціни в HTML; сумісність — таблиця всіх авто', () => {
    const doc = page(routes.product('ets-home-7')).document;
    const price = text(doc.querySelector('[data-product-block="price"]')?.textContent);
    expect(price).toContain('32 900 ₴');
    expect(price).toContain('24 900 ₴');
    expect(doc.querySelectorAll('[data-compat-row]').length).toBeGreaterThanOrEqual(10);
  });

  test('сумісність є лише в зарядок', () => {
    expect(page(routes.product('panel-550-topcon')).document.querySelector('[data-compat]')).toBeNull();
    expect(page(routes.product('cable-gbt-type2')).document.querySelector('[data-compat]')).not.toBeNull();
  });
});
