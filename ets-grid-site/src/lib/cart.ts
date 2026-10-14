// Кошик. Власник модуля — SPEC-005; SPEC-002 створює лише add() за контрактом SPEC-001 §3.7.
import { CART_CHANGE_EVENT, KEYS, read, write, type CartItem } from './storage';

function items(): CartItem[] {
  const value = read<unknown>(KEYS.cart, []);
  return Array.isArray(value)
    ? value.filter((i): i is CartItem => typeof i?.slug === 'string' && typeof i?.qty === 'number' && i.qty > 0)
    : [];
}

/** Додає товар; той самий товар з тим самим turnkey — +1 до qty. */
export function add(slug: string, turnkey: boolean): void {
  const list = items();
  const existing = list.find((i) => i.slug === slug && Boolean(i.turnkey) === turnkey);
  if (existing) existing.qty += 1;
  else list.push({ slug, qty: 1, turnkey });
  write(KEYS.cart, list);
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}
