/** @jsxImportSource react */
// Спільні частини підбірників (SPEC-004 §3.3).
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { clamp } from '../../../lib/calc/formulas';
import { formatNumber } from '../../../lib/format';
import { routes } from '../../../lib/routes';
import { track } from '../../../lib/track';
import './pickers.css';

export interface ProductInfo {
  slug: string;
  name: string;
  url: string;
  price: string;
}

export const DISCLAIMER = 'Оцінка орієнтовна. Точний розрахунок — після обстеження.';

/** Повзунок + числове поле, синхронні; значення поза межами притискається до межі. */
export function NumberSlider(props: {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const { id, label, unit, min, max, step = 1, value, onChange } = props;
  const [draft, setDraft] = useState(String(value));
  const [hint, setHint] = useState(false);
  useEffect(() => setDraft(String(value)), [value]);

  const commit = (raw: string) => {
    const n = Number(raw.replace(',', '.'));
    const next = clamp(Math.round(n / step) * step, min, max);
    setHint(!Number.isFinite(n) || n < min || n > max);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <div className="pk-slider">
      <label className="pk-label" htmlFor={`${id}-num`}>
        {unit ? `${label}, ${unit}` : label}
      </label>
      <div className="pk-slider__row">
        <input
          type="range"
          id={`${id}-range`}
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={`${label}, повзунок`}
          onChange={(e) => commit(e.target.value)}
        />
        <input
          type="number"
          id={`${id}-num`}
          className="pk-number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={draft}
          // React onChange = подія input: чернетка; підтвердження — на blur і Enter (як change у Preact).
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
          }}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      </div>
      {hint && (
        <p className="pk-hint" id={`${id}-hint`}>
          Від {formatNumber(min)} до {formatNumber(max)}
          {unit ? ` ${unit}` : ''}
        </p>
      )}
    </div>
  );
}

/** Група варіантів-радіокнопок. */
export function Choice<T extends string | number>(props: {
  name: string;
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="pk-fieldset">
      <legend className="pk-label">{props.legend}</legend>
      <div className="pk-options">
        {props.options.map((o) => (
          <label className="pk-option">
            <input
              type="radio"
              name={props.name}
              value={String(o.value)}
              checked={o.value === props.value}
              onChange={() => props.onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Блок результату: role=status, оголошення не частіше ніж раз на 300 мс. */
export function Result(props: { summary: string; tone?: 'ok' | 'warn' | 'neutral'; children?: ReactNode }) {
  const [announced, setAnnounced] = useState(props.summary);
  useEffect(() => {
    const t = setTimeout(() => setAnnounced(props.summary), 300);
    return () => clearTimeout(t);
  }, [props.summary]);
  return (
    <div className={`pk-result pk-result--${props.tone ?? 'neutral'}`}>
      <p className="pk-vh" role="status" aria-live="polite">
        {announced}
      </p>
      {props.children}
      <p className="pk-disclaimer">{DISCLAIMER}</p>
    </div>
  );
}

export function ProductLinks(props: { items: ProductInfo[] }) {
  if (props.items.length === 0) return null;
  return (
    <ul className="pk-products" role="list">
      {props.items.map((p) => (
        <li>
          <a href={p.url}>{p.name}</a>
          <span className="pk-products__price">{p.price}</span>
        </li>
      ))}
    </ul>
  );
}

/** picker_complete — один раз, після першої зміни відповіді користувачем (значення за замовчуванням не рахуються). */
export function usePickerComplete(picker: string, params: Record<string, unknown>, touched: boolean) {
  const sent = useRef(false);
  useEffect(() => {
    if (touched && !sent.current) {
      sent.current = true;
      track('picker_complete', { picker, ...params });
    }
  }, [touched]);
}

/** Острів гідратований — мітка для тестів і стилів. */
export function useReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

export function Cta(props: { label: string; picker: string; params: Record<string, string | number | boolean | null | undefined>; disabled?: boolean }) {
  const href = routes.quoteWith({ picker: props.picker, ...props.params });
  if (props.disabled) {
    return (
      <span className="btn pk-cta" aria-disabled="true">
        {props.label}
      </span>
    );
  }
  return (
    <a className="btn btn--primary pk-cta" href={href} onClick={() => track('picker_complete', { picker: props.picker, ...props.params, via: 'cta' })}>
      {props.label}
    </a>
  );
}
