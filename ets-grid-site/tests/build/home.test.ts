import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import homeJson from '../../src/data/home-content.json';
import { page } from '../helpers/dist';

const doc = () => page('/').document;
// Рев. 5 (D-053, D-055): блок 5 «схема» — перед блоком 2 «Що вам потрібно?» (ТЗ §6.1 допускає інший порядок з обґрунтуванням).
const ORDER = ['hero', 'flow', 'systems', 'power', 'hits', 'carport', 'steps', 'faq', 'cases', 'financing', 'final'];

describe('SPEC-006/AC-04 блоки 1–11 у порядку ТЗ §6.1 (рев. 5: схема перед сценаріями)', () => {
  test('порядок блоків', () => {
    const found = [...doc().querySelectorAll('[data-home-block]')].map((el) => el.getAttribute('data-home-block'));
    expect(found).toEqual(ORDER);
  });

  test('блок 9 — плашка «Тут будуть реальні обʼєкти ETS GRID» і посилання на /obiekty/', () => {
    const cases = doc().querySelector('[data-home-block="cases"]')!;
    expect(cases.textContent).toContain('Тут будуть реальні обʼєкти ETS GRID');
    expect(cases.querySelector('a[href="/obiekty/"]')).not.toBeNull();
  });

  test('фото героя і блоку Carport — на своїх місцях (SPEC-010 §5)', () => {
    expect(doc().querySelector('.hero__photo picture[data-photo="hero-dc-night"]')).not.toBeNull();
    expect(doc().querySelector('.carport__photo picture[data-photo="carport-charging"]')).not.toBeNull();
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

describe('SPEC-006/AC-32 числа схеми — з каталогу (рев. 5, акт II)', () => {
  test('кожен вузол: число з характеристики товару або складу системи, ціна з міткою демо', () => {
    const nodes = [...doc().querySelectorAll('[data-home-block="flow"] [data-node]')];
    expect(nodes).toHaveLength(5);
    const values = nodes.map((n) => n.querySelector('[data-live-number]')?.getAttribute('data-live-number'));
    expect(values).toEqual(['5', '10', '10.24', '22', '3']);
    const units = nodes.map((n) => n.querySelector('.flow__unit')?.textContent);
    expect(units).toEqual(['kWp', 'кВт', 'кВт·год', 'кВт', 'складові']);
    // SSR показує кінцеве число (без JS — одразу), «10,24» — українським форматом.
    expect(nodes[2].querySelector('.flow__num')?.textContent?.replace(/\s+/g, ' ')).toContain('10,24');
    for (const n of nodes) expect(n.querySelector('.flow__price')?.textContent).toMatch(/₴/);
    expect(nodes[4].querySelector('.flow__price')?.textContent).toContain('демо');
  });
});

describe('SPEC-006/AC-37 міні-галереї «Обʼєкти» (D-061)', () => {
  test('3 картки × 10 кадрів у HTML, кожен — <picture> з AVIF і міткою; 30 ключів у CREDITS.md', () => {
    const cards = [...doc().querySelectorAll('[data-home-block="cases"] [data-case]')];
    expect(cards.map((c) => c.getAttribute('data-case'))).toEqual(['parking', 'home', 'biz']);
    const credits = readFileSync(new URL('../../public/img/CREDITS.md', import.meta.url), 'utf8');
    for (const card of cards) {
      const group = card.getAttribute('data-case');
      const pics = [...card.querySelectorAll('picture[data-photo]')];
      expect(pics.map((p) => p.getAttribute('data-photo'))).toEqual(Array.from({ length: 10 }, (_, i) => `case-${group}-${i + 1}`));
      for (const pic of pics) {
        expect(pic.querySelector('source[type="image/avif"]')).not.toBeNull();
        expect(pic.querySelector('img')?.getAttribute('alt')).toMatch(/ілюстрація/);
        expect(credits).toContain(`case-${group}-${pic.getAttribute('data-photo')!.split('-')[2]}-*`);
      }
      expect(card.querySelectorAll('.photo-note').length).toBe(10);
    }
  });
});
