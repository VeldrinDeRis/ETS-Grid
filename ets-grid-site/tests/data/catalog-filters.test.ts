import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import carsJson from '../../src/data/cars.json';
import filtersJson from '../../src/data/filters.json';
import levelContent from '../../src/data/level-content.json';
import structure from '../../src/data/structure.json';
import { applyFilters, resolveFacets, type Car, type FiltersFile } from '../../src/lib/filters';
import { carSchema, filtersFileSchema } from '../../src/lib/filters/schema';
import { levelContentSchema } from '../../src/lib/level-content';
import type { Product } from '../../src/lib/schema';

const filters = filtersJson as unknown as FiltersFile;
const cars = carsJson as Car[];
const products = catalog.products.map((p) => ({ docs: [], related: [], ...p })) as unknown as Product[];
const levelId = new Map(structure.levels.map((l) => [l.key, l.id]));

describe('SPEC-002/AC-10 filters.json', () => {
  test('проходить схему', () => {
    const r = filtersFileSchema.safeParse(filtersJson);
    expect(r.success, r.success ? '' : JSON.stringify(r.error.issues, null, 2)).toBe(true);
  });

  test('ключі фасетів унікальні в межах рівня', () => {
    for (const level of Object.values(filters.levels)) {
      const keys = [level.primary.key, ...level.facets.map((f) => f.key)];
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  test('type кожного товару є серед значень головного фільтра його рівня', () => {
    const broken = products.filter((p) => {
      const key = structure.levels.find((l) => l.id === p.level)!.key as keyof FiltersFile['levels'];
      const values = filters.levels[key].primary.values;
      return !Array.isArray(values) || !values.some(([v]) => v === p.type);
    });
    expect(broken.map((p) => `${p.slug}: ${p.type}`)).toEqual([]);
  });

  test('адаптер має тип cable (Q-3, D-027)', () => {
    expect(products.find((p) => p.slug === 'cable-gbt-type2')?.type).toBe('cable');
  });
});

describe('SPEC-002/AC-11 ЧПУ-сторінки дають непорожню видачу', () => {
  test.each(filters.presets.map((p) => [`${p.category}/${p.slug}`, p] as const))('%s', (_name, preset) => {
    const list = products.filter((p) => p.level === levelId.get(preset.level) && p.category === preset.category);
    const facets = resolveFacets(filters.levels[preset.level], list, { cars });
    for (const [key, tokens] of Object.entries(preset.filters)) {
      const facet = facets.find((f) => f.key === key);
      expect(facet, `немає фасету ${key}`).toBeDefined();
      for (const t of tokens) expect(facet!.values.map((v) => v.token)).toContain(t);
    }
    expect(applyFilters(list, { filters: preset.filters, sort: null }, facets, { cars }).length).toBeGreaterThan(0);
  });

  test('категорії пресетів існують у structure.json', () => {
    for (const p of filters.presets) {
      expect(structure.categories.some((c) => c.level === p.level && c.slug === p.category)).toBe(true);
    }
  });
});

describe('SPEC-002/AC-12 cars.json', () => {
  test('10–15 записів, кожна проходить схему і має джерело', () => {
    expect(cars.length).toBeGreaterThanOrEqual(10);
    expect(cars.length).toBeLessThanOrEqual(15);
    for (const car of cars) {
      const r = carSchema.safeParse(car);
      expect(r.success, `${car.id}: ${r.success ? '' : JSON.stringify(r.error.issues)}`).toBe(true);
      expect(car.source).toMatch(/^https:\/\//);
    }
  });

  test('розʼєми — із значень фасету connectors', () => {
    const allowed = new Set((filters.levels.charging.facets.find((f) => f.key === 'connectors')!.values as [string, string][]).map(([v]) => v));
    for (const car of cars) {
      for (const c of [car.ac_connector, car.dc_connector]) if (c !== null) expect(allowed.has(c)).toBe(true);
    }
  });

  test('id унікальні', () => {
    expect(new Set(cars.map((c) => c.id)).size).toBe(cars.length);
  });
});

describe('SPEC-002/AC-13 level-content.json', () => {
  test('проходить схему: 3 рівні, 5–7 пунктів «Як обрати», FAQ', () => {
    const r = levelContentSchema.safeParse(levelContent);
    expect(r.success, r.success ? '' : JSON.stringify(r.error.issues, null, 2)).toBe(true);
    expect(Object.keys(levelContent).sort()).toEqual(['battery', 'charging', 'solar']);
  });

  test('у текстах немає чисел, яких немає в каталозі, ТЗ чи формулах 03 (білий список)', () => {
    // Дозволені числа: з каталогу (потужності, входи, ємності), ТЗ §5 і §9 (діапазони категорій), 03 §3 (коефіцієнти).
    const allowed = new Set([
      '1', '2', '3', '4', '5', '6', '7', '10', '11', '20', '22', '24', '30', '50', '60', '65', '80', '90', '95', '120', '130', '215', '240', '255',
      '3,7', '7,4', '10,24', '1150', '550', '2,6', '0,9', '0,95', '450', '650', '48',
    ]);
    const texts = JSON.stringify(levelContent);
    const numbers = [...texts.matchAll(/\d+(?:,\d+)?/g)].map((m) => m[0]);
    expect([...new Set(numbers.filter((n) => !allowed.has(n)))]).toEqual([]);
  });
});
