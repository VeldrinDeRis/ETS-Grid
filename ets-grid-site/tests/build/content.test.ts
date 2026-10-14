import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import contentJson from '../../src/data/content-pages.json';
import levelContent from '../../src/data/level-content.json';
import { routes } from '../../src/lib/routes';
import { page } from '../helpers/dist';

const main = (url: string) => page(url).document.querySelector('main')!;
const blocks = (url: string) => [...main(url).querySelectorAll('[data-content-block]')].map((el) => el.getAttribute('data-content-block'));

const DOCS = ['oferta', 'polityka-konfidentsiinosti', 'polityka-cookies', 'harantiya-ta-povernennya'];

const PAGES: [string, string[]][] = [
  [routes.systems, ['systems-list']],
  ...catalog.systems.map((s) => [routes.system(s.slug), ['result', 'price', 'cta', 'scheme', 'items']] as [string, string[]]),
  [routes.services, ['services-list']],
  [routes.service('dostavka'), ['sections']],
  [routes.service('montazh'), ['packages', 'sections']],
  [routes.service('proekt-tekhumovy'), ['sections']],
  [routes.service('servis'), ['sections']],
  [routes.financing, ['checked', 'navigator', 'programs']],
  [routes.cases, ['plate', 'case-template']],
  [routes.about, ['what-we-do']],
  [routes.contacts, ['contacts', 'map', 'form']],
  ...DOCS.map((slug) => [routes.document(slug), ['edition', 'document-body']] as [string, string[]]),
  [routes.guide, ['articles']],
  [routes.guideArticle('yak-obraty-zaryadnu-stantsiyu'), ['intro', 'how-to-choose', 'picker', 'faq', 'related']],
  ['/404.html', ['search', 'levels']],
];

describe('SPEC-007/AC-02 кожна сторінка має свої блоки', () => {
  test.each(PAGES)('%s', (url, expected) => {
    const found = blocks(url);
    for (const b of expected) expect(found, `${url}: ${b}`).toContain(b);
    expect(page(url).html).not.toContain('Сторінка в роботі');
  });

  test('монтаж — таблиця пакетів з <th scope>, ціни — плейсхолдери', () => {
    const table = main(routes.service('montazh')).querySelector('table')!;
    expect(table.querySelectorAll('thead th[scope="col"]')).toHaveLength(3);
    const rows = [...table.querySelectorAll('tbody tr')];
    expect(rows).toHaveLength(contentJson.services.pages.montazh.packages!.length);
    for (const r of rows) expect(r.querySelector('td:last-child .placeholder')?.textContent).toBe('[ЦІНА]');
  });

  test('документи: «Текст надає замовник», [ТЕКСТ ДОКУМЕНТА], [ДАТА]', () => {
    const text = main(routes.document('oferta')).textContent!;
    expect(text).toContain('Текст документа надає замовник');
    expect(text).toContain('[ТЕКСТ ДОКУМЕНТА]');
    expect(text).toContain('Редакція від [ДАТА]');
  });
});

describe('SPEC-007/AC-03 сторінки готових систем', () => {
  test.each(catalog.systems.map((s) => [s.slug, s] as const))('%s: склад, ціна, CTA', (slug, system) => {
    const m = main(routes.system(slug));
    const cards = [...m.querySelectorAll('[data-content-block="items"] [data-product-card]')].map((c) => c.getAttribute('data-slug'));
    expect(cards).toEqual(system.items);
    const scheme = [...m.querySelectorAll('[data-content-block="scheme"] ol a')].map((a) => a.getAttribute('href'));
    // напрям енергії: СЕС (2) → навіс (4) → батарея (3) → зарядка (1)
    const flow = [2, 4, 3, 1];
    const levelOf = (slug: string) => catalog.products.find((p) => p.slug === slug)!.level;
    const expected = [...system.items].sort((a, b) => flow.indexOf(levelOf(a)) - flow.indexOf(levelOf(b)));
    expect(scheme).toEqual(expected.map((s) => routes.product(s)));
    const priced = system.items.every((s) => {
      const p = catalog.products.find((x) => x.slug === s)!;
      return (p.price_turnkey_from ?? p.price_equipment) !== null;
    });
    const price = m.querySelector('[data-content-block="price"]')!.textContent!.trim();
    expect(price).toMatch(priced ? /^від .+ під ключ/ : /Ціна за розрахунком/);
    expect(m.querySelector('[data-content-block="cta"]')?.getAttribute('href')).toBe(routes.quoteWith({ picker: 'system', system: slug }));
  });
});

describe('SPEC-007/AC-04 «Обʼєкти» і «Про компанію» без вигаданих фактів', () => {
  test.each([routes.cases, routes.about])('%s: цифр поза плейсхолдерами немає', (url) => {
    const m = main(url).cloneNode(true) as Element;
    for (const ph of m.querySelectorAll('.placeholder')) ph.remove();
    expect(m.textContent!.match(/\d+/g)).toBeNull();
  });

  test('/obiekty/: плашка і порожній макет картки кейса', () => {
    const m = main(routes.cases);
    expect(m.textContent).toContain('Тут будуть реальні обʼєкти ETS GRID');
    expect(m.querySelectorAll('[data-content-block="case-template"] .placeholder').length).toBeGreaterThanOrEqual(5);
  });
});

describe('SPEC-007/AC-05 стаття гіда', () => {
  const url = routes.guideArticle('yak-obraty-zaryadnu-stantsiyu');

  test('зібрана з level-content.json рівня «Зарядні станції»', () => {
    const m = main(url);
    expect(m.querySelector('[data-content-block="intro"]')?.textContent).toBe(levelContent.charging.value);
    expect([...m.querySelectorAll('[data-content-block="how-to-choose"] li')].map((li) => li.textContent)).toEqual(levelContent.charging.how_to_choose);
    expect(m.querySelectorAll('[data-content-block="faq"] details')).toHaveLength(levelContent.charging.faq.length);
    expect(m.querySelector('[data-content-block="picker"] a')?.getAttribute('href')).toMatch(/^\/zaryadni-stantsii\//);
  });

  test('у тексті статті немає чисел поза білим списком SPEC-002 AC-13', () => {
    const allowed = new Set([
      '1', '2', '3', '4', '5', '6', '7', '10', '11', '20', '22', '24', '30', '50', '60', '65', '80', '90', '95', '120', '130', '215', '240', '255',
      '3,7', '7,4', '10,24', '1150', '550', '2,6', '0,9', '0,95', '450', '650', '48',
    ]);
    const article = main(url).querySelector('article')!.textContent!;
    const numbers = [...article.matchAll(/\d+(?:,\d+)?/g)].map((m) => m[0]);
    expect([...new Set(numbers.filter((n) => !allowed.has(n)))]).toEqual([]);
  });

  test('гід є в підвалі', () => {
    expect(page('/').document.querySelector(`footer a[href="${routes.guide}"]`)).not.toBeNull();
  });
});

describe('SPEC-007/AC-06 навігатор фінансування без JS', () => {
  test('питання — fieldset з legend і js-only; список програм повний', () => {
    const m = main(routes.financing);
    const nav = m.querySelector('[data-financing-nav]')!;
    expect(nav.classList.contains('js-only')).toBe(true);
    expect(nav.querySelectorAll('fieldset > legend')).toHaveLength(3);
    const items = [...m.querySelectorAll('[data-program]')];
    expect(items).toHaveLength(contentJson.financing.programs.length);
    expect(items.every((i) => !i.hasAttribute('hidden'))).toBe(true);
  });
});
