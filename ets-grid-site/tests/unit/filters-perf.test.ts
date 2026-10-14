import { describe, expect, test } from 'vitest';
import { applyFilters, facetCounts, resolveFacets, type FilterState } from '../../src/lib/filters';
import type { Product } from '../../src/lib/schema';
import { cars, charging, filters } from '../fixtures/catalog';

// 500 згенерованих товарів на основі станцій зі знімка (ТЗ §9.1 п. 6: ≤ 200 мс на 500 SKU).
const generated: Product[] = Array.from({ length: 500 }, (_, i) => {
  const base = charging[i % charging.length];
  return {
    ...base,
    slug: `${base.slug}-${i}`,
    price_equipment: base.price_equipment === null ? null : base.price_equipment + (i % 37) * 100,
    attrs: { ...base.attrs, power_kw: [3.7, 7.4, 11, 22, 60, 120, 240][i % 7] },
  };
});

describe('SPEC-002/AC-08 швидкодія', () => {
  test('applyFilters + facetCounts на 500 товарах з 3 фасетами ≤ 200 мс', () => {
    const ctx = { cars };
    const facets = resolveFacets(filters.levels.charging, generated, ctx);
    const state: FilterState = {
      filters: { type: ['wall_ac', 'dc'], connectors: ['type2', 'ccs2'], power_kw: ['11-22', '60-160'] },
      sort: null,
    };
    const start = performance.now();
    applyFilters(generated, state, facets, ctx);
    facetCounts(generated, state, facets, ctx);
    const ms = performance.now() - start;
    expect(ms).toBeLessThanOrEqual(200);
  });
});
