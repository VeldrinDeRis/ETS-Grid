import { describe, expect, test } from 'vitest';
import homeJson from '../../src/data/home-content.json';
import { page } from '../helpers/dist';

const doc = () => page('/').document;
const ORDER = ['hero', 'systems', 'power', 'hits', 'flow', 'carport', 'steps', 'faq', 'cases', 'financing', 'final'];

describe('SPEC-006/AC-04 блоки 1–11 у порядку ТЗ §6.1', () => {
  test('порядок блоків', () => {
    const found = [...doc().querySelectorAll('[data-home-block]')].map((el) => el.getAttribute('data-home-block'));
    expect(found).toEqual(ORDER);
  });

  test('блок 9 — плашка «Тут будуть реальні обʼєкти ETS GRID» і посилання на /obiekty/', () => {
    const cases = doc().querySelector('[data-home-block="cases"]')!;
    expect(cases.textContent).toContain('Тут будуть реальні обʼєкти ETS GRID');
    expect(cases.querySelector('a[href="/obiekty/"]')).not.toBeNull();
  });

  test('рамки фото — видимі плейсхолдери в героі та блоці Carport', () => {
    expect(doc().querySelector('.hero__photo')?.textContent).toContain('[ФОТО');
    expect(doc().querySelector('.carport__photo')?.textContent).toContain('[ФОТО');
  });

  test('блок 3 — «Чи вистачить потужності?» з #potuzhnist, блок 11 — форма final у #zayavka', () => {
    expect(doc().querySelector('#potuzhnist [data-home-block="power"] [data-picker-kind="power"], #potuzhnist [data-home-block="power"] astro-island')).not.toBeNull();
    const form = doc().querySelector('#zayavka [data-home-block="final"] form[data-lead-form]');
    expect(form?.getAttribute('data-kind')).toBe('final');
  });

  test('один h1 — у першому екрані', () => {
    const h1 = doc().querySelectorAll('h1');
    expect(h1).toHaveLength(1);
    expect(h1[0].closest('[data-home-block="hero"]')).not.toBeNull();
  });
});

describe('SPEC-006/AC-05 перший екран', () => {
  const hero = () => doc().querySelector('[data-home-block="hero"]')!;

  test('надзаголовок, H1, підзаголовок — варіант B за замовчуванням', () => {
    const b = homeJson.hero.variants.find((v) => v.id === homeJson.hero.active)!;
    expect(hero().querySelector('[data-hero-field="overline"]')?.textContent).toBe(b.overline);
    expect(hero().querySelector('h1')?.textContent).toBe(b.h1);
    expect(hero().querySelector('[data-hero-field="subtitle"]')?.textContent).toBe(b.subtitle);
  });

  test('ціновий якір із «демо-ціна», 2 CTA', () => {
    const anchor = hero().querySelector('.hero__anchor:not([hidden])')!;
    expect(anchor.textContent).toContain('демо-ціна');
    expect(anchor.textContent).toMatch(/₴/);
    expect(hero().querySelector('[data-hero-cta="primary"]')?.getAttribute('href')).toBe('#potuzhnist');
    expect(hero().querySelector('[data-hero-cta="secondary"]')?.getAttribute('href')).toBe('/kontakty/#rozrakhunok');
  });

  test('4 плитки рівнів з «від … ₴» або «Ціна за розрахунком»', () => {
    const tiles = [...hero().querySelectorAll('[data-level-tile]')];
    expect(tiles).toHaveLength(4);
    for (const t of tiles) expect(t.querySelector('.hero__tile-price')?.textContent).toMatch(/^(від .+₴|Ціна за розрахунком)$/);
  });

  test('смуга довіри — лише плейсхолдери', () => {
    const trust = [...hero().querySelectorAll('.hero__trust-list li')].map((li) => li.textContent!.trim());
    expect(trust.length).toBeGreaterThanOrEqual(3);
    for (const t of trust) expect(t).toMatch(/\[[^\]]+\]/);
  });
});

describe('SPEC-006/AC-06 вкладки блоку 2', () => {
  test('Бізнес → Дім → АЗС; без JS — усі панелі видимі; у сегментів з < 3 систем — плитка підбору', () => {
    const block = doc().querySelector('[data-home-block="systems"]')!;
    expect([...block.querySelectorAll('[role="tab"]')].map((t) => t.textContent!.trim())).toEqual(homeJson.tabs.map((t) => t.label));
    const panels = [...block.querySelectorAll('[data-tab-panel]')];
    expect(panels.every((p) => !p.hasAttribute('hidden'))).toBe(true);
    for (const p of panels) {
      const systems = p.querySelectorAll('.systems__item:not(.systems__item--fallback)').length;
      const fallback = p.querySelector('.systems__item--fallback');
      if (systems < 3) expect(fallback?.textContent).toContain('Підберемо систему під ваш обʼєкт');
    }
  });
});

describe('SPEC-006/AC-07 хіти', () => {
  test('6–8 карток ProductCard у порядку hits', () => {
    const slugs = [...doc().querySelectorAll('[data-home-block="hits"] [data-product-card]')].map((c) => c.getAttribute('data-slug'));
    expect(slugs).toEqual(homeJson.hits);
  });
});

describe('SPEC-006/AC-08 схема потоку', () => {
  test('5 вузлів-посилань у <ol>, лінії декоративні, є текстовий опис', () => {
    const flow = doc().querySelector('[data-home-block="flow"]')!;
    const links = [...flow.querySelectorAll('ol > li > a')];
    expect(links).toHaveLength(5);
    for (const a of links) expect(a.getAttribute('href')).toMatch(/^\//);
    for (const line of flow.querySelectorAll('.flow__line')) expect(line.getAttribute('aria-hidden')).toBe('true');
    expect(flow.querySelector('.flow__lead')?.textContent?.length).toBeGreaterThan(20);
  });
});

describe('SPEC-006/AC-09 плашка-маніфест', () => {
  test('рівно одна на сторінці', () => {
    expect(doc().querySelectorAll('[data-manifesto]')).toHaveLength(1);
  });
});
