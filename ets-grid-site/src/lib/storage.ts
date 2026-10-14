// Безпечна робота з localStorage і контракт ключів між модулями (SPEC-001 §3.7).

export const KEYS = {
  cart: 'etsgrid:cart:v1',
  compare: 'etsgrid:compare:v1',
  palette: 'etsgrid:palette',
  /** Недавно переглянуті (SPEC-005 §3.1, ревізія 5 SPEC-001). */
  recent: 'etsgrid:recent:v1',
} as const;

/** Шрифти запасного напряму Б «Сигнал» — підвантажуються лише при його виборі (SPEC-010, D-039). */
export const PALETTE_B_FONTS =
  'https://fonts.googleapis.com/css2?family=Fira+Sans+Extra+Condensed:wght@700;800&family=Commissioner:wght@400..700&display=swap';

/** Модуль кошика надсилає цю подію на window після кожної зміни. */
export const CART_CHANGE_EVENT = 'etsgrid:cart-change';

/** Мінімальна форма позиції кошика; SPEC-005 може розширити. */
export interface CartItem {
  slug: string;
  qty: number;
  turnkey: boolean;
}

export type Palette = 'a' | 'b';

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** true — записано; false — сховище недоступне. Ніколи не кидає. */
export function write(key: string, value: unknown): boolean {
  try {
    if (!globalThis.localStorage) return false;
    globalThis.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Сума qty коректних позицій; будь-що інше — 0. */
export function cartCount(value: unknown): number {
  if (!Array.isArray(value)) return 0;
  return value.reduce<number>((sum, item) => {
    const qty = (item as Partial<CartItem> | null)?.qty;
    return typeof qty === 'number' && Number.isFinite(qty) && qty > 0 ? sum + qty : sum;
  }, 0);
}
