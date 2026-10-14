import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { distFiles, pages } from '../helpers/dist';
import { paletteBlocks } from '../helpers/tokens';

const css = [
  ...distFiles('.css').map((f) => readFileSync(f, 'utf8')),
  ...pages().flatMap((p) => [...p.document.querySelectorAll('style')].map((s) => s.textContent ?? '')),
].join('\n');

describe('SPEC-001/AC-12 палітра й заборонена естетика', () => {
  test('зібраний CSS знайдено', () => {
    expect(css.length).toBeGreaterThan(1000);
  });

  test('немає #C8F03C, Unbounded, JetBrains Mono', () => {
    expect(css).not.toMatch(/#c8f03c/i);
    expect(css).not.toMatch(/unbounded/i);
    expect(css).not.toMatch(/jetbrains/i);
    const html = pages().map((p) => p.html).join('\n');
    expect(html).not.toMatch(/#c8f03c|unbounded|jetbrains\s*mono/i);
  });

  test('зміна data-palette a → b змінює всі кольорові токени', () => {
    const { a, b } = paletteBlocks(css);
    const names = Object.keys(a);
    expect(names.length).toBeGreaterThanOrEqual(22);
    expect(Object.keys(b).sort()).toEqual(names.sort());
    const same = names.filter((n) => a[n] === b[n]);
    expect(same).toEqual([]);
  });

  test('смислові токени посилаються на палітру, а не на сирі кольори', () => {
    const semantic = [...css.matchAll(/--color-[\w-]+\s*:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(semantic.length).toBeGreaterThan(0);
    expect(semantic.filter((v) => !v.startsWith('var(--day-') && !v.startsWith('var(--night-'))).toEqual([]);
  });

  test('усі сторінки стартують з data-palette="a"', () => {
    for (const p of pages()) expect(p.document.documentElement.getAttribute('data-palette')).toBe('a');
  });
});
