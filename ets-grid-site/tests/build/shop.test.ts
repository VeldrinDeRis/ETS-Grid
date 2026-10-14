import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { DIST, page, pages } from '../helpers/dist';

const NO_JS: [string, string][] = [
  ['/koshyk/', 'Кошик працює з увімкненим JavaScript.'],
  ['/oformlennya/', 'Оформлення працює з увімкненим JavaScript.'],
  ['/porivnyannya/', 'Порівняння працює з увімкненим JavaScript.'],
  ['/poshuk/', 'Пошук працює з увімкненим JavaScript.'],
];

describe('SPEC-005/AC-10 без JS — зрозуміла строка, а не порожня сторінка', () => {
  test.each(NO_JS)('%s', (url, text) => {
    const doc = page(url).document;
    const note = doc.querySelector('[data-nojs-note]');
    expect(note?.textContent).toContain(text);
    expect(doc.querySelector('h1')?.textContent?.trim()).toBeTruthy();
    expect(doc.querySelector('astro-island, [data-search-index]'), url).not.toBeNull();
  });

  test('кошик і порівняння без JS дають посилання на 4 розділи', () => {
    for (const url of ['/koshyk/', '/porivnyannya/']) {
      expect(page(url).document.querySelectorAll('[data-nojs-note] a')).toHaveLength(4);
    }
  });

  test('пошук без JS: форма веде на /poshuk/?q=, усі картки на сторінці приховані', () => {
    const doc = page('/poshuk/').document;
    const form = doc.querySelector('main form[role="search"]')!;
    expect(form.getAttribute('action')).toBe('/poshuk/');
    expect(form.getAttribute('method')).toBe('get');
    const items = [...doc.querySelectorAll('[data-search-item]')];
    expect(items.length).toBe(19);
    expect(items.every((i) => i.hasAttribute('hidden'))).toBe(true);
  });
});

describe('SPEC-005 §3.7 індекс пошуку і підказки в шапці', () => {
  const index = JSON.parse(readFileSync(join(DIST, 'search-index.json'), 'utf8')) as { kind: string; slug: string; url: string; title: string }[];

  test('search-index.json: усі товари й категорії, адреси існують', () => {
    expect(index.filter((e) => e.kind === 'product')).toHaveLength(19);
    expect(index.some((e) => e.kind === 'category')).toBe(true);
    const urls = new Set(pages().map((p) => p.url));
    for (const e of index) expect(urls.has(e.url), e.url).toBe(true);
  });

  test('бренд-плейсхолдери не потрапляють у пошук', () => {
    expect(JSON.stringify(index)).not.toMatch(/\[[А-ЯҐЄІЇA-Z ]+\]/);
  });

  test('поле пошуку в шапці — combobox зі списком (WAI-ARIA)', () => {
    for (const url of ['/', '/koshyk/', '/product/ets-home-7/']) {
      const doc = page(url).document;
      for (const id of ['header-q', 'mobile-q']) {
        const input = doc.getElementById(id)!;
        expect(input.getAttribute('role')).toBe('combobox');
        expect(input.getAttribute('aria-autocomplete')).toBe('list');
        expect(input.getAttribute('aria-expanded')).toBe('false');
        const list = doc.getElementById(input.getAttribute('aria-controls')!)!;
        expect(list.getAttribute('role')).toBe('listbox');
        expect(input.closest('form')!.getAttribute('action')).toBe('/poshuk/');
      }
    }
  });
});

describe('SPEC-005 §3.4 «Дякуємо»', () => {
  test('є блоки для замовлення, заявки й загальний; демо-помітка', () => {
    const doc = page('/dyakuyemo/').document;
    expect(doc.querySelector('[data-thanks-order]')).not.toBeNull();
    expect(doc.querySelector('[data-thanks-lead]')).not.toBeNull();
    expect(doc.querySelector('[data-thanks-general]:not([hidden])')).not.toBeNull();
    expect(doc.querySelector('[data-thanks-order]')!.textContent).toContain('Демо: замовлення нікуди не надсилається');
  });

  test('сторінки магазину закриті від індексації', () => {
    for (const url of ['/koshyk/', '/oformlennya/', '/porivnyannya/', '/poshuk/', '/dyakuyemo/']) {
      expect(page(url).document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    }
  });
});
