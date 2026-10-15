// Острови в зібраному HTML: який рендерер у острова (SPEC-001 AC-24, D-062; SPEC-002 AC-38).
// `opts.value` дорівнює імені рендерера лише для client:only, тому рендерер визначаємо за вмістом його модуля:
// клієнт React містить рядки react-dom («Minified React error», хук devtools), клієнт Preact — ні.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, type Page } from './dist';

const REACT_MARK = /Minified React error|__REACT_DEVTOOLS_GLOBAL_HOOK__/;
const cache = new Map<string, boolean>();

export function isReactRenderer(rendererUrl: string | null | undefined): boolean {
  if (!rendererUrl) return false;
  if (!cache.has(rendererUrl)) {
    const file = join(DIST, rendererUrl);
    cache.set(rendererUrl, existsSync(file) && REACT_MARK.test(readFileSync(file, 'utf8')));
  }
  return cache.get(rendererUrl)!;
}

export function islands(p: Page): Element[] {
  return [...p.document.querySelectorAll('astro-island')];
}

export const reactIslands = (p: Page) => islands(p).filter((i) => isReactRenderer(i.getAttribute('renderer-url')));
export const hasReactIsland = (p: Page) => reactIslands(p).length > 0;
