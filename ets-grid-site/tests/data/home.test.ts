import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import homeJson from '../../src/data/home-content.json';
import { homeContentSchema } from '../../src/lib/home';

const slugs = new Set(catalog.products.map((p) => p.slug));

describe('SPEC-006/AC-01 home-content.json', () => {
  test('проходить схему (H1 ≤ 8 слів, active існує)', () => {
    const r = homeContentSchema.safeParse(homeJson);
    expect(r.success, r.success ? '' : JSON.stringify(r.error.issues, null, 2)).toBe(true);
  });

  test('усі slug — існуючі товари', () => {
    const used = [...homeJson.hits, ...homeJson.hero.variants.map((v) => v.anchor_product)];
    expect(used.filter((s) => !slugs.has(s))).toEqual([]);
  });

  test('основний варіант — B (вибір Дмитрія, D-030)', () => {
    expect(homeJson.hero.active).toBe('b');
  });

  test('вкладки: Бізнес → Дім → АЗС (D-004)', () => {
    expect(homeJson.tabs.map((t) => t.segment)).toEqual(['business', 'home', 'highway']);
  });
});

describe('SPEC-006/AC-03 жодних вигаданих фактів про компанію', () => {
  test('довіра, строки й умови фінансування — лише з плейсхолдерами', () => {
    const facts = [...homeJson.trust, ...homeJson.steps.map((s) => s.term), ...homeJson.financing.items.slice(0, 2), homeJson.financing.checked];
    expect(facts.filter((f) => !/\[[^\]]+\]/.test(f))).toEqual([]);
  });

  test('у текстах немає відсотків і термінів цифрами (0 %, 20–30 %, «за 7 днів»)', () => {
    const texts = JSON.stringify({ ...homeJson, _note: '' });
    expect(texts).not.toMatch(/\d+\s*%|за\s+\d+\s+дн/);
  });
});
