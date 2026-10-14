/** @jsxImportSource preact */
// Підбірник зарядних станцій: 3 питання ТЗ §7 (SPEC-004 §3.3).
import { useMemo, useState } from 'preact/hooks';
import { chargingPicker, type Calc, type Where } from '../../lib/calc';
import type { Car } from '../../lib/filters';
import { formatUnit } from '../../lib/format';
import type { Product } from '../../lib/schema';
import { Choice, Cta, NumberSlider, ProductLinks, Result, usePickerComplete, useReady, type ProductInfo } from './shared';

interface Props {
  stations: Product[];
  info: Record<string, ProductInfo>;
  cars: Car[];
  connectors: [string, string][];
  calc: Calc;
}

export default function ChargingPicker({ stations, info, cars, connectors, calc }: Props) {
  const ready = useReady();
  const [where, setWhere] = useState<Where>('home');
  const [mode, setMode] = useState<'connector' | 'car'>('connector');
  const [connector, setConnector] = useState('type2');
  const [carId, setCarId] = useState(cars[0]?.id ?? '');
  const [phases, setPhases] = useState<1 | 3>(3);
  const [gridKw, setGrid] = useState(15);
  const [touched, setTouched] = useState(false);
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setTouched(true);
  };

  const r = useMemo(
    () => chargingPicker({ where, connector: mode === 'connector' ? connector : null, carId: mode === 'car' ? carId : null, phases, gridKw }, stations, cars, calc),
    [where, mode, connector, carId, phases, gridKw],
  );

  const kw = (n: number) => formatUnit(Math.round(n * 10) / 10, 'кВт');
  const fits = r.fits.map((p) => info[p.slug]).filter(Boolean);
  const more = r.needsMore;
  const title = fits.length
    ? `Підходить ${fits.length === 1 ? '1 станція' : `${fits.length} станції`}`
    : more
      ? `Мережі не вистачає`
      : 'Готової моделі немає';
  let moreText = '';
  if (more) {
    const c = more.check;
    moreText =
      c.outcome === 'dc_deficit'
        ? `${more.station.name} потребує вводу від ${kw(Number(more.station.attrs.input_min_kw))}: бракує ${kw(c.deficit)}, додаємо накопичувач ≈ ${formatUnit(c.batteryKwh!, 'кВт·год')}.`
        : `${more.station.name} потребує вводу від ${kw(Number(more.station.attrs.input_min_kw))}: бракує ${kw(c.deficit)} — балансування або збільшення потужності за техумовами.`;
  }
  const summary = [title, fits.map((f) => f.name).join(', '), moreText].filter(Boolean).join('. ');

  const params = {
    where,
    connector: mode === 'connector' ? connector : null,
    car: mode === 'car' ? carId : null,
    phases,
    grid_kw: gridKw,
    result: r.fits.map((p) => p.slug).join(','),
    battery_kwh: more?.check.batteryKwh ?? null,
  };
  usePickerComplete('charging', params, touched);

  return (
    <div class="pk" data-picker="charging" data-ready={ready ? 'true' : undefined}>
      <form class="pk-form" onSubmit={(e) => e.preventDefault()}>
        <Choice
          name="cp-where"
          legend="1. Де заряджати"
          value={where}
          onChange={touch(setWhere)}
          options={[
            { value: 'home', label: 'Дім' },
            { value: 'business', label: 'Бізнес / паркінг' },
            { value: 'highway', label: 'Траса / АЗС' },
          ]}
        />
        <fieldset class="pk-fieldset">
          <legend class="pk-label">2. Ваше авто або розʼєм</legend>
          <div class="pk-options">
            <label class="pk-option">
              <input type="radio" name="cp-mode" checked={mode === 'connector'} onChange={() => touch(setMode)('connector')} />
              <span>Знаю розʼєм</span>
            </label>
            <label class="pk-option">
              <input type="radio" name="cp-mode" checked={mode === 'car'} onChange={() => touch(setMode)('car')} />
              <span>Оберу авто</span>
            </label>
          </div>
          {mode === 'connector' ? (
            <label class="pk-select">
              <span class="pk-vh">Розʼєм</span>
              <select value={connector} onChange={(e) => touch(setConnector)((e.target as HTMLSelectElement).value)}>
                {connectors.map(([v, l]) => (
                  <option value={v}>{l}</option>
                ))}
              </select>
            </label>
          ) : (
            <label class="pk-select">
              <span class="pk-vh">Авто</span>
              <select value={carId} onChange={(e) => touch(setCarId)((e.target as HTMLSelectElement).value)}>
                {cars.map((c) => (
                  <option value={c.id}>
                    {c.brand} {c.model}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>
        <Choice
          name="cp-phases"
          legend="3. Скільки фаз на вводі"
          value={phases}
          onChange={touch(setPhases)}
          options={[
            { value: 1, label: '1 фаза' },
            { value: 3, label: '3 фази' },
          ]}
        />
        <NumberSlider
          id="cp-grid"
          label="Доступна потужність вводу"
          unit="кВт"
          min={calc.power.grid_min_kw}
          max={calc.power.grid_max_kw}
          value={gridKw}
          onChange={touch(setGrid)}
        />
      </form>

      <Result summary={summary} tone={fits.length ? 'ok' : more ? 'warn' : 'neutral'}>
        <p class="pk-result__title">{title}</p>
        <ProductLinks items={fits} />
        {more && <p>{moreText}</p>}
        {!fits.length && !more && <p>Під ваші умови готової моделі немає — підберемо індивідуально.</p>}
        <Cta label="Отримати розрахунок" picker="charging" params={params} />
      </Result>
    </div>
  );
}
