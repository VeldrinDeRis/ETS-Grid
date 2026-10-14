import { describe, expect, test } from 'vitest';
import { pages, resolveHref } from '../helpers/dist';

describe('SPEC-001/AC-06 немає битих внутрішніх посилань', () => {
  test('кожен href="/…" веде на файл у dist/', () => {
    const broken: string[] = [];
    for (const p of pages()) {
      for (const a of p.document.querySelectorAll('a[href^="/"], link[href^="/"]')) {
        const href = a.getAttribute('href')!;
        if (!resolveHref(href)) broken.push(`${p.url} → ${href}`);
      }
    }
    expect([...new Set(broken)]).toEqual([]);
  });

  test('якорі на тих самих сторінках існують', () => {
    const broken: string[] = [];
    const byUrl = new Map(pages().map((p) => [p.url, p]));
    for (const p of pages()) {
      for (const a of p.document.querySelectorAll('a[href*="#"]')) {
        const href = a.getAttribute('href')!;
        const [path, hash] = href.split('#');
        if (!hash) continue;
        const target = path === '' ? p : byUrl.get(path);
        // Якорі підбірників (#pidbir, #konfigurator) з'являться в SPEC-002/004.
        if (!target || ['pidbir', 'konfigurator'].includes(hash)) continue;
        if (!target.document.getElementById(hash)) broken.push(`${p.url} → ${href}`);
      }
    }
    expect([...new Set(broken)]).toEqual([]);
  });
});
