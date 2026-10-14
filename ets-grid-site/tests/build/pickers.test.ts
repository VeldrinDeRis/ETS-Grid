import { describe, expect, test } from 'vitest';
import { page } from '../helpers/dist';

const NBSP = ' ';
const text = (s: string | null | undefined) => (s ?? '').replace(/[ \t\r\n]+/g, ' ').trim();

describe('SPEC-004/AC-09 підбірники і таблиці типових сценаріїв у HTML', () => {
  test.each([
    ['/zaryadni-stantsii/', 'charging', 'pidbir'],
    ['/sonyachni-paneli/', 'solar', 'pidbir'],
    ['/batarei/', 'battery', 'pidbir'],
    ['/solar-carport/', 'carport', 'konfigurator'],
  ])('%s → %s у #%s', (url, kind, anchor) => {
    const doc = page(url).document;
    const section = doc.getElementById(anchor);
    expect(section).not.toBeNull();
    expect(section!.querySelector(`[data-picker-kind="${kind}"] astro-island`)).not.toBeNull();
    const table = section!.querySelector(`table[data-scenarios="${kind}"]`);
    expect(table).not.toBeNull();
    expect(table!.querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(2);
    expect(text(section!.textContent)).toContain('Оцінка орієнтовна. Точний розрахунок — після обстеження.');
  });

  test('таблиця зарядок: 60 кВт при вводі 50 — бракує 15 кВт, накопичувач ≈ 10 кВт·год', () => {
    const row = [...page('/zaryadni-stantsii/').document.querySelectorAll('table[data-scenarios="charging"] tbody tr')].find((r) =>
      r.querySelector('th')?.textContent?.startsWith('60'),
    )!;
    expect(row.querySelectorAll('td')[1].textContent).toBe(`бракує 15${NBSP}кВт: накопичувач ≈ 10${NBSP}кВт·год`);
  });

  test('таблиця батарей: базові потреби ≈ 29 год', () => {
    const cells = page('/batarei/').document.querySelectorAll('table[data-scenarios="battery"] tbody tr')[0].querySelectorAll('td');
    expect(cells[0].textContent).toBe(`300${NBSP}Вт`);
    expect(cells[1].textContent).toBe('≈ 29');
  });

  test('таблиця СЕС: 400 кВт·год → 4,2 kWp, 8 панелей, 20,8 м²', () => {
    const cells = page('/sonyachni-paneli/').document.querySelectorAll('table[data-scenarios="solar"] tbody tr')[1].querySelectorAll('td');
    expect([...cells].slice(0, 3).map((c) => c.textContent)).toEqual([`4,2${NBSP}kWp`, '8', `20,8${NBSP}м²`]);
  });

  test('таблиця Carport: 20 місць → 66 kWp, 120 панелей, 10 портів, 100 кВт·год', () => {
    const cells = page('/solar-carport/').document.querySelectorAll('table[data-scenarios="carport"] tbody tr')[2].querySelectorAll('td');
    expect([...cells].map((c) => c.textContent)).toEqual([`66${NBSP}kWp`, '120', '10', `100${NBSP}кВт·год`]);
  });

  test('«Чи вистачить потужності?» на заглушці головної', () => {
    expect(page('/').document.querySelector('#potuzhnist [data-picker-kind="power"]')).not.toBeNull();
  });
});

describe('SPEC-004/AC-10 лендинг Solar Carport', () => {
  test('блоки §3.4 по порядку', () => {
    const blocks = [...page('/solar-carport/').document.querySelectorAll('[data-carport-block]')].map((b) => b.getAttribute('data-carport-block'));
    expect(blocks).toEqual(['hero', 'functions', 'configurator', 'types', 'catalog', 'stages', 'cases', 'cross', 'form']);
  });

  test('тип «Y-подібний» без товарів веде на форму, решта — на лістинги', () => {
    const links = [...page('/solar-carport/').document.querySelectorAll('[data-carport-block="types"] a')];
    const href = (type: string) => links.find((a) => a.getAttribute('data-type') === type)?.getAttribute('href');
    expect(href('y')).toBe('/kontakty/#rozrakhunok');
    expect(href('single')).toBe('/solar-carport/pryvatnyi/');
    expect(href('double')).toBe('/solar-carport/komertsiinyi/');
    expect(href('row')).toBe('/solar-carport/hab/');
  });

  test('обʼєкти — плашка, етапи — плейсхолдер строків', () => {
    const doc = page('/solar-carport/').document;
    expect(text(doc.querySelector('[data-carport-block="cases"]')?.textContent)).toContain('Тут будуть реальні обʼєкти ETS GRID');
    expect(doc.querySelectorAll('[data-carport-block="stages"] .placeholder')).toHaveLength(5);
  });
});
