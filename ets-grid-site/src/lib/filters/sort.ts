// Сортування і найближчі товари (SPEC-002 §3.2–3.3).
import type { Product } from '../schema';
import { productPrice, type SortKey } from './engine';

export const SORT_OPTIONS: { value: SortKey | null; label: string }[] = [
  { value: null, label: 'Популярні' },
  { value: 'price-asc', label: 'Дешевші' },
  { value: 'price-desc', label: 'Дорожчі' },
  { value: 'power-desc', label: 'Потужніші' },
];

/** Головна метрика: зарядки й інвертори — кВт, панелі — Вт, батареї — кВт·год, СЕС і Carport — kWp. */
export function mainMetric(p: Product): number | null {
  for (const key of ['power_kw', 'panel_w', 'capacity_kwh', 'kwp']) {
    const v = p.attrs[key];
    if (typeof v === 'number') return v;
  }
  return null;
}

function byNumber(get: (p: Product) => number | null, direction: 1 | -1) {
  return (a: Product, b: Product) => {
    const x = get(a);
    const y = get(b);
    if (x === null && y === null) return 0;
    if (x === null) return 1;
    if (y === null) return -1;
    return (x - y) * direction;
  };
}

/** Повертає нову відсортовану копію; «Популярні» (null) — порядок каталогу. Сортування стабільне. */
export function sortProducts(products: Product[], sort: SortKey | null): Product[] {
  const list = [...products];
  if (sort === 'price-asc') return list.sort(byNumber(productPrice, 1));
  if (sort === 'price-desc') return list.sort(byNumber(productPrice, -1));
  if (sort === 'power-desc') return list.sort(byNumber(mainMetric, -1));
  return list;
}

/** Для порожньої видачі: товари того ж рівня, найближчі за метрикою, інакше — за порядком каталогу. */
export function nearestProducts(
  all: Product[],
  context: { level: number; exclude: string[]; metric?: number | null },
  n = 3,
): Product[] {
  const candidates = all.filter((p) => p.level === context.level && !context.exclude.includes(p.slug));
  const target = context.metric;
  if (target === undefined || target === null) return candidates.slice(0, n);
  const distance = (p: Product) => {
    const m = mainMetric(p);
    return m === null ? null : Math.abs(m - target);
  };
  return [...candidates].sort(byNumber(distance, 1)).slice(0, n);
}
