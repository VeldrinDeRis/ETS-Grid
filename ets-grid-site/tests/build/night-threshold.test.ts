// SPEC-001 ревізія 10, SPEC-002 ревізія 7 (D-067): нічна шапка й нічний поріг (AC-25, AC-26, AC-45).
import { describe, expect, test } from 'vitest';
import { page, pages } from '../helpers/dist';

const RICH = ['/zaryadni-stantsii/', '/sonyachni-paneli/', '/batarei/', '/solar-carport/'];
const LISTINGS = ['/zaryadni-stantsii/dlya-domu/', '/batarei/dlya-domu/', '/zaryadni-stantsii/dlya-domu/gbt/', '/sonyachni-paneli/kriplennya/'];
const CRUMBS_ONLY = ['/product/ets-home-7/'];

describe('SPEC-001/AC-25 шапка — ніч на кожній сторінці', () => {
  test('header і панель мобільного меню з data-surface="night"', () => {
    const all = pages();
    expect(all.length).toBeGreaterThan(30);
    for (const p of all) {
      expect(p.document.querySelector('header.site-header')?.getAttribute('data-surface'), p.url).toBe('night');
      const panel = p.document.querySelector('.mobile-menu__panel');
      if (panel) expect(panel.getAttribute('data-surface'), p.url).toBe('night');
    }
  });
});

describe('SPEC-001/AC-26 нічний поріг на кожній сторінці, крім головної', () => {
  test('головна — без порогу', () => {
    expect(page('/').document.querySelector('[data-page-top]')).toBeNull();
  });

  test('усі інші: поріг — перший у .page, нічний, з крихтами; перша секція main — стик dawn; товари й форми — не в порозі', () => {
    for (const p of pages().filter((x) => x.url !== '/')) {
      const doc = p.document;
      const pageEl = doc.querySelector('.page')!;
      const top = pageEl.firstElementChild!;
      expect(top.hasAttribute('data-page-top'), p.url).toBe(true);
      expect(top.getAttribute('data-surface'), p.url).toBe('night');
      if (p.url !== '/404.html' && !p.url.startsWith('/404')) expect(top.querySelector('nav.crumbs'), `${p.url}: крихти`).not.toBeNull();
      const first = doc.querySelector('main > section, main > *:first-child section');
      expect(first?.getAttribute('data-seam'), `${p.url}: стик`).toBe('dawn');
      expect(top.querySelector('[data-product-card], form:not([role="search"]), .cf'), `${p.url}: вітрина в порозі`).toBeNull();
    }
  });

  test('rich — рівні й Solar Carport: H1 і рівно одна primary-кнопка в порозі', () => {
    for (const url of RICH) {
      const top = page(url).document.querySelector('[data-page-top]')!;
      expect(top.getAttribute('data-threshold'), url).toBe('rich');
      expect(top.querySelectorAll('h1').length, url).toBe(1);
      expect(top.querySelectorAll('.btn--primary').length, url).toBe(1);
    }
  });

  test('min — товар: лише крихти, H1 товару на дні поруч із ціною', () => {
    for (const url of CRUMBS_ONLY) {
      const doc = page(url).document;
      const top = doc.querySelector('[data-page-top]')!;
      expect(top.getAttribute('data-threshold'), url).toBe('min');
      expect(top.querySelector('h1'), url).toBeNull();
      expect(doc.querySelector('main h1'), url).not.toBeNull();
    }
  });

  test('min — контентні, службові, кошик, пошук: H1 у порозі, у main H1 немає', () => {
    const urls = pages()
      .map((p) => p.url)
      .filter((u) => u !== '/' && !RICH.includes(u) && !u.startsWith('/product/') && !u.startsWith('/gid/') || u === '/gid/');
    for (const url of urls) {
      const doc = page(url).document;
      const isCatalog = doc.querySelector('.cf, [data-empty-state]');
      if (!isCatalog && doc.querySelector('[data-level-block]')) continue;
      const top = doc.querySelector('[data-page-top]');
      if (!top) continue;
      expect(top.querySelectorAll('h1').length, url).toBe(1);
      expect(doc.querySelector('main h1'), url).toBeNull();
    }
  });
});

describe('SPEC-002/AC-45 поріг рівня й лістингу', () => {
  test('рівень: міні-герой у порозі, плитки розділів — перша секція зі стиком', () => {
    for (const url of RICH.slice(0, 3)) {
      const doc = page(url).document;
      expect(doc.querySelector('[data-page-top] [data-level-block="hero"] h1'), url).not.toBeNull();
      const first = doc.querySelector('main > section')!;
      expect(first.getAttribute('data-seam'), url).toBe('dawn');
      expect(first.querySelector('[data-level-block="tiles"]'), url).not.toBeNull();
    }
  });

  test('лістинг і ЧПУ: H1 і добірки в порозі, каталог — на дні в першій секції зі стиком', () => {
    for (const url of LISTINGS) {
      const doc = page(url).document;
      const top = doc.querySelector('[data-page-top]')!;
      expect(top.querySelector('h1'), url).not.toBeNull();
      expect(top.querySelector('.listing__picker a'), url).not.toBeNull();
      const first = doc.querySelector('main > section')!;
      expect(first.getAttribute('data-seam'), url).toBe('dawn');
      expect(first.querySelector('.cf, [data-empty-state]'), url).not.toBeNull();
    }
  });
});
