import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { add } from '../../src/lib/cart';
import { COMPARE_LIMIT, has, toggle } from '../../src/lib/compare';
import { CART_CHANGE_EVENT, KEYS, read } from '../../src/lib/storage';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

let events: string[];

beforeEach(() => {
  events = [];
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('window', { dispatchEvent: (e: Event) => events.push(e.type) });
  vi.stubGlobal('Event', class { constructor(public type: string) {} });
});

afterEach(() => vi.unstubAllGlobals());

describe('SPEC-002/AC-09 кошик: add', () => {
  test('новий товар → qty 1 і подія', () => {
    add('ets-home-7', false);
    expect(read(KEYS.cart, [])).toEqual([{ slug: 'ets-home-7', qty: 1, turnkey: false }]);
    expect(events).toEqual([CART_CHANGE_EVENT]);
  });

  test('повтор → qty + 1', () => {
    add('ets-home-7', false);
    add('ets-home-7', false);
    expect(read(KEYS.cart, [])).toEqual([{ slug: 'ets-home-7', qty: 2, turnkey: false }]);
  });

  test('той самий товар з монтажем — окрема позиція', () => {
    add('ets-home-7', false);
    add('ets-home-7', true);
    expect(read(KEYS.cart, [])).toHaveLength(2);
  });

  test('зіпсований кошик не ламає додавання', () => {
    localStorage.setItem(KEYS.cart, '{зіпсовано');
    add('ets-home-22', false);
    expect(read(KEYS.cart, [])).toEqual([{ slug: 'ets-home-22', qty: 1, turnkey: false }]);
  });
});

describe('SPEC-002/AC-09 порівняння: toggle', () => {
  test('додає і прибирає', () => {
    expect(toggle('a')).toEqual({ ok: true, active: true });
    expect(has('a')).toBe(true);
    expect(toggle('a')).toEqual({ ok: true, active: false });
    expect(has('a')).toBe(false);
  });

  test('не більше 4: пʼятий — відмова', () => {
    expect(COMPARE_LIMIT).toBe(4);
    for (const s of ['a', 'b', 'c', 'd']) toggle(s);
    expect(toggle('e')).toEqual({ ok: false, active: false, reason: 'limit' });
    expect(read(KEYS.compare, [])).toEqual(['a', 'b', 'c', 'd']);
  });
});
