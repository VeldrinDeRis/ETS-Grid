import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, test } from 'vitest';
import { DIST, distFiles, pages } from '../helpers/dist';

const KB = 1024;
const CONTENT_LIMIT = 100 * KB;
const CATALOG_LIMIT = 150 * KB;

/** Файл модуля та всі його статичні імпорти. */
function moduleGraph(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry) || !existsSync(entry)) return seen;
  seen.add(entry);
  const code = readFileSync(entry, 'utf8');
  for (const m of code.matchAll(/(?:import|export)\s*(?:[^'"]*?from\s*)?["']([^"']+\.m?js)["']/g)) {
    const spec = m[1];
    const next = spec.startsWith('/') ? join(DIST, spec) : join(dirname(entry), spec);
    moduleGraph(next, seen);
  }
  return seen;
}

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
  for (const f of files) total += gzipSync(readFileSync(f)).length;
  return total;
}

const isListing = (url: string) => url.split('/').filter(Boolean).length === 2 && !url.startsWith('/product/');

describe('SPEC-001/AC-20 бюджети JS і шрифтів', () => {
  test.each(pages().map((p) => [p.url, p] as const))('%s: JS ≤ 100/150 КБ gz', (url, p) => {
    expect(pageJsGz(p)).toBeLessThanOrEqual(isListing(url) ? CATALOG_LIMIT : CONTENT_LIMIT);
  });

  test('файлів шрифтів ≤ 2 (до раунду дизайну — 0)', () => {
    const fontFiles = distFiles().filter((f) => /\.(woff2?|ttf|otf)$/i.test(f));
    expect(fontFiles.length).toBeLessThanOrEqual(2);
    const preloads = pages().flatMap((p) => [...p.document.querySelectorAll('link[rel="preload"][as="font"]')]);
    expect(preloads.length).toBeLessThanOrEqual(2);
  });
});
