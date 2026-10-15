/** @jsxImportSource react */
// Підбірник СЕС: 3 питання ТЗ §7, формула 03 §3.3 (SPEC-004 §3.3).
import { useMemo, useState } from 'react';
import LiveNumber from './LiveNumber';
import { solarSize, type Calc } from '../../../lib/calc';
import { formatNumber, formatPrice, formatUnit } from '../../../lib/format';
import { plural } from '../../../lib/plural';
import type { Product } from '../../../lib/schema';
import { Choice, Cta, NumberSlider, Result, usePickerComplete, useReady } from './shared';

interface Props {
  kits: Product[];
  calc: Calc;
}

export default function SolarPicker({ kits, calc }: Props) {
  const ready = useReady();
  const [purpose, setPurpose] = useState<'home' | 'business'>('home');
  const [monthlyInput, setMonthly] = useState(400);
  const tariff = calc.solar.tariff_uah_per_kwh;
  const [mode, setMode] = useState<'kwh' | 'bill'>('kwh');
  const [bill, setBill] = useState(2000);
  // Рахунок → кВт·год лише коли замовник дав тариф (Q-9); до того — варіант видимий, але неактивний (D-031).
  const monthlyKwh = mode === 'bill' && tariff ? Math.max(calc.solar.monthly_kwh_min, Math.round(bill / tariff)) : monthlyInput;
  const [mount, setMount] = useState<'roof' | 'ground'>('roof');
  const [touched, setTouched] = useState(false);
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setTouched(true);
  };
  const r = useMemo(() => solarSize({ monthlyKwh, purpose, mount }, kits, calc), [monthlyKwh, purpose, mount]);

  const panelsText = `${r.panels} ${plural(r.panels, ['панель', 'панелі', 'панелей'])} по ${formatUnit(calc.solar.panel_w, 'Вт')}`;
  const priceText = r.priceFrom ? `≈ ${formatPrice(r.priceFrom)} під ключ` : 'Ціна за розрахунком';
  const summary = `Потрібна СЕС ${formatUnit(r.kwp, 'kWp')}: ${panelsText}, площа ≈ ${formatUnit(r.areaM2, 'м²')}. ${priceText}`;
  const params = { purpose, monthly_kwh: monthlyKwh, mount, kwp: r.kwp, panels: r.panels };
  usePickerComplete('solar', params, touched);

  return (
    <div className="pk" data-picker="solar" data-ready={ready ? 'true' : undefined}>
      <form className="pk-form" onSubmit={(e) => e.preventDefault()}>
        <Choice
          name="sp-purpose"
          legend="1. Дім чи бізнес"
          value={purpose}
          onChange={touch(setPurpose)}
          options={[
            { value: 'home', label: 'Дім' },
            { value: 'business', label: 'Бізнес' },
          ]}
        />
        <fieldset className="pk-fieldset">
          <legend className="pk-label">2. Як рахуємо споживання</legend>
          <div className="pk-options">
            <label className="pk-option">
              <input type="radio" name="sp-mode" checked={mode === 'kwh'} onChange={() => touch(setMode)('kwh')} />
              <span>кВт·год на місяць</span>
            </label>
            <label className="pk-option" data-bill-option aria-disabled={tariff ? undefined : 'true'}>
              <input
                type="radio"
                name="sp-mode"
                checked={mode === 'bill'}
                disabled={!tariff}
                aria-describedby={tariff ? undefined : 'sp-bill-note'}
                onChange={() => touch(setMode)('bill')}
              />
              <span>Рахунок, ₴</span>
            </label>
          </div>
          {!tariff && (
            <p className="pk-hint" id="sp-bill-note" data-bill-note>
              Тариф надасть замовник — поки рахуємо за кВт·год.
            </p>
          )}
        </fieldset>
        {mode === 'bill' && tariff ? (
          <NumberSlider id="sp-bill" label="Рахунок за місяць" unit="₴" min={100} max={50000} step={50} value={bill} onChange={touch(setBill)} />
        ) : (
          <NumberSlider
            id="sp-monthly"
            label="Споживання на місяць"
            unit="кВт·год"
            min={calc.solar.monthly_kwh_min}
            max={calc.solar.monthly_kwh_max}
            step={10}
            value={monthlyInput}
            onChange={touch(setMonthly)}
          />
        )}
        <Choice
          name="sp-mount"
          legend="3. Де ставимо панелі"
          value={mount}
          onChange={touch(setMount)}
          options={[
            { value: 'roof', label: 'Дах' },
            { value: 'ground', label: 'Земля' },
          ]}
        />
      </form>

      <Result summary={summary}>
        <p className="pk-result__title">
          <span className="pk-big"><LiveNumber value={r.kwp} digits={1} /></span> kWp
        </p>
        <ul className="pk-facts" role="list">
          <li>
            <LiveNumber value={r.panels} /> {plural(r.panels, ['панель', 'панелі', 'панелей'])} по {formatUnit(calc.solar.panel_w, 'Вт')}
          </li>
          <li>Площа ≈ <LiveNumber value={r.areaM2} unit="м²" digits={1} />{mount === 'roof' ? ' даху' : ' ділянки'}</li>
          <li>
            {r.priceFrom ? (
              <>
                ≈ <LiveNumber value={r.priceFrom} unit="₴" digits={0} /> під ключ
              </>
            ) : (
              priceText
            )}
            {r.priceFrom && r.priceDemo && <span className="pk-demo">демо-ціна</span>}
          </li>
        </ul>
        <Cta label="Отримати розрахунок" picker="solar" params={params} />
      </Result>
    </div>
  );
}
