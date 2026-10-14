import { describe, expect, test } from 'vitest';
import { applyFilters, facetCounts, resolveFacets, visibleFacets } from '../../src/lib/filters';
import { byLevel, filters, slugs } from '../fixtures/catalog';

const batteries = byLevel(3);
const facets = resolveFacets(filters.levels.battery, batteries);

describe('SPEC-004/AC-06 фасет «Час автономії»', () => {
  test('фасет видимий на рівні батарей, підписи діапазонів у годинах', () => {
    const facet = visibleFacets(batteries, facets).find((f) => f.key === 'autonomy_h');
    expect(facet).toBeDefined();
    expect(facet!.values.map((v) => v.label)).toEqual(['до 12 год', '12–24 год', '24–48 год', 'від 48 год']);
  });

  test('домашня батарея — 24–48 год, BESS — від 48', () => {
    expect(slugs(applyFilters(batteries, { filters: { autonomy_h: ['24-48'] }, sort: null }, facets))).toEqual(['ets-battery-home-10']);
    expect(slugs(applyFilters(batteries, { filters: { autonomy_h: ['48-'] }, sort: null }, facets)).sort()).toEqual(['ets-bess-100', 'ets-bess-215']);
    expect(facetCounts(batteries, { filters: {}, sort: null }, facets).autonomy_h).toEqual({ '0-12': 0, '12-24': 0, '24-48': 1, '48-': 2 });
  });

  test('у зарядок фасету немає', () => {
    expect(filters.levels.charging.facets.some((f) => f.key === 'autonomy_h')).toBe(false);
  });
});
