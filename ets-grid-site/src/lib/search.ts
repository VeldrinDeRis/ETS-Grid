// Пошук (SPEC-005 §3.7): індекс на збірці, нормалізація, одна помилка для слів від 4 літер.
import type { FiltersFile } from './filters/config';
import { priceView } from './price';
import { routes } from './routes';
import type { Product, Structure } from './schema';

export interface SearchEntry {
  kind: 'product' | 'category';
  slug: string;
  title: string;
  url: string;
  subtitle: string;
  tokens: string[];
}

/** Нижній регістр, без апострофів, і/ї→и, є→е, ґ→г, «GB/T» → «gbt». */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ʼ'’`]/g, '')
    .replace(/[ії]/g, 'и')
    .replace(/є/g, 'е')
    .replace(/ґ/g, 'г')
    .replace(/(\w)\/(\w)/g, '$1$2')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

const tokenize = (text: string) => normalize(text).split(' ').filter(Boolean);

function connectorLabels(filters: FiltersFile): Map<string, string> {
  const facet = filters.levels.charging.facets.find((f) => f.key === 'connectors');
  return new Map(Array.isArray(facet?.values) ? facet.values : []);
}

export function buildSearchIndex(products: Product[], structure: Pick<Structure, 'levels' | 'categories'>, filters: FiltersFile): SearchEntry[] {
  const connectors = connectorLabels(filters);
  const levelById = new Map(structure.levels.map((l) => [l.id, l]));
  const entries: SearchEntry[] = products.map((p) => {
    const level = levelById.get(p.level)!;
    const category = structure.categories.find((c) => c.level === level.key && c.slug === p.category);
    const conn = Array.isArray(p.attrs.connectors) ? (p.attrs.connectors as string[]).map((c) => connectors.get(c) ?? c) : [];
    const brand = /\[[^\]]+\]/.test(p.brand) ? '' : p.brand;
    return {
      kind: 'product',
      slug: p.slug,
      title: p.name,
      url: routes.product(p.slug),
      subtitle: [category?.name ?? level.name, priceView(p).primary, priceView(p).demo ? 'демо-ціна' : null].filter(Boolean).join(' · '),
      tokens: [...new Set(tokenize([p.name, brand, category?.name ?? '', ...conn].join(' ')))],
    };
  });
  for (const c of structure.categories) {
    const level = structure.levels.find((l) => l.key === c.level)!;
    entries.push({
      kind: 'category',
      slug: `${level.slug}/${c.slug}`,
      title: `${c.name} — ${level.name.toLowerCase()}`,
      url: routes.category(level.slug, c.slug),
      subtitle: 'Розділ каталогу',
      tokens: [...new Set(tokenize(`${c.name} ${level.name}`))],
    });
  }
  return entries;
}

/** Відстань Левенштейна з раннім виходом (> 1 нас не цікавить). */
function withinOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function tokenScore(query: string, tokens: string[]): number {
  if (tokens.includes(query)) return 3;
  if (tokens.some((t) => t.startsWith(query))) return 2;
  if (query.length >= 4 && tokens.some((t) => t.length >= 4 && withinOne(query, t))) return 1;
  return 0;
}

/** Усі слова запиту мають знайтися (І); товари вище за категорії при однаковій оцінці. */
export function search(index: SearchEntry[], query: string, limit = 50): SearchEntry[] {
  const words = tokenize(query);
  if (words.length === 0) return [];
  return index
    .map((entry, order) => {
      const scores = words.map((w) => tokenScore(w, entry.tokens));
      // Slug — лише як фраза цілком («ets home» → ets-home-*), інакше «ets» + «home» ловить ets-battery-home-10.
      if (scores.includes(0) && entry.slug.includes(words.join('-'))) return { entry, order, score: words.length * 2 };
      return { entry, order, score: scores.includes(0) ? 0 : scores.reduce((a, b) => a + b, 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.entry.kind === b.entry.kind ? a.order - b.order : a.entry.kind === 'product' ? -1 : 1))
    .slice(0, limit)
    .map((x) => x.entry);
}
