import { describe, expect, test } from 'vitest';
import { contrast } from '../helpers/contrast';
import { readPalettes } from '../helpers/tokens';

// Пари «текст / фон» і пороги WCAG AA (SPEC-001 §5).
const TEXT = 4.5;
const UI = 3;

const PAIRS: [fg: string, bg: string, min: number][] = [
  ['ink', 'bg', TEXT],
  ['ink', 'surface', TEXT],
  ['ink-muted', 'bg', TEXT],
  ['ink-muted', 'surface', TEXT],
  ['on-accent', 'accent', TEXT],
  ['status-ok', 'bg', TEXT],
  ['status-ok', 'surface', TEXT],
  ['status-wait', 'bg', TEXT],
  ['status-wait', 'surface', TEXT],
  ['placeholder', 'bg', TEXT],
  ['placeholder', 'surface', TEXT],
  ['focus', 'bg', UI],
  ['focus', 'surface', UI],
];

const palettes = readPalettes();

describe('SPEC-001/AC-11 контраст пар токенів у палітрах А і Б', () => {
  for (const palette of ['a', 'b'] as const) {
    for (const surface of ['day', 'night'] as const) {
      for (const [fg, bg, min] of PAIRS) {
        test(`${palette}/${surface}: ${fg} на ${bg} ≥ ${min}`, () => {
          const f = palettes[palette][`${surface}-${fg}`];
          const b = palettes[palette][`${surface}-${bg}`];
          expect(f, `немає --${surface}-${fg} у палітрі ${palette}`).toBeDefined();
          expect(b, `немає --${surface}-${bg} у палітрі ${palette}`).toBeDefined();
          expect(contrast(f, b)).toBeGreaterThanOrEqual(min);
        });
      }
    }
  }

  test('опорні кольори ТЗ §8.2 на місці', () => {
    expect(palettes.a['night-bg']).toBe('#0d1424');
    expect(palettes.a['day-bg']).toBe('#f4f6f8');
    expect(palettes.a['day-accent']).toBe('#ffb547');
    expect(palettes.b['night-bg']).toBe('#11110f');
    expect(palettes.b['day-bg']).toBe('#ecebe4');
    expect(palettes.b['day-accent']).toBe('#ff4d00');
  });
});
