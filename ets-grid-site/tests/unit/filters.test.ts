import { describe, expect, test } from 'vitest';
import {
  applyFilters,
  facetCounts,
  nearestProducts,
  parseState,
  resolveFacets,
  serializeState,
  sortProducts,
  visibleFacets,
  type FilterState,
} from '../../src/lib/filters';
import { byCategory, byLevel, cars, charging, filters, products, slugs } from '../fixtures/catalog';

const ctx = { cars };
const chargingFacets = resolveFacets(filters.levels.charging, charging, ctx);
const state = (f: FilterState['filters'], sort: FilterState['sort'] = null): FilterState => ({ filters: f, sort });

describe('SPEC-002/AC-01 стан у URL', () => {
  test('круговий прохід зберігає стан', () => {
    const s = state({ type: ['wall_ac', 'dc'], power_kw: ['60-160'], connectors: ['type2'], price: ['20000-35000'] }, 'price-asc');
    const q = serializeState(s, chargingFacets);
    expect(parseState(q, chargingFacets)).toEqual(s);
  });

  test('канонічний порядок ключів — порядок фасетів, sort останнім', () => {
    const s = state({ price: ['20000-35000'], connectors: ['type2'], type: ['dc', 'wall_ac'], power_kw: ['60-160'] }, 'price-asc');
    expect(serializeState(s, chargingFacets)).toBe('type=wall_ac,dc&power_kw=60-160&connectors=type2&price=20000-35000&sort=price-asc');
  });

  test('порожній стан → порожній рядок', () => {
    expect(serializeState(state({}), chargingFacets)).toBe('');
  });

  test('невідомі ключі, значення й сортування відкидаються', () => {
    expect(parseState('?type=wall_ac,xyz&foo=1&sort=bad', chargingFacets)).toEqual(state({ type: ['wall_ac'] }));
  });

  test('невалідна ціна відкидається, відкритий діапазон приймається', () => {
    expect(parseState('price=abc', chargingFacets)).toEqual(state({}));
    expect(parseState('price=20000-', chargingFacets)).toEqual(state({ price: ['20000-'] }));
    expect(parseState('price=-35000', chargingFacets)).toEqual(state({ price: ['-35000'] }));
  });

  test('значення з пробілом кодуються і розкодовуються', () => {
    const solar = resolveFacets(filters.levels.solar, byLevel(2), ctx);
    const s = state({ technology: ['Mono PERC'] });
    expect(parseState(serializeState(s, solar), solar)).toEqual(s);
  });
});

describe('SPEC-002/AC-02 applyFilters', () => {
  test('без фільтрів — усі товари', () => {
    expect(applyFilters(charging, state({}), chargingFacets, ctx)).toHaveLength(10);
  });

  test('type=wall_ac → 3', () => {
    expect(applyFilters(charging, state({ type: ['wall_ac'] }), chargingFacets, ctx)).toHaveLength(3);
  });

  test('«АБО» всередині фасета: type=wall_ac,dc → 5', () => {
    expect(applyFilters(charging, state({ type: ['wall_ac', 'dc'] }), chargingFacets, ctx)).toHaveLength(5);
  });

  test('«І» між фасетами, діапазон від < x ≤ до: type=dc & power 60–160 → ets-dc-120', () => {
    const r = applyFilters(charging, state({ type: ['dc'], power_kw: ['60-160'] }), chargingFacets, ctx);
    expect(slugs(r)).toEqual(['ets-dc-120']);
  });

  test('60 кВт входить у 22–60', () => {
    const r = applyFilters(charging, state({ type: ['dc'], power_kw: ['22-60'] }), chargingFacets, ctx);
    expect(slugs(r)).toEqual(['ets-dc-60']);
  });

  test('ціна 20000–35000 → 3 домашні станції', () => {
    const r = applyFilters(charging, state({ price: ['20000-35000'] }), chargingFacets, ctx);
    expect(slugs(r).sort()).toEqual(['ets-home-11-gbt', 'ets-home-22', 'ets-home-7']);
  });

  test('товари без ціни не проходять фільтр ціни', () => {
    const r = applyFilters(charging, state({ price: ['0-'] }), chargingFacets, ctx);
    expect(r.every((p) => (p.price_equipment ?? p.price_turnkey_from) !== null)).toBe(true);
  });

  test('порти «3–4» — діапазон (2, 4]', () => {
    const r = applyFilters(charging, state({ ports: ['2-4'] }), chargingFacets, ctx);
    expect(slugs(r)).toEqual(['ets-dc-240-split']);
  });

  test('поле-масив: connectors=gbt_ac знаходить станцію і адаптер', () => {
    const r = applyFilters(charging, state({ connectors: ['gbt_ac'] }), chargingFacets, ctx);
    expect(slugs(r).sort()).toEqual(['cable-gbt-type2', 'ets-home-11-gbt']);
  });

  test('числові та булеві значення порівнюються як рядки: phases=1', () => {
    const r = applyFilters(charging, state({ phases: ['1'] }), chargingFacets, ctx);
    expect(slugs(r).sort()).toEqual(['ets-home-7', 'ets-portable-7']);
  });

  test('підбір за авто: китайська версія з GB/T', () => {
    const r = applyFilters(charging, state({ car: ['cn-gbt'] }), chargingFacets, ctx);
    expect(slugs(r).sort()).toEqual(['cable-gbt-type2', 'ets-dc-240-split', 'ets-dc-60', 'ets-home-11-gbt']);
  });
});

describe('SPEC-002/AC-03 facetCounts', () => {
  test('без фільтрів: лічильники головного фільтра', () => {
    expect(facetCounts(charging, state({}), chargingFacets, ctx).type).toEqual({
      wall_ac: 3,
      pedestal_ac: 1,
      dc: 2,
      split_dc: 1,
      portable: 1,
      dc_battery: 1,
      cable: 1,
    });
  });

  test('type=wall_ac: розʼєми рахуються з урахуванням типу', () => {
    const c = facetCounts(charging, state({ type: ['wall_ac'] }), chargingFacets, ctx).connectors;
    expect(c.type2).toBe(2);
    expect(c.gbt_ac).toBe(1);
    expect(c.ccs2).toBe(0);
  });

  test('значення вибраного фасета не обнуляють одне одного', () => {
    const c = facetCounts(charging, state({ type: ['wall_ac'] }), chargingFacets, ctx).type;
    expect(c.dc).toBe(2);
    expect(c.wall_ac).toBe(3);
  });

  test('лічильник = товари з іншими фільтрами + це значення', () => {
    const s = state({ type: ['dc', 'split_dc'], connectors: ['chademo'] });
    const c = facetCounts(charging, s, chargingFacets, ctx);
    expect(c.type.split_dc).toBe(1);
    expect(c.type.dc).toBe(0);
    expect(c.connectors.ccs2).toBe(3);
  });
});

describe('SPEC-002/AC-04 visibleFacets', () => {
  test('фасет без даних прихований, плейсхолдери не пропонуються', () => {
    const keys = visibleFacets(charging, chargingFacets, ctx).map((f) => f.key);
    expect(keys).toContain('type');
    expect(keys).toContain('connectors');
    expect(keys).not.toContain('brand');
    expect(keys).not.toContain('country');
  });

  test('у лістингу панелей немає фасету типу інвертора', () => {
    const panels = byCategory(2, 'paneli');
    const facets = resolveFacets(filters.levels.solar, panels, ctx);
    const keys = visibleFacets(panels, facets, ctx).map((f) => f.key);
    expect(keys).toContain('panel_w');
    expect(keys).not.toContain('inverter_kind');
  });

  test('auto-значення без плейсхолдерів', () => {
    const batteries = byLevel(3);
    const chemistry = resolveFacets(filters.levels.battery, batteries, ctx).find((f) => f.key === 'chemistry')!;
    expect(chemistry.values.map((v) => v.token)).toEqual(['LFP']);
    const warranty = resolveFacets(filters.levels.battery, batteries, ctx).find((f) => f.key === 'warranty')!;
    expect(warranty.values).toEqual([]);
  });
});

describe('SPEC-002/AC-05 sortProducts', () => {
  const home = byCategory(1, 'dlya-domu');

  test('Дешевші', () => {
    expect(slugs(sortProducts(home, 'price-asc'))).toEqual(['ets-home-11-gbt', 'ets-home-7', 'ets-home-22']);
  });

  test('Дорожчі; без ціни — в кінці', () => {
    const r = slugs(sortProducts(byLevel(3), 'price-desc'));
    expect(r[0]).toBe('ets-battery-home-10');
    expect(r.slice(1).sort()).toEqual(['ets-bess-100', 'ets-bess-215']);
  });

  test('Потужніші за головною метрикою рівня', () => {
    expect(slugs(sortProducts(byCategory(1, 'dc'), 'power-desc'))).toEqual([
      'ets-dc-240-split',
      'ets-dc-120',
      'ets-dc-120-battery',
      'ets-dc-60',
    ]);
    expect(slugs(sortProducts(byLevel(3), 'power-desc'))).toEqual(['ets-bess-215', 'ets-bess-100', 'ets-battery-home-10']);
  });

  test('Популярні — порядок каталогу, не мутує вхід', () => {
    const before = slugs(home);
    expect(slugs(sortProducts(home, null))).toEqual(before);
    sortProducts(home, 'price-desc');
    expect(slugs(home)).toEqual(before);
  });
});

describe('SPEC-002/AC-06 nearestProducts', () => {
  test('3 товари того ж рівня, не з поточної видачі', () => {
    const r = nearestProducts(products, { level: 2, exclude: [] });
    expect(r).toHaveLength(3);
    expect(r.every((p) => p.level === 2)).toBe(true);
  });

  test('виключає поточну видачу і сортує за близькістю метрики; рівні — за порядком каталогу', () => {
    // відстані до 120: dc-120-battery 0, dc-60 60, home-22 і duo-22 по 98 (home-22 раніше в каталозі)
    const r = nearestProducts(products, { level: 1, exclude: ['ets-dc-120'], metric: 120 });
    expect(slugs(r)).toEqual(['ets-dc-120-battery', 'ets-dc-60', 'ets-home-22']);
  });

  test('рівень з 3 товарами і всі виключені → порожньо', () => {
    expect(nearestProducts(products, { level: 4, exclude: slugs(byLevel(4)) })).toEqual([]);
  });
});
