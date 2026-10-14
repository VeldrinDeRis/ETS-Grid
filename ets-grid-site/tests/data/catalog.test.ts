import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import structure from '../../src/data/structure.json';
import { catalogFileSchema, structureSchema } from '../../src/lib/schema';

describe('SPEC-001/AC-07 цілісність даних', () => {
  test('catalog.json проходить схему', () => {
    const r = catalogFileSchema.safeParse(catalog);
    expect(r.success, r.success ? '' : JSON.stringify(r.error.issues, null, 2)).toBe(true);
  });

  test('structure.json проходить схему', () => {
    const r = structureSchema.safeParse(structure);
    expect(r.success, r.success ? '' : JSON.stringify(r.error.issues, null, 2)).toBe(true);
  });

  test('slug товарів і систем унікальні', () => {
    const slugs = catalog.products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const systems = catalog.systems.map((s) => s.slug);
    expect(new Set(systems).size).toBe(systems.length);
  });

  const productSlugs = new Set(catalog.products.map((p) => p.slug));

  test('cross_level веде на існуючі товари', () => {
    const broken = catalog.products.flatMap((p) =>
      p.cross_level.filter((s) => !productSlugs.has(s)).map((s) => `${p.slug} → ${s}`),
    );
    expect(broken).toEqual([]);
  });

  test('склад готових систем веде на існуючі товари', () => {
    const broken = catalog.systems.flatMap((s) =>
      s.items.filter((i) => !productSlugs.has(i)).map((i) => `${s.slug} → ${i}`),
    );
    expect(broken).toEqual([]);
  });

  test('рівні structure.json збігаються з рівнями каталогу', () => {
    expect(structure.levels.map(({ id, key, slug, name }) => ({ id, key, slug, name }))).toEqual(catalog.levels);
  });

  test('level і category кожного товару є в structure.json', () => {
    const levelKeyById = new Map(structure.levels.map((l) => [l.id, l.key]));
    const categories = new Set(structure.categories.map((c) => `${c.level}/${c.slug}`));
    const broken = catalog.products
      .filter((p) => !categories.has(`${levelKeyById.get(p.level)}/${p.category}`))
      .map((p) => `${p.slug}: ${p.level}/${p.category}`);
    expect(broken).toEqual([]);
  });

  test('категорії: slug унікальні в межах рівня, рівень існує', () => {
    const levelKeys = new Set(structure.levels.map((l) => l.key));
    const keys = structure.categories.map((c) => `${c.level}/${c.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(structure.categories.filter((c) => !levelKeys.has(c.level))).toEqual([]);
  });

  test('featured рівня — існуючий товар цього рівня або null', () => {
    const broken = structure.levels
      .filter((l) => l.featured !== null)
      .filter((l) => {
        const p = catalog.products.find((x) => x.slug === l.featured);
        return !p || p.level !== l.id;
      })
      .map((l) => `${l.key} → ${l.featured}`);
    expect(broken).toEqual([]);
  });
});
