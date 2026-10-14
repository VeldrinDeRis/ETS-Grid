// Доступ до зібраного сайту для тестів категорії build (D-024).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

export const PROJECT = fileURLToPath(new URL('../../', import.meta.url));
export const DIST = join(PROJECT, 'dist');

export function assertBuilt(): void {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('Немає dist/. Спершу npm run build (або npm run test:all).');
  }
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

export function distFiles(ext?: string): string[] {
  return walk(DIST).filter((f) => !ext || f.endsWith(ext));
}

/** URL сторінки за файлом: dist/koshyk/index.html → /koshyk/ ; dist/404.html → /404.html */
export function urlOf(file: string): string {
  const rel = relative(DIST, file).split(sep).join('/');
  return rel === 'index.html' ? '/' : rel.endsWith('/index.html') ? `/${rel.slice(0, -'index.html'.length)}` : `/${rel}`;
}

export interface Page {
  url: string;
  file: string;
  html: string;
  document: Document;
}

let cache: Page[] | null = null;

export function pages(): Page[] {
  if (cache) return cache;
  assertBuilt();
  cache = distFiles('.html').map((file) => {
    const html = readFileSync(file, 'utf8');
    return { url: urlOf(file), file, html, document: parseHTML(html).document as unknown as Document };
  });
  return cache;
}

export function page(url: string): Page {
  const p = pages().find((x) => x.url === url);
  if (!p) throw new Error(`Немає сторінки ${url} у dist/`);
  return p;
}

/** Файл у dist/, що відповідає внутрішньому посиланню, або null. */
export function resolveHref(href: string): string | null {
  const path = decodeURIComponent(href.split('#')[0].split('?')[0]);
  if (!path.startsWith('/')) return null;
  const direct = join(DIST, path);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const index = join(DIST, path, 'index.html');
  return existsSync(index) ? index : null;
}
