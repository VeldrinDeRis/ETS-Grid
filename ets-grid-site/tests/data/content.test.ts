import { describe, expect, test } from 'vitest';
import contentJson from '../../src/data/content-pages.json';
import levelContent from '../../src/data/level-content.json';
import structure from '../../src/data/structure.json';
import { contentPagesSchema } from '../../src/lib/content';

describe('SPEC-007/AC-01 content-pages.json', () => {
  test('проходить схему', () => {
    const r = contentPagesSchema.safeParse(contentJson);
    expect(r.success, r.success ? '' : JSON.stringify(r.error.issues, null, 2)).toBe(true);
  });

  test('усі числа й умови — у плейсхолдерах […]', () => {
    const { _note, ...texts } = contentJson;
    const bare = JSON.stringify(texts).replace(/\[[^\]]*\]/g, '');
    expect(bare.match(/\d+/g)).toBeNull();
  });

  test('схема ловить число поза плейсхолдером', () => {
    const broken = structuredClone(contentJson);
    broken.services.pages.dostavka.lead = 'Доставка за 2 дні';
    expect(contentPagesSchema.safeParse(broken).success).toBe(false);
  });

  test('тексти є для кожної послуги зі structure.json', () => {
    expect(Object.keys(contentJson.services.pages).sort()).toEqual(structure.services.map((s) => s.slug).sort());
  });

  test('статті гіда спираються на наявний текст рівня', () => {
    for (const a of contentJson.guide.articles) expect(Object.keys(levelContent)).toContain(a.level);
  });
});
