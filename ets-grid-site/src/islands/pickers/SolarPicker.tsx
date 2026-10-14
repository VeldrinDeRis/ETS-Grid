/** @jsxImportSource preact */
// Підбірник СЕС: 3 питання ТЗ §7, формула 03 §3.3 (SPEC-004 §3.3).
import { useMemo, useState } from 'preact/hooks';
import { solarSize, type Calc } from '../../lib/calc';
import { formatNumber, formatPrice, formatUnit } from '../../lib/format';
import { plural } from '../../lib/plural';
import type { Product } from '../../lib/schema';
import { Choice, Cta, NumberSlider, Result, usePickerComplete, useReady } from './shared';

interface Props {
  kits: Product[];
  calc: Calc;
}

export default function SolarPicker({ kits, calc }: Props) {
  const ready = useReady();
  const [purpose, setPurpose] = useState<'home' | 'business'>('home');
  const [monthlyKwh, setMonthly] = useState(400);
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
    <div class="pk" data-picker="solar" data-ready={ready ? 'true' : undefined}>
      <form class="pk-form" onSubmit={(e) => e.preventDefault()}>
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
        <NumberSlider
          id="sp-monthly"
          label="2. Споживання на місяць"
          unit="кВт·год"
          min={calc.solar.monthly_kwh_min}
          max={calc.solar.monthly_kwh_max}
          step={10}
          value={monthlyKwh}
          onChange={touch(setMonthly)}
        />
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
        <p class="pk-result__title">
          <span class="pk-big">{formatNumber(r.kwp)}</span> kWp
        </p>
        <ul class="pk-facts" role="list">
          <li>{panelsText}</li>
          <li>Площа ≈ {formatUnit(r.areaM2, 'м²')}{mount === 'roof' ? ' даху' : ' ділянки'}</li>
          <li>
            {priceText}
            {r.priceFrom && r.priceDemo && <span class="pk-demo">демо-ціна</span>}
          </li>
        </ul>
        <Cta label="Отримати розрахунок" picker="solar" params={params} />
      </Result>
    </div>
  );
}
