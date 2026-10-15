/** @jsxImportSource react */
// Живе число (SPEC-004 §3.7, SPEC-006 §4.9 акт II; D-045, D-055): розряди докручуються до нового значення — AnimateNumber з Motion+.
// Контракт зі скриптом сторінки — DOM: острів слухає подію `etsgrid:node-lit` ({ on }) на найближчому [data-node];
// поки вузол не ввімкнено, показує `from`. Розряди — aria-hidden, для читача поруч прихований текст із тим самим
// форматом (SPEC-004 §3.7). Острів client:only; статичне число для без-JS рендерить Astro (ховається за [data-live]).
import { AnimateNumber } from '@motionplus/core/react';
import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../lib/format';

interface Props {
  value: number;
  digits?: number;
  from?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LiveNumber({ value, digits = 0, from = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>('[data-node]');
    host?.setAttribute('data-live', '');
    if (document.documentElement.dataset.motion !== 'on' || !host) return;
    setShown(host.hasAttribute('data-lit') ? value : from);
    const onLit = (e: Event) => setShown((e as CustomEvent<{ on: boolean }>).detail?.on ? value : from);
    host.addEventListener('etsgrid:node-lit', onLit);
    return () => host.removeEventListener('etsgrid:node-lit', onLit);
  }, [value, from]);

  return (
    <span ref={ref} className="live-number" data-live-number={value}>
      <span className="visually-hidden">{formatNumber(Number(value.toFixed(digits)))}</span>
      <AnimateNumber
        aria-hidden="true"
        locales="uk-UA"
        format={{ minimumFractionDigits: digits, maximumFractionDigits: digits }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {shown}
      </AnimateNumber>
    </span>
  );
}
