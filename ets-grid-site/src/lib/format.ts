// Українське форматування чисел, цін і одиниць (SPEC-001 §3.8).

export const NBSP = ' ';

const numberFormat = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 });

export type Unit = 'кВт' | 'кВт·год' | 'Вт' | 'kWp' | 'В' | 'м²' | 'год';

/** Групи розрядів через U+00A0, дробова частина через кому. */
export function formatNumber(n: number): string {
  return numberFormat.format(n).replace(/[\s  ]/g, NBSP);
}

export function formatPrice(n: number | null): string | null {
  return n === null ? null : `${formatNumber(n)}${NBSP}₴`;
}

export function formatUnit(n: number, unit: Unit): string {
  return `${formatNumber(n)}${NBSP}${unit}`;
}
