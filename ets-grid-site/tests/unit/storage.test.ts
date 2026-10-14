import { afterEach, describe, expect, test, vi } from 'vitest';
import { cartCount, KEYS, read, write } from '../../src/lib/storage';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => (data.has(k) ? data.get(k)! : null),
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

function throwingStorage(): Storage {
  const fail = () => {
    throw new DOMException('denied', 'SecurityError');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail } as Storage;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SPEC-001/AC-10 сховище з try/catch', () => {
  test('читає збережене значення', () => {
    vi.stubGlobal('localStorage', memoryStorage({ [KEYS.palette]: '"b"' }));
    expect(read(KEYS.palette, 'a')).toBe('b');
  });

  test('немає ключа → fallback', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    expect(read(KEYS.palette, 'a')).toBe('a');
  });

  test('зіпсований JSON → fallback без винятку', () => {
    vi.stubGlobal('localStorage', memoryStorage({ [KEYS.cart]: '{не json' }));
    expect(read(KEYS.cart, [])).toEqual([]);
  });

  test('localStorage кидає виняток → read повертає fallback, write не кидає', () => {
    vi.stubGlobal('localStorage', throwingStorage());
    expect(read(KEYS.cart, [])).toEqual([]);
    expect(() => write(KEYS.cart, [])).not.toThrow();
    expect(write(KEYS.cart, [])).toBe(false);
  });

  test('localStorage відсутній → fallback', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(read(KEYS.palette, 'a')).toBe('a');
    expect(write(KEYS.palette, 'b')).toBe(false);
  });

  test('write → read повертає те саме', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    expect(write(KEYS.compare, ['ets-home-7'])).toBe(true);
    expect(read(KEYS.compare, [])).toEqual(['ets-home-7']);
  });

  test('ключі мають версію або фіксовану назву з контракту', () => {
    expect(KEYS).toEqual({
      cart: 'etsgrid:cart:v1',
      compare: 'etsgrid:compare:v1',
      palette: 'etsgrid:palette',
    });
  });
});

describe('SPEC-001/AC-17 лічильник кошика: логіка підрахунку', () => {
  test('сума qty', () => {
    expect(
      cartCount([
        { slug: 'ets-home-7', qty: 2, turnkey: true },
        { slug: 'ets-home-22', qty: 1, turnkey: false },
      ]),
    ).toBe(3);
  });

  test.each([[null], [undefined], ['рядок'], [{}], [[{ slug: 'x', qty: 'два' }]], [[{ slug: 'x', qty: -1 }]]])(
    'некоректне значення %j → 0',
    (value) => {
      expect(cartCount(value)).toBe(0);
    },
  );

  test('некоректні позиції пропускаються, коректні рахуються', () => {
    expect(cartCount([{ slug: 'a', qty: 2, turnkey: false }, { slug: 'b' }, null])).toBe(2);
  });
});
