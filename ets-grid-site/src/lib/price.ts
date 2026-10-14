// Правила показу ціни (SPEC-001 §3.5). Компонент Price лише рендерить результат.
import { formatPrice } from './format';

export interface PriceInput {
  sale_mode: 'cart' | 'quote';
  price_equipment: number | null;
  price_turnkey_from: number | null;
  demo: boolean;
}

export interface PriceView {
  /** Головна строка ціни. */
  primary: string;
  /** Друга строка: «з монтажем від …» або null. */
  secondary: string | null;
  /** Показати мітку «демо-ціна». */
  demo: boolean;
  /** Ціни немає, тільки «Ціна за розрахунком». */
  onRequest: boolean;
}

export function priceView(p: PriceInput): PriceView {
  const equipment = formatPrice(p.price_equipment);
  const turnkey = formatPrice(p.price_turnkey_from);

  if (equipment) {
    return {
      primary: equipment,
      secondary: turnkey ? `з монтажем від ${turnkey}` : null,
      demo: p.demo,
      onRequest: false,
    };
  }
  if (turnkey) {
    return { primary: `під ключ від ${turnkey}`, secondary: null, demo: p.demo, onRequest: false };
  }
  return { primary: 'Ціна за розрахунком', secondary: null, demo: false, onRequest: true };
}
