/** @jsxImportSource preact */
// «Чи вистачить потужності?» (SPEC-004 §3.3, ТЗ §6.1 блок 3, 03 §3.1).
import { useMemo, useState } from 'preact/hooks';
import { powerCheck, type Calc } from '../../lib/calc';
import { formatUnit } from '../../lib/format';
import type { Product } from '../../lib/schema';
import { Cta, NumberSlider, ProductLinks, Result, usePickerComplete, useReady, type ProductInfo } from './shared';

interface Props {
  stations: Product[];
  info: Record<string, ProductInfo>;
  calc: Calc;
  idPrefix?: string;
}

export default function PowerCheck({ stations, info, calc, idPrefix = 'pc' }: Props) {
  const ready = useReady();
  const [needKw, setNeed] = useState(60);
  const [gridKw, setGrid] = useState(50);
  const [touched, setTouched] = useState(false);
  const r = useMemo(() => powerCheck({ needKw, gridKw }, stations, calc), [needKw, gridKw]);

  const kw = (n: number) => formatUnit(Math.round(n * 10) / 10, 'кВт');
  const station = r.station ? info[r.station.slug] : null;
  let title = '';
  let text = '';
  if (r.outcome === 'none') {
    title = 'Готової станції немає';
    text = 'Під таку потужність підберемо рішення індивідуально.';
  } else if (r.outcome === 'ok') {
    title = 'Мережі вистачає';
    text = `Станцію можна підключити напряму. Запас по вводу: ${kw(r.reserveKw!)}.`;
  } else if (r.outcome === 'ac_deficit') {
    title = `Не вистачає ${kw(r.deficit)}`;
    text = r.smallerKw
      ? `Варіанти: станція ${kw(r.smallerKw)} з балансуванням навантаження або збільшення потужності за техумовами.`
      : 'Потрібне збільшення потужності за техумовами — допоможемо з проєктом.';
  } else {
    title = `Не вистачає ${kw(r.deficit)}`;
    text = `Додаємо накопичувач ≈ ${formatUnit(r.batteryKwh!, 'кВт·год')}: він заряджається від ваших ${kw(gridKw)} між сесіями.`;
  }
  const summary = `${title}. ${text}`;
  const alt = r.batteryStation ? info[r.batteryStation.slug] : null;

  const params = { need_kw: needKw, grid_kw: gridKw, outcome: r.outcome, station: r.station?.slug, battery_kwh: r.batteryKwh };
  usePickerComplete('power', params, touched);

  return (
    <div class="pk" data-picker="power" data-ready={ready ? 'true' : undefined}>
      <form class="pk-form" onSubmit={(e) => e.preventDefault()}>
        <fieldset class="pk-fieldset">
          <legend class="pk-label">Потрібна потужність зарядки</legend>
          <div class="pk-options">
            {calc.power.need_options_kw.map((v) => (
              <label class="pk-option">
                <input
                  type="radio"
                  name={`${idPrefix}-need`}
                  value={v}
                  checked={v === needKw}
                  onChange={() => {
                    setNeed(v);
                    setTouched(true);
                  }}
                />
                <span>{formatUnit(v, 'кВт')}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <NumberSlider
          id={`${idPrefix}-grid`}
          label="Доступна потужність вводу"
          unit="кВт"
          min={calc.power.grid_min_kw}
          max={calc.power.grid_max_kw}
          value={gridKw}
          onChange={(v) => {
            setGrid(v);
            setTouched(true);
          }}
        />
      </form>

      <Result summary={summary} tone={r.outcome === 'ok' ? 'ok' : r.outcome === 'none' ? 'neutral' : 'warn'}>
        <p class="pk-result__title">
          <span aria-hidden="true" class={r.outcome === 'ok' ? 'pk-led' : 'pk-led pk-led--warn'} />
          {title}
        </p>
        <p>{text}</p>
        {station && (
          <>
            <p class="pk-result__label">
              Станція: вхід від {kw(Number(r.station!.attrs.input_min_kw))}
            </p>
            <ProductLinks items={[station]} />
          </>
        )}
        {alt && (
          <>
            <p class="pk-result__label">Або станція з накопичувачем — працює від вашого вводу:</p>
            <ProductLinks items={[alt]} />
          </>
        )}
        <Cta label="Отримати розрахунок" picker="power" params={params} />
      </Result>
    </div>
  );
}
