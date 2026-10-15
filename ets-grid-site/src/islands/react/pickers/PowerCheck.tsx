/** @jsxImportSource react */
// «Чи вистачить потужності?» (SPEC-004 §3.3, ТЗ §6.1 блок 3, 03 §3.1).
import { useMemo, useState, type ReactNode } from 'react';
import LiveNumber from './LiveNumber';
import { powerCheck, type Calc } from '../../../lib/calc';
import { formatUnit } from '../../../lib/format';
import type { Product } from '../../../lib/schema';
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
  // Ті самі рядки, але обчислені числа — живі (SPEC-004 §3.7): дефіцит, запас, менша AC, ємність накопичувача.
  const kwN = (n: number) => <LiveNumber value={Math.round(n * 10) / 10} unit="кВт" digits={1} />;
  let titleNode: ReactNode = title;
  let textNode: ReactNode = text;
  if (r.outcome === 'ok') {
    textNode = <>Станцію можна підключити напряму. Запас по вводу: {kwN(r.reserveKw!)}.</>;
  } else if (r.outcome === 'ac_deficit') {
    titleNode = <>Не вистачає {kwN(r.deficit)}</>;
    if (r.smallerKw) textNode = <>Варіанти: станція {kwN(r.smallerKw)} з балансуванням навантаження або збільшення потужності за техумовами.</>;
  } else if (r.outcome !== 'none') {
    titleNode = <>Не вистачає {kwN(r.deficit)}</>;
    textNode = (
      <>
        Додаємо накопичувач ≈ <LiveNumber value={r.batteryKwh!} unit="кВт·год" digits={1} />: він заряджається від ваших {kw(gridKw)} між сесіями.
      </>
    );
  }
  const alt = r.batteryStation ? info[r.batteryStation.slug] : null;

  const params = { need_kw: needKw, grid_kw: gridKw, outcome: r.outcome, station: r.station?.slug, battery_kwh: r.batteryKwh };
  usePickerComplete('power', params, touched);

  return (
    <div className="pk" data-picker="power" data-ready={ready ? 'true' : undefined}>
      <form className="pk-form" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="pk-fieldset">
          <legend className="pk-label">Потрібна потужність зарядки</legend>
          <div className="pk-options">
            {calc.power.need_options_kw.map((v) => (
              <label className="pk-option">
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
        <p className="pk-result__title">
          <span aria-hidden="true" className={r.outcome === 'ok' ? 'pk-led' : 'pk-led pk-led--warn'} />
          {titleNode}
        </p>
        <p>{textNode}</p>
        {station && (
          <>
            <p className="pk-result__label">
              Станція: вхід від {kw(Number(r.station!.attrs.input_min_kw))}
            </p>
            <ProductLinks items={[station]} />
          </>
        )}
        {alt && (
          <>
            <p className="pk-result__label">Або станція з накопичувачем — працює від вашого вводу:</p>
            <ProductLinks items={[alt]} />
          </>
        )}
        <Cta label="Отримати розрахунок" picker="power" params={params} />
      </Result>
    </div>
  );
}
