// Знімок каталогу для тестів логіки (D-023 правило 6): не залежить від src/data/catalog.json.
import snapshot from './catalog-snapshot.json';
import filtersJson from '../../src/data/filters.json';
import type { Product } from '../../src/lib/schema';
import type { Car, FiltersFile } from '../../src/lib/filters';

export const products = snapshot.products.map((p) => ({ docs: [], related: [], ...p })) as unknown as Product[];
export const filters = filtersJson as unknown as FiltersFile;

export const byLevel = (level: number) => products.filter((p) => p.level === level);
export const byCategory = (level: number, category: string) => byLevel(level).filter((p) => p.category === category);
export const slugs = (list: { slug: string }[]) => list.map((p) => p.slug);

export const charging = byLevel(1);

/** Невеликий довідник авто для тестів фасету «Підбір за авто». */
export const cars: Car[] = [
  { id: 'eu-ccs', brand: 'Test', model: 'EU CCS', market: 'EU', ac_connector: 'type2', dc_connector: 'ccs2', ac_max_kw: 11, dc_max_kw: 135, source: 'https://example.test/eu' },
  { id: 'cn-gbt', brand: 'Test', model: 'CN GB/T', market: 'CN', ac_connector: 'gbt_ac', dc_connector: 'gbt_dc', ac_max_kw: 7, dc_max_kw: 100, source: 'https://example.test/cn' },
];
