/** @jsxImportSource react */
// Живе число підбірника (SPEC-004 §3.7, ревізія 2, D-045): розряди докручуються до нового значення — AnimateNumber Motion+.
// Перший показ і prefers-reduced-motion — одразу кінцеве значення звичайним текстом. Розряди aria-hidden,
// поруч візуально прихований текст тим самим форматом (formatNumber / formatUnit / formatPrice) — його читають
// озвучувач і тести; оголошення підсумку — як і раніше в role="status" Result.
import { AnimateNumber } from '@motionplus/core/react';
import { useEffect, useState } from 'react';
import { formatNumber, formatPrice, formatUnit } from '../../../lib/format';

interface Props {
  value: number;
  /** Одиниця: «кВт», «кВт·год», «kWp», «м²», «Вт», «₴» (ціна). Порожня — лише число. */
  unit?: string;
  /** Найбільше знаків після коми (значення округлює острів). */
  digits?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const text = (value: number, unit?: string) => (unit === '₴' ? formatPrice(value) ?? '' : unit ? formatUnit(value, unit as Parameters<typeof formatUnit>[1]) : formatNumber(value));

export default function LiveNumber({ value, unit, digits = 2 }: Props) {
  const [live, setLive] = useState(false);
  // Після першої відмальовки й лише з рухом: так перший показ — кінцеве значення без прокрутки від нуля.
  useEffect(() => setLive(document.documentElement.dataset.motion === 'on'), []);
  const full = text(value, unit);
  if (!live) return <span className="pk-num">{full}</span>;
  const suffix = unit ? ` ${unit}` : '';
  return (
    <span className="pk-num" data-live-value={full}>
      <span className="pk-vh">{full}</span>
      <span aria-hidden="true">
        <AnimateNumber locales="uk-UA" format={{ maximumFractionDigits: digits }} transition={{ duration: 0.45, ease: EASE }}>
          {value}
        </AnimateNumber>
        {suffix}
      </span>
    </span>
  );
}
