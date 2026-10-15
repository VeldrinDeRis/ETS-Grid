import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, test } from 'vitest';
import { DIST, distFiles, pages } from '../helpers/dist';
import { hasReactIsland } from '../helpers/islands';

const KB = 1024;
/** Контентні сторінки (ТЗ §11). */
const CONTENT_LIMIT = 100 * KB;
/** Каталог і підбірники без React (SPEC-002 AC-18, SPEC-004 AC-11). */
const CATALOG_LIMIT = 150 * KB;
/** Сторінки з React-островами Motion+ (D-045 → D-062): лише головна. */
const REACT_LIMIT = 250 * KB;

const importSpec = (spec: string, from: string) => (spec.startsWith('/') ? join(DIST, spec) : join(dirname(from), spec));

/** Файл модуля та всі його імпорти — статичні й динамічні (SPEC-001 AC-24). */
function moduleGraph(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry) || !existsSync(entry)) return seen;
  seen.add(entry);
  const code = readFileSync(entry, 'utf8');
  for (const m of code.matchAll(/(?:import|export)\s*(?:[^'"]*?from\s*)?["']([^"']+\.m?js)["']/g)) moduleGraph(importSpec(m[1], entry), seen);
  for (const m of code.matchAll(/import\(\s*["']([^"']+\.m?js)["']\s*\)/g)) moduleGraph(importSpec(m[1], entry), seen);
  return seen;
}

/** Увесь JS сторінки: <script src>, інлайн-скрипти та острови (component-url, renderer-url) з їхніми імпортами, кожен файл раз. */
function pageJsGz(p: ReturnType<typeof pages>[number]): number {
  let total = 0;
  const files = new Set<string>();
  for (const s of p.document.querySelectorAll('script')) {
    const src = s.getAttribute('src');
    if (src) {
      for (const f of moduleGraph(join(DIST, src))) files.add(f);
    } else if (s.getAttribute('type') !== 'application/ld+json') {
      total += gzipSync(s.textContent ?? '').length;
    }
  }
  for (const island of p.document.querySelectorAll('astro-island')) {
    for (const attr of ['component-url', 'renderer-url']) {
      const url = island.getAttribute(attr);
      if (url) for (const f of moduleGraph(join(DIST, url))) files.add(f);
    }
  }
  for (const f of files) total += gzipSync(readFileSync(f)).length;
  return total;
}

type Page = ReturnType<typeof pages>[number];
const isCatalogPage = (p: Page) => p.html.includes('CatalogFilters') || p.html.includes('data-picker-kind');
const limitFor = (p: Page) => (hasReactIsland(p) ? REACT_LIMIT : isCatalogPage(p) ? CATALOG_LIMIT : CONTENT_LIMIT);

describe('SPEC-001/AC-20, AC-24, SPEC-002/AC-18, SPEC-006/AC-27 бюджети JS і шрифтів', () => {
  test.each(pages().map((p) => [p.url, p] as const))('%s: JS з островами ≤ 100/150/250 КБ gz', (_url, p) => {
    expect(pageJsGz(p)).toBeLessThanOrEqual(limitFor(p));
  });

  test('AC-24: острови враховано — головна важить більше за свої <script src>; React лише на головній і в каталозі (D-062, D-063)', () => {
    const home = pages().find((p) => p.url === '/')!;
    const scriptsOnly = [...home.document.querySelectorAll('script[src]')].reduce((sum, s) => {
      let t = 0;
      for (const f of moduleGraph(join(DIST, s.getAttribute('src')!))) t += gzipSync(readFileSync(f)).length;
      return sum + t;
    }, 0);
    expect(pageJsGz(home)).toBeGreaterThan(scriptsOnly + 50 * KB);
    const react = pages().filter(hasReactIsland).map((p) => p.url);
    expect(react).toContain('/');
    expect(react.filter((u) => u !== '/' && !isCatalogPage(pages().find((p) => p.url === u)!))).toEqual([]);
  });

  test('острів фільтрів є на сторінках каталогу', () => {
    expect(pages().filter(isCatalogPage).length).toBeGreaterThanOrEqual(20);
  });

  test('D-066: zod не потрапляє в клієнтський JS (схеми лише у lib/*/schema.ts)', () => {
    const withZod = distFiles().filter((f) => /\.m?js$/.test(f) && /ZodError|_zod\b/.test(readFileSync(f, 'utf8')));
    expect(withZod).toEqual([]);
  });

  test('SPEC-010/AC-05 файлів шрифтів ≤ 2, на кожній сторінці ≤ 2 preload', () => {
    const fontFiles = distFiles().filter((f) => /\.(woff2?|ttf|otf)$/i.test(f));
    expect(fontFiles.length).toBeLessThanOrEqual(2);
    for (const p of pages()) {
      expect(p.document.querySelectorAll('link[rel="preload"][as="font"]').length, p.url).toBeLessThanOrEqual(2);
    }
  });
});
