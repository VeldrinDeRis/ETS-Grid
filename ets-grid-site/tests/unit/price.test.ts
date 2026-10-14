import { describe, expect, test } from 'vitest';
import { priceView } from '../../src/lib/price';
import { bessNoPrice, dcQuote, homeAc, portable, realPrice } from '../fixtures/products';

const NBSP = ' ';

describe('SPEC-001/AC-09 правила показу ціни', () => {
  test('обладнання + монтаж: дві строки і «демо-ціна»', () => {
    expect(priceView(homeAc)).toEqual({
      primary: `24${NBSP}900${NBSP}₴`,
      secondary: `з монтажем від 32${NBSP}900${NBSP}₴`,
      demo: true,
      onRequest: false,
    });
  });

  test('тільки обладнання: без строки монтажу', () => {
    expect(priceView(portable)).toEqual({
      primary: `11${NBSP}900${NBSP}₴`,
      secondary: null,
      demo: true,
      onRequest: false,
    });
  });

  test('тільки під ключ', () => {
    expect(priceView(dcQuote)).toEqual({
      primary: `під ключ від 780${NBSP}000${NBSP}₴`,
      secondary: null,
      demo: true,
      onRequest: false,
    });
  });

  test('без цін: «Ціна за розрахунком» і без «демо-ціна»', () => {
    expect(priceView(bessNoPrice)).toEqual({
      primary: 'Ціна за розрахунком',
      secondary: null,
      demo: false,
      onRequest: true,
    });
  });

  test('реальна ціна: без «демо-ціна»', () => {
    expect(priceView(realPrice).demo).toBe(false);
  });
});
