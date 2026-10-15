// SPEC-006 ревізія 6.3 (D-072): рух головної без зайвого перемальовування (AC-43).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { DIST, page } from '../helpers/dist';

const home = page('/');
const linked = [...home.document.querySelectorAll('link[rel="stylesheet"]')].map((l) => readFileSync(join(DIST, l.getAttribute('href')!), 'utf8'));
const inline = [...home.document.querySelectorAll('style')].map((s) => s.textContent ?? '');
const css = [...linked, ...inline].join('\n');
const scripts = [...home.document.querySelectorAll('script[type="module"][src], astro-island[component-url]')]
  .map((el) => el.getAttribute('src') ?? el.getAttribute('component-url')!)
  .map((src) => readFileSync(join(DIST, src), 'utf8'))
  .join('\n');

/** Тіла @keyframes: ім'я → текст між зовнішніми дужками. */
function keyframes(text: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /@keyframes\s+([\w-]+)\s*\{/g;
  for (let m; (m = re.exec(text)); ) {
    let depth = 1;
    let i = re.lastIndex;
    while (depth && i < text.length) depth += text[i] === '{' ? 1 : text[i] === '}' ? -1 : 0, i++;
    out.set(m[1], text.slice(re.lastIndex, i - 1));
  }
  return out;
}

const frames = keyframes(css);
// Оголошення animation: ім'я ключових кадрів і чи цикл (мініфікатор ставить ім'я в кінець значення).
const decls = [...css.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)].map((m) => {
  const tokens = m[1].trim().split(/\s+/);
  return { name: tokens.find((t) => frames.has(t)), infinite: tokens.includes('infinite') };
});
// Ключові кадри, що справді вживаються на головній (бандл CSS спільний для кількох сторінок).
const used = [...new Set(decls.map((d) => d.name).filter((n): n is string => !!n))];

describe('SPEC-006/AC-43 рух лише opacity і transform', () => {
  test('ключові кадри головної не анімують width, height, box-shadow, background-position', () => {
    expect(used.length).toBeGreaterThan(5);
    for (const name of used) expect(frames.get(name), name).not.toMatch(/(?:^|[{;\s])(?:width|height|box-shadow|background-position)\s*:/);
  });

  test('циклів рівно три: доба над героєм, світлодіоди, блик схеми', () => {
    const cycles = new Set(decls.filter((d) => d.infinite && d.name).map((d) => (d.name!.startsWith('sky-') ? 'sky' : d.name)));
    expect([...cycles].sort()).toEqual(['flow-spark', 'led-charge', 'sky']);
  });

  test('немає «дихання» плиток і позиційних змінних лампи', () => {
    expect(css).not.toContain('tile-breathe');
    expect(css).not.toMatch(/--lx|--ly/);
    expect(scripts).not.toMatch(/--lx|--ly/);
  });

  test('цикли ставляться на паузу поза кадром, підказка сцени зупиняється після [data-done]', () => {
    expect(css).toMatch(/\[data-offscreen\][^{]*\.hero__sky[^{]*\{[^}]*animation-play-state:\s*paused/);
    expect(css).toMatch(/\[data-offscreen\][^{]*\.hero__led[^{]*\{[^}]*animation-play-state:\s*paused/);
    expect(css).toMatch(/\[data-offscreen\][^{]*\.flow__spark[^{]*\{[^}]*animation-play-state:\s*paused/);
    expect(css).toMatch(/\[data-done\][^{]*\.flow__hint[^{]*:{1,2}before[^{]*\{[^}]*animation:\s*none/);
  });
});
