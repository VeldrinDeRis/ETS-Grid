import { describe, expect, test } from 'vitest';
import { cardBadge, keyChars } from '../../src/lib/filters';
import { filters, products } from '../fixtures/catalog';

const p = (slug: string) => products.find((x) => x.slug === slug)!;
const NBSP = ' ';

describe('SPEC-002/AC-16 бейдж і характеристики картки', () => {
  test.each([
    ['ets-dc-120-battery', 'З накопичувачем'],
    ['ets-home-11-gbt', 'GB/T'],
    ['ets-dc-60', 'GB/T'],
    ['ets-home-7', 'Для дому'],
    ['ets-bess-100', 'Зрізання піків'],
  ])('бейдж %s → %s', (slug, badge) => {
    expect(cardBadge(p(slug), filters.labels)).toBe(badge);
  });

  test.each([
    ['ets-home-7', [`7,4${NBSP}кВт`, 'Type 2', '1 фаза']],
    ['ets-dc-60', [`60${NBSP}кВт`, 'CCS2 · GB/T DC', `вхід від 65${NBSP}кВт`]],
    ['panel-550-topcon', [`550${NBSP}Вт`, `ККД 22,5${NBSP}%`, 'TOPCon']],
    ['inverter-hybrid-10', [`10${NBSP}кВт`, '3 фази', 'Гібридний']],
    ['ets-solar-home-5', [`5${NBSP}kWp`, 'Для дому', 'Без батареї']],
    ['ets-battery-home-10', [`10,24${NBSP}кВт·год`, 'Низьковольтна', 'LFP']],
    ['carport-commercial-8', [`8${NBSP}місць`, `26${NBSP}kWp`, 'AC-зарядки, накопичувач']],
  ])('характеристики %s', (slug, chars) => {
    expect(keyChars(p(slug))).toEqual(chars);
  });

  test('плейсхолдери не виводяться: ємність DC-120 Battery', () => {
    expect(keyChars(p('ets-dc-120-battery')).join(' ')).not.toMatch(/\[/);
  });

  test('не більше 3 характеристик', () => {
    for (const product of products) expect(keyChars(product).length).toBeLessThanOrEqual(3);
  });
});
