/** @jsxImportSource react */
// Підбірник батарей: 3 питання ТЗ §7, формула 03 §3.2; «вікна загоряються» (концепція §4.1, H-011).
import { animate } from '../../../lib/motion-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import LiveNumber from './LiveNumber';
import { batteryPicker, type Calc } from '../../../lib/calc';
import { formatUnit } from '../../../lib/format';
import { plural } from '../../../lib/plural';
import type { Product } from '../../../lib/schema';
import { Choice, Cta, NumberSlider, ProductLinks, Result, usePickerComplete, useReady, type ProductInfo } from './shared';

interface Props {
  batteries: Product[];
  info: Record<string, ProductInfo>;
  calc: Calc;
}

const WINDOWS = 6;

function House({ lit }: { lit: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    svg.querySelectorAll<SVGRectElement>('[data-window]').forEach((w, i) => {
      const target = i < lit ? 1 : 0.12;
      if (reduce) w.style.opacity = String(target);
      else animate(w, { opacity: target }, { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] });
    });
  }, [lit]);
  const cells = Array.from({ length: WINDOWS }, (_, i) => ({ x: 30 + (i % 3) * 34, y: 58 + Math.floor(i / 3) * 30 }));
  return (
    <svg ref={ref} className="pk-house" viewBox="0 0 160 130" width="160" height="130" aria-hidden="true">
      <path d="M10 60 L80 12 L150 60 V122 H10 Z" fill="var(--color-surface)" stroke="currentColor" strokeWidth="2" />
      {cells.map((c, i) => (
        <rect data-window x={c.x} y={c.y} width="22" height="18" rx="2" fill="var(--color-accent)" style={{ opacity: i < lit ? 1 : 0.12 }} />
      ))}
    </svg>
  );
}

export default function BatteryPicker({ batteries, info, calc }: Props) {
  const ready = useReady();
  const [loads, setLoads] = useState<string[]>(['light_internet', 'fridge']);
  const [hours, setHours] = useState(12);
  const [hasSolar, setHasSolar] = useState<'yes' | 'no'>('no');
  const [touched, setTouched] = useState(false);
  const r = useMemo(() => batteryPicker({ loads, hours, hasSolar: hasSolar === 'yes' }, batteries, calc), [loads, hours, hasSolar]);

  const toggleLoad = (id: string) => {
    setLoads((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
    setTouched(true);
  };
  const hoursText = r.hoursWithIt ? `≈ ${Math.round(r.hoursWithIt)} ${plural(Math.round(r.hoursWithIt), ['година', 'години', 'годин'])} світла` : '';
  const product = r.product ? info[r.product.slug] : null;
  const lit = r.hoursWithIt ? Math.min(WINDOWS, Math.ceil(r.hoursWithIt / 4)) : 0;

  let summary = 'Оберіть, що має працювати';
  if (r.loadW > 0) {
    summary = product
      ? `${hoursText}. Потрібно ${formatUnit(Math.round(r.neededKwh * 10) / 10, 'кВт·год')}: ${r.modules > 1 ? `${r.modules} модулі ` : ''}${product.name}`
      : `Потрібно ${formatUnit(Math.round(r.neededKwh), 'кВт·год')} — підберемо систему під розрахунок`;
  }
  const params = { loads: loads.join(','), hours, has_solar: hasSolar === 'yes', kwh: Math.round(r.neededKwh * 10) / 10, product: r.product?.slug, modules: r.modules || null };
  usePickerComplete('battery', params, touched && r.loadW > 0);

  return (
    <div className="pk" data-picker="battery" data-ready={ready ? 'true' : undefined}>
      <form className="pk-form" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="pk-fieldset">
          <legend className="pk-label">1. Що має працювати</legend>
          <div className="pk-options">
            {calc.battery.loads.map((l) => (
              <label className="pk-option">
                <input type="checkbox" checked={loads.includes(l.id)} onChange={() => toggleLoad(l.id)} />
                <span>
                  {l.label} <span className="pk-muted">{formatUnit(l.w, 'Вт')}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <NumberSlider
          id="bp-hours"
          label="2. Скільки годин без мережі"
          unit="год"
          min={calc.battery.hours_min}
          max={calc.battery.hours_max}
          value={hours}
          onChange={(v) => {
            setHours(v);
            setTouched(true);
          }}
        />
        <Choice
          name="bp-solar"
          legend="3. Є сонячні панелі?"
          value={hasSolar}
          onChange={(v) => {
            setHasSolar(v);
            setTouched(true);
          }}
          options={[
            { value: 'yes', label: 'Так' },
            { value: 'no', label: 'Ні' },
          ]}
        />
      </form>

      <Result summary={summary} tone={r.loadW === 0 ? 'neutral' : 'ok'}>
        {r.loadW === 0 ? (
          <p className="pk-result__title">Оберіть, що має працювати</p>
        ) : (
          <div className="pk-battery">
            <House lit={lit} />
            <div>
              {product && r.hoursWithIt ? (
                <p className="pk-result__title">
                  ≈ <LiveNumber value={Math.round(r.hoursWithIt)} /> {plural(Math.round(r.hoursWithIt), ['година', 'години', 'годин'])} світла
                </p>
              ) : null}
              <ul className="pk-facts" role="list">
                <li>Навантаження: <LiveNumber value={r.loadW} unit="Вт" digits={0} /></li>
                <li>Потрібна ємність: <LiveNumber value={Math.round(r.neededKwh * 10) / 10} unit="кВт·год" digits={1} /></li>
                {product && r.modules > 1 && (
                  <li>
                    <LiveNumber value={r.modules} /> модулі по {formatUnit(Number(r.product!.attrs.capacity_kwh), 'кВт·год')} = <LiveNumber value={Math.round(r.totalKwh * 100) / 100} unit="кВт·год" />
                  </li>
                )}
              </ul>
              {product ? <ProductLinks items={[product]} /> : <p>Такої ємності в каталозі немає — підберемо систему під розрахунок.</p>}
              <p className="pk-muted">
                {hasSolar === 'yes'
                  ? 'З панелями батарея заряджається вдень від сонця — перевіримо сумісність інвертора.'
                  : 'Додайте сонячні панелі, щоб батарея заряджалася вдень.'}
              </p>
            </div>
          </div>
        )}
        <Cta label="Отримати розрахунок" picker="battery" params={params} disabled={r.loadW === 0} />
      </Result>
    </div>
  );
}
