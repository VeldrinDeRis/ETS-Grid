import { describe, expect, test } from 'vitest';
import { missingFacets, resolveFacets } from '../../src/lib/filters';
import { byLevel, cars, filters } from '../fixtures/catalog';

const keys = (level: keyof typeof filters.levels, products: ReturnType<typeof byLevel>) =>
  missingFacets(products, resolveFacets(filters.levels[level], products, { cars }), { cars }).map((f) => f.key);

describe('SPEC-002/AC-29 фасети рівня без реальних даних (D-031)', () => {
  test('зарядки: бренд і країна — лише плейсхолдери', () => {
    expect(keys('charging', byLevel(1))).toEqual(['brand', 'country']);
  });

  test('батареї: сумісні інвертори, бренд, гарантія', () => {
    expect(keys('battery', byLevel(3))).toEqual(['inverters', 'brand', 'warranty']);
  });

  test('головний фільтр ніколи не «відсутній»', () => {
    for (const level of ['charging', 'solar', 'battery', 'carport'] as const) {
      const products = byLevel({ charging: 1, solar: 2, battery: 3, carport: 4 }[level]);
      expect(keys(level, products)).not.toContain('type');
    }
  });

  test('фасет, у якого дані в рівні є, не вважається відсутнім', () => {
    expect(keys('solar', byLevel(2))).not.toContain('technology');
    expect(keys('solar', byLevel(2))).not.toContain('inverter_kind');
  });
});
