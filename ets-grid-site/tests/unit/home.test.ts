import { describe, expect, test } from 'vitest';
import snapshot from '../fixtures/catalog-snapshot.json';
import { levelFromPrice, systemPrice } from '../../src/lib/home';
import type { System } from '../../src/lib/schema';
import { byLevel, products } from '../fixtures/catalog';

const NBSP = ' ';
const systems = snapshot.systems as System[];
const sys = (slug: string) => systems.find((s) => s.slug === slug)!;

describe('SPEC-006/AC-02 ціна готової системи', () => {
  test('«Дім без відключень»: інвертор 68 000 + батарея під ключ 129 000 = 197 000, демо', () => {
    expect(systemPrice(sys('dim-bez-vidklyuchen'), products)).toEqual({ text: `від 197${NBSP}000${NBSP}₴ під ключ`, demo: true, total: 197000 });
  });

  test('«Дім + авто»: 32 900 + 185 000 + 129 000 = 346 900', () => {
    expect(systemPrice(sys('dim-plus-avto'), products).total).toBe(346900);
  });

  test('«Паркінг, що заробляє» і «АЗС на слабкому вводі» — за розрахунком', () => {
    for (const slug of ['parking-shcho-zaroblyaye', 'azs-na-slabkomu-vvodi']) {
      expect(systemPrice(sys(slug), products)).toEqual({ text: 'Ціна за розрахунком', demo: false, total: null });
    }
  });

  test('2 системи з ціною і 2 за розрахунком', () => {
    const priced = systems.filter((s) => systemPrice(s, products).total !== null);
    expect(priced).toHaveLength(2);
  });
});

describe('SPEC-006 «від … ₴» плиток рівнів', () => {
  test('зарядки — від 11 900 ₴ (адаптер не враховується)', () => {
    expect(levelFromPrice(byLevel(1))).toBe(`від 11${NBSP}900${NBSP}₴`);
  });

  test('Carport без цін — «Ціна за розрахунком»', () => {
    expect(levelFromPrice(byLevel(4))).toBe('Ціна за розрахунком');
  });
});
