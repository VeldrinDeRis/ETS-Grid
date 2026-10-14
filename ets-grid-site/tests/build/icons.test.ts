import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { PROJECT, pages } from '../helpers/dist';

describe('SPEC-010/AC-07 іконки: один набір, обводка 1,5–2, доступність', () => {
  test('компонент Icon — одна обводка в межах 1,5–2 і закруглені кінці', () => {
    const src = readFileSync(join(PROJECT, 'src', 'components', 'layout', 'Icon.astro'), 'utf8');
    const widths = [...src.matchAll(/stroke-width="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(widths).toEqual([1.75]);
    expect(src).toContain('stroke-linecap="round"');
  });

  test.each(pages().map((p) => [p.url, p] as const))('%s: кожен svg — aria-hidden або з підписом', (_url, p) => {
    for (const svg of p.document.querySelectorAll('svg')) {
      const hidden = svg.getAttribute('aria-hidden') === 'true';
      const labelled = svg.getAttribute('role') === 'img' && (svg.getAttribute('aria-label') || svg.querySelector('title'));
      expect(hidden || Boolean(labelled), svg.outerHTML.slice(0, 120)).toBe(true);
      const sw = svg.getAttribute('stroke-width');
      if (svg.classList.contains('icon') && sw) expect(Number(sw)).toBeGreaterThanOrEqual(1.5);
      if (svg.classList.contains('icon') && sw) expect(Number(sw)).toBeLessThanOrEqual(2);
    }
  });
});
