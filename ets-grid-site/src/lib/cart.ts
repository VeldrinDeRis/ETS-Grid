// Кошик (SPEC-005 §3.1): контракт ключа etsgrid:cart:v1 і події etsgrid:cart-change (SPEC-001 §3.7).
import type { Product } from './schema';
import { CART_CHANGE_EVENT, KEYS, read, write, type CartItem } from './storage';

export const QTY_MIN = 1;
export const QTY_MAX = 99;

export function items(): CartItem[] {
  const value = read<unknown>(KEYS.cart, []);
  return Array.isArray(value)
    ? value
        .filter((i): i is CartItem => typeof i?.slug === 'string' && typeof i?.qty === 'number' && i.qty > 0)
        .map((i) => ({ slug: i.slug, qty: i.qty, turnkey: Boolean(i.turnkey) }))
    : [];
}

function save(list: CartItem[]): void {
  write(KEYS.cart, list);
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

const same = (i: CartItem, slug: string, turnkey: boolean) => i.slug === slug && i.turnkey === turnkey;
const clampQty = (n: number) => Math.min(QTY_MAX, Math.max(QTY_MIN, Number.isFinite(n) ? Math.round(n) : QTY_MIN));

/** Додає товар; той самий товар з тим самим turnkey — +1 до qty (SPEC-002 §3.6). */
export function add(slug: string, turnkey: boolean): void {
  const list = items();
  const existing = list.find((i) => same(i, slug, turnkey));
  if (existing) existing.qty = clampQty(existing.qty + 1);
  else list.push({ slug, qty: 1, turnkey });
  save(list);
}

export function setQty(slug: string, turnkey: boolean, qty: number): void {
  save(items().map((i) => (same(i, slug, turnkey) ? { ...i, qty: clampQty(qty) } : i)));
}

/** Перемикає «з монтажем»; якщо така позиція вже є — кількості складаються. */
export function setTurnkey(slug: string, from: boolean, to: boolean): void {
  if (from === to) return;
  const list = items();
  const source = list.find((i) => same(i, slug, from));
  if (!source) return;
  const target = list.find((i) => same(i, slug, to));
  if (target) {
    target.qty = clampQty(target.qty + source.qty);
    save(list.filter((i) => i !== source));
  } else {
    source.turnkey = to;
    save(list);
  }
}

export function remove(slug: string, turnkey: boolean): void {
  save(items().filter((i) => !same(i, slug, turnkey)));
}

export function clear(): void {
  save([]);
}

export interface Totals {
  equipment: number;
  installation: number;
  total: number;
  demo: boolean;
  unavailable: string[];
}

/** Мінімум полів товару для підсумку; підходять і Product, і компактні товари островів. */
export type PricedProduct = Pick<Product, 'slug' | 'price_equipment' | 'price_turnkey_from' | 'demo'>;

/** Обладнання, монтаж, разом; товари, яких немає в каталозі або без ціни, — у unavailable. */
export function totals(list: CartItem[], products: PricedProduct[]): Totals {
  const result: Totals = { equipment: 0, installation: 0, total: 0, demo: false, unavailable: [] };
  for (const item of list) {
    const p = products.find((x) => x.slug === item.slug);
    if (!p || p.price_equipment === null) {
      result.unavailable.push(item.slug);
      continue;
    }
    result.equipment += p.price_equipment * item.qty;
    if (item.turnkey && p.price_turnkey_from !== null) result.installation += (p.price_turnkey_from - p.price_equipment) * item.qty;
    if (p.demo) result.demo = true;
  }
  result.total = result.equipment + result.installation;
  return result;
}
