// Фікстури для тестів логіки цін (D-023 правило 6): окремо від src/data/catalog.json,
// щоб заміна демо-каталогу не ламала тести.
import type { PriceInput } from '../../src/lib/price';

export const homeAc: PriceInput = {
  sale_mode: 'cart',
  price_equipment: 24900,
  price_turnkey_from: 32900,
  demo: true,
};

export const portable: PriceInput = {
  sale_mode: 'cart',
  price_equipment: 11900,
  price_turnkey_from: null,
  demo: true,
};

export const dcQuote: PriceInput = {
  sale_mode: 'quote',
  price_equipment: null,
  price_turnkey_from: 780000,
  demo: true,
};

export const bessNoPrice: PriceInput = {
  sale_mode: 'quote',
  price_equipment: null,
  price_turnkey_from: null,
  demo: true,
};

export const realPrice: PriceInput = {
  sale_mode: 'cart',
  price_equipment: 24900,
  price_turnkey_from: 32900,
  demo: false,
};
