import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { TYPE_ICON } from '../../src/lib/filters/icons';
import { ICON_PATHS } from '../../src/lib/icons';
import { filters } from '../fixtures/catalog';

const ICON_ASTRO = new URL('../../src/components/layout/Icon.astro', import.meta.url);

describe('SPEC-002/AC-34 іконки головного фільтра (ревізія 5)', () => {
  test('у кожного значення primary кожного рівня є іконка, і вона є в наборі', () => {
    for (const [level, cfg] of Object.entries(filters.levels)) {
      const icons = TYPE_ICON[level as keyof typeof TYPE_ICON];
      expect(icons, level).toBeDefined();
      for (const [token] of cfg.primary.values) {
        const name = icons[token];
        expect(name, `${level}.${token}`).toBeDefined();
        expect(ICON_PATHS, `${level}.${token} → ${name}`).toHaveProperty(name);
      }
    }
  });

  test('шляхи іконок — один набір: сітка 24, лише path-дані, без порожніх', () => {
    for (const [name, d] of Object.entries(ICON_PATHS)) {
      expect(d.trim().length, name).toBeGreaterThan(0);
      expect(d, name).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9 .,-]+$/);
    }
  });

  test('Icon.astro бере шляхи з того ж набору, без сторонніх наборів і емодзі', () => {
    const src = readFileSync(ICON_ASTRO, 'utf8');
    expect(src).toMatch(/from ['"]\.\.\/\.\.\/lib\/icons['"]/);
    expect(src).not.toMatch(/<img|https?:\/\//);
    expect(src).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
