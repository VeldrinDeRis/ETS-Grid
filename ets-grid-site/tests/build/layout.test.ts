import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import structure from '../../src/data/structure.json';
import { routes } from '../../src/lib/routes';
import { pages } from '../helpers/dist';

const all = pages();
const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

describe('SPEC-001/AC-03 каркас кожної сторінки', () => {
  test.each(all.map((p) => [p.url, p] as const))('%s', (_url, p) => {
    const doc = p.document;
    expect(doc.documentElement.getAttribute('lang')).toBe('uk');
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelectorAll('main#main')).toHaveLength(1);
    const first = doc.body.querySelector(FOCUSABLE);
    expect(first?.classList.contains('skip-link')).toBe(true);
    expect(first?.getAttribute('href')).toBe('#main');
    expect(first?.textContent?.trim()).toBe('Перейти до змісту');
  });
});

describe('SPEC-001/AC-04 хлібні крихти', () => {
  test('на головній немає крихт', () => {
    const home = all.find((p) => p.url === '/')!;
    expect(home.document.querySelector('nav[aria-label="Хлібні крихти"]')).toBeNull();
  });

  test.each(all.filter((p) => p.url !== '/').map((p) => [p.url, p] as const))('%s', (_url, p) => {
    const nav = p.document.querySelector('nav[aria-label="Хлібні крихти"]');
    expect(nav).not.toBeNull();
    const items = [...nav!.querySelectorAll('li')];
    expect(items.length).toBeGreaterThanOrEqual(2);
    const firstLink = items[0].querySelector('a');
    expect(firstLink?.textContent?.trim()).toBe('Головна');
    expect(firstLink?.getAttribute('href')).toBe('/');
    const last = items.at(-1)!;
    expect(last.querySelector('a')).toBeNull();
    expect(last.querySelector('[aria-current="page"]')).not.toBeNull();
  });

  test('у товару 4 ланки: Головна › Рівень › Категорія › Товар', () => {
    const p = catalog.products[0];
    const productPage = all.find((x) => x.url === routes.product(p.slug))!;
    const items = productPage.document.querySelectorAll('nav[aria-label="Хлібні крихти"] li');
    expect(items).toHaveLength(4);
    expect(items[3].textContent?.trim()).toBe(p.name);
  });
});

describe('SPEC-001/AC-05 4 рівні в шапці кожної сторінки (без JS)', () => {
  const levelUrls = structure.levels.map((l) => routes.level(l.slug));
  test.each(all.map((p) => [p.url, p] as const))('%s', (_url, p) => {
    const header = p.document.querySelector('header');
    const hrefs = [...header!.querySelectorAll('nav[aria-label="Основне меню"] a')].map((a) => a.getAttribute('href'));
    for (const url of levelUrls) expect(hrefs).toContain(url);
  });
});
