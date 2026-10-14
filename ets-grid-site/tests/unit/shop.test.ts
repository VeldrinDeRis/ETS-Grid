import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { add, clear, items, remove, setQty, setTurnkey, totals } from '../../src/lib/cart';
import { clear as clearCompare, list as compareList, remove as compareRemove, toggle, COMPARE_CHANGE_EVENT } from '../../src/lib/compare';
import { buildOrder, orderId, validateCheckout } from '../../src/lib/order';
import { list as recentList, push, RECENT_LIMIT } from '../../src/lib/recent';
import { buildSearchIndex, search } from '../../src/lib/search';
import { CART_CHANGE_EVENT, KEYS } from '../../src/lib/storage';
import { filters, products } from '../fixtures/catalog';
import structureJson from '../../src/data/structure.json';
import type { Structure } from '../../src/lib/schema';

const structure = structureJson as Structure;

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

describe('SPEC-005/AC-01 кошик', () => {
  test('setQty, межі 1–99, подія', () => {
    add('ets-home-7', true);
    setQty('ets-home-7', true, 5);
    expect(items()).toEqual([{ slug: 'ets-home-7', qty: 5, turnkey: true }]);
    setQty('ets-home-7', true, 0);
    expect(items()[0].qty).toBe(1);
    setQty('ets-home-7', true, 500);
    expect(items()[0].qty).toBe(99);
    expect(events.every((e) => e === CART_CHANGE_EVENT)).toBe(true);
  });

  test('setTurnkey зливає позиції, якщо така вже є', () => {
    add('ets-home-7', false);
    add('ets-home-7', true);
    setTurnkey('ets-home-7', false, true);
    expect(items()).toEqual([{ slug: 'ets-home-7', qty: 2, turnkey: true }]);
  });

  test('remove і clear', () => {
    add('ets-home-7', false);
    add('panel-550-topcon', false);
    remove('ets-home-7', false);
    expect(items().map((i) => i.slug)).toEqual(['panel-550-topcon']);
    clear();
    expect(items()).toEqual([]);
    expect(localStorage.getItem(KEYS.cart)).toBe('[]');
  });

  test('totals: ETS Home 7 × 1 з монтажем', () => {
    expect(totals([{ slug: 'ets-home-7', qty: 1, turnkey: true }], products)).toEqual({
      equipment: 24900,
      installation: 8000,
      total: 32900,
      demo: true,
      unavailable: [],
    });
  });

  test('totals: Home 7 × 2 без монтажу + панелі × 10', () => {
    expect(
      totals(
        [
          { slug: 'ets-home-7', qty: 2, turnkey: false },
          { slug: 'panel-550-topcon', qty: 10, turnkey: false },
        ],
        products,
      ),
    ).toMatchObject({ equipment: 91800, installation: 0, total: 91800 });
  });

  test('товар, якого більше немає, — у unavailable і не в сумі', () => {
    expect(totals([{ slug: 'net-takoho', qty: 1, turnkey: false }], products)).toMatchObject({ total: 0, unavailable: ['net-takoho'] });
  });
});

describe('SPEC-005/AC-02 порівняння', () => {
  test('remove, clear, подія etsgrid:compare-change', () => {
    toggle('a');
    toggle('b');
    compareRemove('a');
    expect(compareList()).toEqual(['b']);
    clearCompare();
    expect(compareList()).toEqual([]);
    expect(events).toContain(COMPARE_CHANGE_EVENT);
    expect(COMPARE_CHANGE_EVENT).toBe('etsgrid:compare-change');
  });

  test('recent.push: без дублів, свіжий — першим, до 8', () => {
    for (let i = 1; i <= 10; i++) push(`p-${i}`);
    push('p-5');
    const list = recentList();
    expect(list).toHaveLength(RECENT_LIMIT);
    expect(list[0]).toBe('p-5');
    expect(new Set(list).size).toBe(list.length);
  });
});

describe('SPEC-005/AC-03 пошук', () => {
  const index = buildSearchIndex(products, structure, filters);
  const found = (q: string) => search(index, q).map((r) => r.slug);

  test('«ets home» → 3 домашні станції', () => {
    expect(found('ets home').sort()).toEqual(['ets-home-11-gbt', 'ets-home-22', 'ets-home-7']);
  });

  test('«gbt» → товари з GB/T', () => {
    expect(found('gbt').sort()).toEqual(['cable-gbt-type2', 'ets-dc-240-split', 'ets-dc-60', 'ets-home-11-gbt']);
  });

  test('«GB/T» і «gb/t» — те саме', () => {
    expect(found('GB/T').sort()).toEqual(found('gbt').sort());
  });

  test('«інвертр» (пропущена буква) → гібридний інвертор', () => {
    expect(found('інвертр')).toEqual(['inverter-hybrid-10']);
  });

  test('порожній запит — порожньо', () => {
    expect(found('')).toEqual([]);
    expect(found('   ')).toEqual([]);
  });

  test('категорії теж знаходяться (для підказок)', () => {
    const results = search(index, 'батар');
    expect(results.some((r) => r.kind === 'category')).toBe(true);
  });
});

describe('SPEC-005/AC-04 замовлення', () => {
  test('orderId: ETS-ГГГГММДД-XXXX', () => {
    expect(orderId(new Date('2026-10-14T10:00:00Z'), () => 0.3)).toMatch(/^ETS-20261014-[A-Z0-9]{4}$/);
  });

  test('validateCheckout: обовʼязкові поля за способом доставки й оплати', () => {
    expect(validateCheckout({ name: '', phone: '', delivery: 'np_branch', city: '', branch: '', payment: 'card' })).toEqual({
      name: 'Вкажіть імʼя',
      phone: 'Вкажіть номер телефону',
      city: 'Вкажіть місто',
      branch: 'Вкажіть номер відділення',
    });
    expect(validateCheckout({ name: 'Олена', phone: '0671234567', delivery: 'pickup', payment: 'invoice', company: '', edrpou: '123' })).toEqual({
      company: 'Вкажіть назву компанії',
      edrpou: 'ЄДРПОУ — 8 цифр',
    });
    expect(validateCheckout({ name: 'Олена', phone: '0671234567', email: 'not-email', delivery: 'pickup', payment: 'cod' })).toEqual({
      email: 'Перевірте адресу пошти',
    });
    expect(validateCheckout({ name: 'Олена', phone: '0671234567', delivery: 'install', city: 'Київ', address: '', payment: 'card' })).toEqual({
      address: 'Вкажіть адресу',
    });
  });

  test('buildOrder: контракт §3.5', () => {
    const order = buildOrder({
      fields: { name: ' Олена ', phone: '067 123 45 67', email: '', delivery: 'np_branch', city: 'Київ', branch: '12', payment: 'card' },
      items: [{ slug: 'ets-home-7', qty: 1, turnkey: true }],
      products,
      sourceUrl: '/oformlennya/',
      utm: null,
      now: new Date('2026-10-14T10:00:00Z'),
      random: () => 0.5,
    });
    expect(order).toMatchObject({
      type: 'order',
      customer: { name: 'Олена', phone: '+380671234567', email: null },
      delivery: { method: 'np_branch', city: 'Київ', branch: '12', address: null },
      payment: { method: 'card', company: null, edrpou: null },
      items: [{ slug: 'ets-home-7', qty: 1, turnkey: true, price_equipment: 24900, price_turnkey_from: 32900, demo: true }],
      totals: { equipment: 24900, installation: 8000, total: 32900 },
      source_url: '/oformlennya/',
    });
    expect(order.id).toMatch(/^ETS-20261014-/);
  });
});
