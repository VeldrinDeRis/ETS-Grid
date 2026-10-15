import { describe, expect, test } from 'vitest';
import framesJson from '../../src/data/product-frames.json';
import { FRAME_SETS, PHOTOS, PRODUCT_FRAME_SET, PRODUCT_ILLUSTRATION, productFrames } from '../../src/lib/photos';
import { products } from '../fixtures/catalog';

describe('SPEC-002/AC-41 набори кадрів міні-галерей (ревізія 6, D-065)', () => {
  test('кожен ключ набору є в PHOTOS, у наборі без повторів, усі кадри 1:1', () => {
    for (const [set, keys] of Object.entries(FRAME_SETS)) {
      expect(new Set(keys).size, set).toBe(keys.length);
      for (const key of keys) {
        expect(PHOTOS[key], `${set}: ${key}`).toBeDefined();
        expect(PHOTOS[key].ratio, key).toBe(1);
        expect(PHOTOS[key].alt, key).toMatch(/\(ілюстрація\)$/);
      }
    }
  });

  test('у кожного товару каталогу є набір; productFrames дає рівно 5 різних ключів', () => {
    for (const p of products) {
      expect(PRODUCT_FRAME_SET[p.slug], p.slug).toBeDefined();
      const list = productFrames(p.slug);
      expect(list, p.slug).toHaveLength(5);
      expect(new Set(list).size, p.slug).toBe(5);
      for (const key of list) expect(PHOTOS[key], `${p.slug}: ${key}`).toBeDefined();
    }
  });

  test('перший кадр — ілюстрація товару, якщо вона є; без ілюстрації — набір цілком', () => {
    for (const p of products) {
      const first = PRODUCT_ILLUSTRATION[p.slug];
      const list = productFrames(p.slug);
      if (first) expect(list[0], p.slug).toBe(first);
      else expect(list, p.slug).toEqual(FRAME_SETS[PRODUCT_FRAME_SET[p.slug]].slice(0, 5));
    }
    expect(productFrames('carport-private-2')[0]).toBe('p-carport');
    expect(productFrames('carport-hub-20')[0]).toBe('p-carport-below');
    expect(productFrames('ets-portable-7')).toHaveLength(5);
  });

  test('невідомий товар — порожній список, вхідні дані не змінюються', () => {
    expect(productFrames('no-such-product')).toEqual([]);
    const before = JSON.stringify(FRAME_SETS);
    productFrames('ets-home-7');
    expect(JSON.stringify(FRAME_SETS)).toBe(before);
  });

  test('product-frames.json: у кожного нового кадру id, автор, slug і alt; id унікальні', () => {
    const ids: number[] = [];
    for (const [set, s] of Object.entries(framesJson.sets)) {
      for (const f of s.frames) {
        expect(f.id, set).toBeGreaterThan(0);
        expect(f.author.trim().length, `${set} ${f.id}`).toBeGreaterThan(0);
        expect(f.slug, `${set} ${f.id}`).toMatch(/^[a-z0-9-]+$/);
        expect(f.alt, `${set} ${f.id}`).toMatch(/\(ілюстрація\)$/);
        ids.push(f.id);
      }
      for (const k of s.reuse) expect(k, set).toMatch(/^case-(parking|home|biz)-\d+$/);
    }
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(46);
  });
});
