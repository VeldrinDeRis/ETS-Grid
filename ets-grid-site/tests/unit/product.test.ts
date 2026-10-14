import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import carsJson from '../../src/data/cars.json';
import type { Car } from '../../src/lib/filters';
import { carCompatibility, crossTitle, fullRows, hasToggle, installPrice, keyRows } from '../../src/lib/product';
import { list, push, RECENT_LIMIT } from '../../src/lib/recent';
import { KEYS } from '../../src/lib/storage';
import { products } from '../fixtures/catalog';

const NBSP = ' ';
const p = (slug: string) => products.find((x) => x.slug === slug)!;
const car = (id: string) => (carsJson as Car[]).find((c) => c.id === id)!;
const adapters = products.filter((x) => x.type === 'cable');

describe('SPEC-003/AC-01 сумісність з авто', () => {
  test('ETS Home 7 + Tesla Model 3 EU → підходить, 7,4 кВт', () => {
    expect(carCompatibility(p('ets-home-7'), car('tesla-model-3-lr-awd-2020'), adapters)).toEqual({ status: 'fits', speedKw: 7.4, adapter: null });
  });

  test('ETS Home 7 + ID.4 Crozz CN → потрібен адаптер, 7 кВт', () => {
    expect(carCompatibility(p('ets-home-7'), car('vw-id4-crozz-cn'), adapters)).toEqual({
      status: 'adapter',
      speedKw: 7,
      adapter: 'cable-gbt-type2',
    });
  });

  test('DC-60 + Nissan Leaf 40 (CHAdeMO) → не підходить', () => {
    expect(carCompatibility(p('ets-dc-60'), car('nissan-leaf-40-ze1'), adapters)).toEqual({ status: 'no', speedKw: null, adapter: null });
  });

  test('DC-240 Split + Nissan Leaf 40 → підходить, 46 кВт', () => {
    expect(carCompatibility(p('ets-dc-240-split'), car('nissan-leaf-40-ze1'), adapters)).toEqual({ status: 'fits', speedKw: 46, adapter: null });
  });

  test('Home 11 GB/T + ID.4 Crozz → підходить, 7 кВт (обмеження авто)', () => {
    expect(carCompatibility(p('ets-home-11-gbt'), car('vw-id4-crozz-cn'), adapters)).toMatchObject({ status: 'fits', speedKw: 7 });
  });

  test('невідома потужність авто → швидкість null', () => {
    const noPower = { ...car('tesla-model-3-lr-awd-2020'), ac_max_kw: null };
    expect(carCompatibility(p('ets-home-7'), noPower, adapters)).toMatchObject({ status: 'fits', speedKw: null });
  });
});

describe('SPEC-003/AC-02 ціна монтажу і перемикач', () => {
  test('монтаж = різниця цін', () => {
    expect(installPrice(p('ets-home-7'))).toBe(8000);
    expect(hasToggle(p('ets-home-7'))).toBe(true);
  });

  test('без однієї з цін — перемикача немає', () => {
    expect(installPrice(p('ets-portable-7'))).toBeNull();
    expect(hasToggle(p('ets-portable-7'))).toBe(false);
    expect(hasToggle(p('ets-dc-60'))).toBe(false);
    expect(hasToggle(p('ets-bess-100'))).toBe(false);
  });
});

describe('SPEC-003/AC-04 ключові характеристики (03 §4)', () => {
  const values = (slug: string) => keyRows(p(slug)).map((r) => [r.label, r.value]);

  test('зарядна AC: 6 рядків, фази', () => {
    expect(values('ets-home-7')).toEqual([
      ['Потужність', `7,4${NBSP}кВт`],
      ['Розʼєм', 'Type 2'],
      ['Фази', '1 фаза'],
      ['Кабель', 'Вбудований'],
      ['Захист', 'IP54'],
      ['Керування', 'Wi-Fi / додаток'],
    ]);
  });

  test('зарядна DC: замість фаз — вхід від N кВт', () => {
    expect(values('ets-dc-60')[2]).toEqual(['Вхід від мережі', `65${NBSP}кВт`]);
  });

  test('панель: відсутня гарантія потужності — null (буде [ДАНІ])', () => {
    expect(values('panel-550-topcon')).toEqual([
      ['Потужність', `550${NBSP}Вт`],
      ['ККД', `22,5${NBSP}%`],
      ['Технологія', 'TOPCon'],
      ['Розмір', `2278×1134×30${NBSP}мм`],
      ['Вага', `27${NBSP}кг`],
      ['Гарантія потужності', null],
    ]);
  });

  test('інвертор: Wi-Fi немає в даних — null', () => {
    expect(values('inverter-hybrid-10')).toEqual([
      ['Потужність', `10${NBSP}кВт`],
      ['Фази', '3 фази'],
      ['Тип', 'Гібридний'],
      ['MPPT', '2'],
      ['Сумісні батареї', 'Низьковольтна'],
      ['Wi-Fi', null],
    ]);
  });

  test('батарея: гарантія-плейсхолдер лишається видимою', () => {
    expect(values('ets-battery-home-10')).toEqual([
      ['Ємність', `10,24${NBSP}кВт·год`],
      ['Напруга', 'Низьковольтна (48 В)'],
      ['Хімія', 'LFP'],
      ['Цикли', `6${NBSP}000`],
      ['Масштабування', `до 40${NBSP}кВт·год`],
      ['Гарантія', '[N] років'],
    ]);
  });

  test('Carport: строки монтажу — null', () => {
    expect(values('carport-commercial-8')).toEqual([
      ['Машиномісць', '8'],
      ['Потужність', `26${NBSP}kWp`],
      ['Конструкція', 'Двосторонній'],
      ['Комплектація', 'AC-зарядки, накопичувач'],
      ['Строки монтажу', null],
    ]);
  });

  test('повна таблиця: усі attrs + загальні поля + рядки 03 §4 без даних', () => {
    const rows = fullRows(p('panel-550-topcon'));
    const labels = rows.map((r) => r.label);
    for (const label of ['Потужність', 'ККД', 'Технологія', 'Розмір', 'Вага', 'Бренд', 'Країна', 'Гарантія', 'Гарантія потужності']) {
      expect(labels).toContain(label);
    }
    expect(rows.find((r) => r.label === 'Гарантія потужності')?.value).toBeNull();
    expect(new Set(labels).size).toBe(labels.length);
  });

  test('повна таблиця покриває кожен ключ attrs', () => {
    for (const product of products) {
      const rows = fullRows(product);
      expect(rows.filter((r) => r.key).map((r) => r.key).sort()).toEqual(expect.arrayContaining(Object.keys(product.attrs).sort()));
    }
  });
});

describe('SPEC-003/AC-05 заголовок перехресного блоку (ТЗ §5)', () => {
  test.each([
    ['ets-dc-60', 'Додайте накопичувач, якщо мережі не вистачає'],
    ['ets-dc-120-battery', 'Додайте накопичувач, якщо мережі не вистачає'],
    ['ets-battery-home-10', 'Заряджайте від сонця'],
    ['carport-hub-20', 'Додайте зарядні станції'],
    ['ets-home-7', 'Разом працює краще'],
    ['panel-550-topcon', 'Разом працює краще'],
  ])('%s → %s', (slug, title) => {
    expect(crossTitle(p(slug))).toBe(title);
  });
});

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

describe('SPEC-003/AC-10 недавно переглянуті', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  test('нові — на початку, без дублів, не більше 8', () => {
    for (const s of ['a', 'b', 'c']) push(s);
    push('a');
    expect(list()).toEqual(['a', 'c', 'b']);
    for (let i = 0; i < 10; i++) push(`x${i}`);
    expect(list()).toHaveLength(RECENT_LIMIT);
    expect(RECENT_LIMIT).toBe(8);
  });

  test('list(n, exclude)', () => {
    for (const s of ['a', 'b', 'c', 'd', 'e']) push(s);
    expect(list(4, 'e')).toEqual(['d', 'c', 'b', 'a']);
  });

  test('зіпсоване сховище → порожньо', () => {
    localStorage.setItem(KEYS.recent, '{');
    expect(list()).toEqual([]);
  });
});
