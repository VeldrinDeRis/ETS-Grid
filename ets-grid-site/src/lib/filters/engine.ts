// Логіка фільтрації (SPEC-002 §3.2): чисті функції без DOM, спільні для сервера й острова.
import { autonomyHours } from '../calc/formulas';
import { calc } from '../calc/config';
import { formatNumber, NBSP } from '../format';
import type { Product } from '../schema';
import type { Car, FacetConfig, LevelFilterConfig } from './config';

export type SortKey = 'price-asc' | 'price-desc' | 'power-desc';
export const SORT_KEYS: readonly SortKey[] = ['price-asc', 'price-desc', 'power-desc'];

export interface FilterState {
  filters: Record<string, string[]>;
  sort: SortKey | null;
}

export interface FilterContext {
  cars?: Car[];
}

export type FacetKind = 'enum' | 'range' | 'interval' | 'car';

export interface ResolvedValue {
  token: string;
  label: string;
  lo?: number;
  hi?: number | null;
}

export interface ResolvedFacet {
  key: string;
  label: string;
  ui: FacetConfig['ui'];
  field: string;
  unit?: string;
  kind: FacetKind;
  primary: boolean;
  values: ResolvedValue[];
}

/** Значення з плейсхолдером усередині («[БРЕНД]», «[N] років») — даних ще немає. */
const PLACEHOLDER = /\[[^\]]+\]/;

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return true;
  if (typeof v === 'string') return PLACEHOLDER.test(v);
  if (Array.isArray(v)) return v.filter((x) => !isEmpty(x)).length === 0;
  return false;
}

export function productPrice(p: Product): number | null {
  return p.price_equipment ?? p.price_turnkey_from;
}

/** Значення поля товару за описом `field` фасету. */
export function fieldValue(p: Product, field: string): unknown {
  if (field === 'price') return productPrice(p);
  // Час автономії на «базових потребах» (SPEC-004 §3.5, D-029 п. 3).
  if (field === 'autonomy_h') return autonomyHours(p, calc);
  if (field === 'price_per_w') {
    const w = p.attrs.panel_w;
    return p.price_equipment !== null && typeof w === 'number' && w > 0 ? p.price_equipment / w : null;
  }
  if (field.startsWith('attrs.')) return p.attrs[field.slice(6)];
  return (p as unknown as Record<string, unknown>)[field];
}

function rangeLabel(lo: number, hi: number | null, unit?: string): string {
  const u = unit ? `${NBSP}${unit}` : '';
  if (hi === null) return `від ${formatNumber(lo)}${u}`;
  if (lo === 0) return `до ${formatNumber(hi)}${u}`;
  return `${formatNumber(lo)}–${formatNumber(hi)}${u}`;
}

export const rangeToken = (lo: number, hi: number | null) => `${lo}-${hi ?? ''}`;

function autoValues(products: Product[], field: string): ResolvedValue[] {
  const seen = new Set<string>();
  for (const p of products) {
    const v = fieldValue(p, field);
    for (const x of Array.isArray(v) ? v : [v]) if (!isEmpty(x)) seen.add(String(x));
  }
  return [...seen].sort((a, b) => a.localeCompare(b, 'uk')).map((token) => ({ token, label: token }));
}

function resolveFacet(f: FacetConfig, primary: boolean, products: Product[], ctx: FilterContext): ResolvedFacet {
  const base = { key: f.key, label: f.label, ui: f.ui, field: f.field, unit: f.unit, primary };
  if (f.field === 'car') {
    return { ...base, kind: 'car', values: (ctx.cars ?? []).map((c) => ({ token: c.id, label: `${c.brand} ${c.model}` })) };
  }
  if (f.ui === 'range-slider') return { ...base, kind: 'interval', values: [] };
  if (f.ranges) {
    return {
      ...base,
      kind: 'range',
      values: f.ranges.map(([lo, hi, label]) => ({ token: rangeToken(lo, hi), label: label ?? rangeLabel(lo, hi, f.unit), lo, hi })),
    };
  }
  const values = f.values === 'auto' || !f.values ? autoValues(products, f.field) : f.values.map(([token, label]) => ({ token, label }));
  return { ...base, kind: 'enum', values };
}

/** Головний фільтр + фасети рівня з конкретними значеннями для цього набору товарів. */
export function resolveFacets(level: LevelFilterConfig, products: Product[], ctx: FilterContext = {}): ResolvedFacet[] {
  return [resolveFacet(level.primary, true, products, ctx), ...level.facets.map((f) => resolveFacet(f, false, products, ctx))];
}

/* ---------- стан у URL ---------- */

const INTERVAL = /^(\d+(?:\.\d+)?)?-(\d+(?:\.\d+)?)?$/;

function validInterval(token: string): boolean {
  const m = INTERVAL.exec(token);
  if (!m || (m[1] === undefined && m[2] === undefined)) return false;
  return m[1] === undefined || m[2] === undefined || Number(m[1]) <= Number(m[2]);
}

function canonicalTokens(facet: ResolvedFacet, tokens: string[]): string[] {
  if (facet.kind === 'interval') return tokens.filter(validInterval).slice(0, 1);
  const known = facet.values.map((v) => v.token);
  return known.filter((t) => tokens.includes(t));
}

export function parseState(search: string, facets: ResolvedFacet[]): FilterState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const filters: Record<string, string[]> = {};
  for (const facet of facets) {
    const raw = params.get(facet.key);
    if (!raw) continue;
    const tokens = canonicalTokens(facet, raw.split(','));
    if (tokens.length > 0) filters[facet.key] = tokens;
  }
  const sort = params.get('sort');
  return { filters, sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : null };
}

export function serializeState(state: FilterState, facets: ResolvedFacet[]): string {
  const parts: string[] = [];
  for (const facet of facets) {
    const tokens = canonicalTokens(facet, state.filters[facet.key] ?? []);
    if (tokens.length > 0) parts.push(`${facet.key}=${tokens.map(encodeURIComponent).join(',')}`);
  }
  if (state.sort) parts.push(`sort=${state.sort}`);
  return parts.join('&');
}

/* ---------- збіг і фільтрація ---------- */

function matchesToken(p: Product, facet: ResolvedFacet, token: string, ctx: FilterContext): boolean {
  switch (facet.kind) {
    case 'car': {
      const car = ctx.cars?.find((c) => c.id === token);
      const connectors = p.attrs.connectors;
      if (!car || !Array.isArray(connectors)) return false;
      return [car.ac_connector, car.dc_connector].some((c) => c !== null && connectors.includes(c));
    }
    case 'interval': {
      const x = fieldValue(p, facet.field);
      const m = INTERVAL.exec(token);
      if (typeof x !== 'number' || !m) return false;
      return (m[1] === undefined || x >= Number(m[1])) && (m[2] === undefined || x <= Number(m[2]));
    }
    case 'range': {
      const x = fieldValue(p, facet.field);
      const v = facet.values.find((r) => r.token === token);
      if (typeof x !== 'number' || !v || v.lo === undefined) return false;
      const aboveLo = v.lo === 0 ? x >= 0 : x > v.lo;
      return aboveLo && (v.hi === null || v.hi === undefined || x <= v.hi);
    }
    default: {
      const x = fieldValue(p, facet.field);
      if (Array.isArray(x)) return x.some((item) => String(item) === token);
      return !isEmpty(x) && String(x) === token;
    }
  }
}

function matchesFacet(p: Product, facet: ResolvedFacet, tokens: string[] | undefined, ctx: FilterContext): boolean {
  if (!tokens || tokens.length === 0) return true;
  return tokens.some((t) => matchesToken(p, facet, t, ctx));
}

/** «АБО» всередині фасета, «І» між фасетами. */
export function applyFilters(products: Product[], state: FilterState, facets: ResolvedFacet[], ctx: FilterContext = {}): Product[] {
  return products.filter((p) => facets.every((f) => matchesFacet(p, f, state.filters[f.key], ctx)));
}

/** Лічильник значення = товари при інших фільтрах + це значення (03 §2). */
export function facetCounts(
  products: Product[],
  state: FilterState,
  facets: ResolvedFacet[],
  ctx: FilterContext = {},
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const facet of facets) {
    if (facet.kind === 'interval') continue;
    const others = products.filter((p) => facets.every((f) => f === facet || matchesFacet(p, f, state.filters[f.key], ctx)));
    const counts: Record<string, number> = {};
    for (const v of facet.values) counts[v.token] = others.filter((p) => matchesToken(p, facet, v.token, ctx)).length;
    result[facet.key] = counts;
  }
  return result;
}

/** Фасет показується, якщо хоч один товар має його поле; значення-плейсхолдери не пропонуються. */
export function visibleFacets(products: Product[], facets: ResolvedFacet[], _ctx: FilterContext = {}): ResolvedFacet[] {
  return facets.filter((facet) => {
    if (facet.kind === 'car') return facet.values.length > 0 && products.some((p) => !isEmpty(p.attrs.connectors));
    if (facet.kind === 'enum' && facet.values.length === 0) return false;
    return products.some((p) => !isEmpty(fieldValue(p, facet.field)));
  });
}

/**
 * Фасети рівня, за якими в усьому рівні немає реальних даних (D-031, SPEC-002 ревізія 3):
 * показуються неактивними з поміткою «Дані надасть замовник». Головний фільтр сюди не потрапляє.
 * Передавати товари всього рівня, а не лістингу — інакше фасет «не про цю категорію» вважатиметься пробілом.
 */
export function missingFacets(levelProducts: Product[], facets: ResolvedFacet[], ctx: FilterContext = {}): ResolvedFacet[] {
  const present = new Set(visibleFacets(levelProducts, facets, ctx).map((f) => f.key));
  return facets.filter((f) => !f.primary && !present.has(f.key));
}

/** Межі для повзунка ціни. */
export function intervalBounds(products: Product[], facet: ResolvedFacet): [number, number] | null {
  const xs = products.map((p) => fieldValue(p, facet.field)).filter((x): x is number => typeof x === 'number');
  return xs.length ? [Math.floor(Math.min(...xs)), Math.ceil(Math.max(...xs))] : null;
}
