import { describe, expect, test } from 'vitest';
import { formatNumber, formatPrice, formatUnit } from '../../src/lib/format';

const NBSP = ' ';

describe('SPEC-001/AC-08 форматування чисел, цін і одиниць', () => {
  test.each([
    [24900, `24${NBSP}900`],
    [1290000, `1${NBSP}290${NBSP}000`],
    [7.4, '7,4'],
    [10.24, '10,24'],
    [22, '22'],
  ])('formatNumber(%s)', (n, expected) => {
    expect(formatNumber(n)).toBe(expected);
  });

  test.each([
    [24900, `24${NBSP}900${NBSP}₴`],
    [1290000, `1${NBSP}290${NBSP}000${NBSP}₴`],
  ])('formatPrice(%s)', (n, expected) => {
    expect(formatPrice(n)).toBe(expected);
  });

  test('formatPrice(null) → null', () => {
    expect(formatPrice(null)).toBeNull();
  });

  test.each([
    [7.4, 'кВт', `7,4${NBSP}кВт`],
    [22, 'кВт', `22${NBSP}кВт`],
    [10.24, 'кВт·год', `10,24${NBSP}кВт·год`],
    [550, 'Вт', `550${NBSP}Вт`],
    [26, 'kWp', `26${NBSP}kWp`],
  ] as const)('formatUnit(%s, %s)', (n, unit, expected) => {
    expect(formatUnit(n, unit)).toBe(expected);
  });

  test('кВт·год пишеться через середню крапку U+00B7', () => {
    expect(formatUnit(5, 'кВт·год')).toContain('·');
  });

  test('жодних звичайних або вузьких пробілів у результаті', () => {
    for (const s of [formatNumber(1290000), formatPrice(24900)!, formatUnit(10.24, 'кВт·год')]) {
      expect(s).not.toMatch(/[   ]/);
    }
  });
});
