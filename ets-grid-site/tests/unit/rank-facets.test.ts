import { describe, expect, test } from 'vitest';
import { facetCounts, intervalBounds, rankFacets, resolveFacets, visibleFacets, type FilterState, type ResolvedFacet } from '../../src/lib/filters';
import { byCategory, byLevel, cars, filters } from '../fixtures/catalog';

const EMPTY: FilterState = { filters: {}, sort: null };

/** Вхід `rankFacets` так, як його збирає острів: видимі фасети, лічильники при порожньому стані, межі інтервалів. */
function input(level: keyof typeof filters.levels, products: ReturnType<typeof byLevel>) {
  const ctx = { cars };
  const facets = visibleFacets(products, resolveFacets(filters.levels[level], products, ctx), ctx);
  const counts = facetCounts(products, EMPTY, facets, ctx);
  const bounds = Object.fromEntries(
    facets
      .filter((f) => f.kind === 'interval')
      .map((f) => [f.key, intervalBounds(products, f)])
      .filter(([, b]) => b !== null),
  ) as Record<string, [number, number]>;
  return { facets, counts, bounds };
}

const keys = (list: ResolvedFacet[]) => list.map((f) => f.key);

describe('SPEC-002/AC-33 rankFacets — фасети за змістом (ревізія 5, H-013)', () => {
  test('/batarei/: розкриті ті, що ділять лістинг; решта згорнуті; порядок конфігу', () => {
    const { facets, counts, bounds } = input('battery', byLevel(3));
    const { open, folded } = rankFacets(facets, counts, EMPTY, bounds);
    expect(keys(open)).toEqual(['capacity_kwh', 'voltage', 'autonomy_h', 'scenarios']);
    expect(keys(folded)).toEqual(['chemistry', 'max_expand_kwh', 'price', 'stock']);
  });

  test('головний фільтр ніколи не потрапляє в ранжування', () => {
    const { facets, counts, bounds } = input('charging', byLevel(1));
    const { open, folded } = rankFacets(facets, counts, EMPTY, bounds);
    expect(keys(open)).not.toContain('type');
    expect(keys(folded)).not.toContain('type');
    expect(open.length + folded.length).toBe(facets.filter((f) => !f.primary).length);
  });

  test('розкритих не більше 4, навіть коли ділять лістинг більше фасетів', () => {
    const { facets, counts, bounds } = input('charging', byLevel(1));
    const splitting = facets.filter((f) => !f.primary && Object.values(counts[f.key] ?? {}).filter((n) => n > 0).length >= 2);
    expect(splitting.length).toBeGreaterThan(4);
    const { open, folded } = rankFacets(facets, counts, EMPTY, bounds);
    expect(open).toHaveLength(4);
    expect(keys(open)).toEqual(keys(splitting).slice(0, 4));
    expect(keys(folded)).toEqual(keys(facets.filter((f) => !f.primary && !open.includes(f))));
  });

  test('фасет із вибраним значенням розкритий, навіть якщо не ділить лістинг і стоїть за межею 4', () => {
    const { facets, counts, bounds } = input('battery', byLevel(3));
    const state: FilterState = { filters: { chemistry: ['lfp'] }, sort: null };
    const { open, folded } = rankFacets(facets, counts, state, bounds);
    expect(keys(open)).toContain('chemistry');
    expect(keys(folded)).not.toContain('chemistry');
    // Порядок конфігу зберігається: хімія стоїть між напругою і сценаріями.
    expect(keys(open)).toEqual(['capacity_kwh', 'voltage', 'chemistry', 'autonomy_h', 'scenarios'].filter((k) => keys(open).includes(k)));
  });

  test('вибрані фасети розкриті всі, розкритих без вибору — у межах ліміту', () => {
    const { facets, counts, bounds } = input('charging', byLevel(1));
    const state: FilterState = { filters: { brand: ['x'], control: ['app'], ip: ['ip54'] }, sort: null };
    const { open } = rankFacets(facets, counts, state, bounds, 2);
    for (const key of ['control', 'ip']) if (facets.some((f) => f.key === key)) expect(keys(open)).toContain(key);
    const unselected = open.filter((f) => !state.filters[f.key]);
    expect(unselected.length).toBeLessThanOrEqual(2);
  });

  test('інтервал розкритий лише коли межі різні', () => {
    const { facets, counts, bounds } = input('charging', byCategory(1, 'dlya-domu'));
    const price = facets.find((f) => f.key === 'price')!;
    expect(bounds.price[0]).toBeLessThan(bounds.price[1]);
    expect(keys(rankFacets([price], counts, EMPTY, bounds).open)).toEqual(['price']);
    expect(keys(rankFacets([price], counts, EMPTY, { price: [1000, 1000] }).folded)).toEqual(['price']);
    expect(keys(rankFacets([price], counts, EMPTY, {}).folded)).toEqual(['price']);
  });

  test('ранжування чисте: той самий вхід — той самий результат, вхідні масиви не змінюються', () => {
    const { facets, counts, bounds } = input('battery', byLevel(3));
    const before = keys(facets);
    const a = rankFacets(facets, counts, EMPTY, bounds);
    const b = rankFacets(facets, counts, EMPTY, bounds);
    expect(keys(a.open)).toEqual(keys(b.open));
    expect(keys(facets)).toEqual(before);
  });
});
