import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import { routes } from '../../src/lib/routes';
import { page } from '../helpers/dist';

describe('SPEC-001/AC-09 «демо-ціна» поруч із демо-цінами в HTML', () => {
  const withPrice = catalog.products.filter((p) => p.demo && (p.price_equipment !== null || p.price_turnkey_from !== null));
  const withoutPrice = catalog.products.filter((p) => p.price_equipment === null && p.price_turnkey_from === null);

  test.each(withPrice.map((p) => p.slug))('%s', (slug) => {
    const price = page(routes.product(slug)).document.querySelector('main .price');
    expect(price?.textContent).toContain('демо-ціна');
  });

  test.each(withoutPrice.map((p) => p.slug))('%s без ціни → «Ціна за розрахунком»', (slug) => {
    const price = page(routes.product(slug)).document.querySelector('main .price');
    expect(price?.textContent).toContain('Ціна за розрахунком');
    expect(price?.textContent).not.toContain('демо-ціна');
  });
});
