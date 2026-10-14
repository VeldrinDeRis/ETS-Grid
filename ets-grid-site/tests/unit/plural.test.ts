import { describe, expect, test } from 'vitest';
import { plural } from '../../src/lib/plural';

const forms = ['товар', 'товари', 'товарів'] as const;

describe('SPEC-002/AC-07 українські форми множини', () => {
  test.each([
    [0, 'товарів'],
    [1, 'товар'],
    [2, 'товари'],
    [4, 'товари'],
    [5, 'товарів'],
    [11, 'товарів'],
    [12, 'товарів'],
    [14, 'товарів'],
    [21, 'товар'],
    [22, 'товари'],
    [25, 'товарів'],
    [101, 'товар'],
    [111, 'товарів'],
  ])('%i → %s', (n, expected) => {
    expect(plural(n, forms)).toBe(expected);
  });
});
