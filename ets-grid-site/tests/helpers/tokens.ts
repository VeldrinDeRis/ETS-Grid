// Розбір кольорових токенів палітр із tokens.css (SPEC-001 §3.6).
// Палітра задає сирі значення --day-* і --night-* у блоці [data-palette="a|b"].
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const TOKENS_PATH = fileURLToPath(new URL('../../src/styles/tokens.css', import.meta.url));

export type PaletteColors = Record<string, string>;

export function paletteBlocks(css: string): Record<'a' | 'b', PaletteColors> {
  const result = {} as Record<'a' | 'b', PaletteColors>;
  for (const p of ['a', 'b'] as const) {
    const re = new RegExp(`\\[data-palette=["']?${p}["']?\\][^{]*\\{([^}]*)\\}`, 'g');
    const colors: PaletteColors = {};
    for (const block of css.matchAll(re)) {
      // Мініфікований CSS прибирає «;» після останнього оголошення в блоці.
      for (const m of block[1].matchAll(/--((?:day|night)-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*(?:;|$)/g)) {
        colors[m[1]] = m[2].toLowerCase();
      }
    }
    result[p] = colors;
  }
  return result;
}

export function readPalettes(): Record<'a' | 'b', PaletteColors> {
  return paletteBlocks(readFileSync(TOKENS_PATH, 'utf8'));
}
