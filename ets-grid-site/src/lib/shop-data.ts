// Дані для островів магазину (SPEC-005): компактні товари на збірці. Лише сервер — читає public/ через images.ts.
import filtersJson from '../data/filters.json';
import { getLevels, getProductsBy, structure } from './catalog';
import type { FiltersFile } from './filters/config';
import { productImage } from './images';
import { fullRows, type Row } from './product';
import { routes } from './routes';
import { buildSearchIndex, type SearchEntry } from './search';
import type { Product } from './schema';

export interface ShopProduct {
  slug: string;
  name: string;
  url: string;
  quoteUrl: string;
  level: number;
  levelName: string;
  image: { src: string; alt: string } | null;
  sale_mode: Product['sale_mode'];
  price_equipment: number | null;
  price_turnkey_from: number | null;
  demo: boolean;
  stock: Product['stock'];
  delivery_days: number;
  related: string[];
  connectors: string[];
  /** Повна таблиця характеристик — лише для порівняння. */
  rows?: Row[];
}

export interface LevelLink {
  id: number;
  name: string;
  short: string;
  url: string;
}

export async function shopProducts(options: { rows?: boolean } = {}): Promise<ShopProduct[]> {
  const levels = new Map(getLevels().map((l) => [l.id, l]));
  return (await getProductsBy()).map((p) => ({
    slug: p.slug,
    name: p.name,
    url: routes.product(p.slug),
    quoteUrl: routes.quoteFor(p.slug),
    level: p.level,
    levelName: levels.get(p.level)!.name,
    image: productImage(p),
    sale_mode: p.sale_mode,
    price_equipment: p.price_equipment,
    price_turnkey_from: p.price_turnkey_from,
    demo: p.demo,
    stock: p.stock,
    delivery_days: p.delivery_days,
    related: p.related,
    connectors: Array.isArray(p.attrs.connectors) ? (p.attrs.connectors as string[]) : [],
    ...(options.rows ? { rows: fullRows(p) } : {}),
  }));
}

export function levelLinks(): LevelLink[] {
  return getLevels().map((l) => ({ id: l.id, name: l.name, short: l.short, url: routes.level(l.slug) }));
}

/** Індекс пошуку (SPEC-005 §3.7): сторінка /poshuk/ і підказки в шапці (/search-index.json). */
export async function searchIndex(): Promise<SearchEntry[]> {
  return buildSearchIndex(await getProductsBy(), structure, filtersJson as unknown as FiltersFile);
}
