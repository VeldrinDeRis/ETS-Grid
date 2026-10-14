/** @jsxImportSource preact */
// Конфігуратор Solar Carport: 3 питання ТЗ §7, формула 03 §3.4 (SPEC-004 §3.3, H-012).
import { useMemo, useState } from 'preact/hooks';
import { carportConfig, type Calc } from '../../lib/calc';
import { formatNumber, formatUnit } from '../../lib/format';
import type { Product } from '../../lib/schema';
import { Choice, Cta, NumberSlider, ProductLinks, Result, usePickerComplete, useReady, type ProductInfo } from './shared';

interface Props {
  carports: Product[];
  info: Record<string, ProductInfo>;
  calc: Calc;
  /** mini — лише кількість місць, розрахунок із зарядками й накопичувачем (головна, SPEC-006 блок 6). */
  mode?: 'full' | 'mini';
}

export default function CarportConfigurator({ carports, info, calc, mode = 'full' }: Props) {
  const ready = useReady();
  const c = calc.carport;
  const [places, setPlaces] = useState(20);
  const [chargers, setChargers] = useState<'yes' | 'no'>('yes');
  const [storage, setStorage] = useState<'yes' | 'no'>('yes');
  const [touched, setTouched] = useState(false);
  const r = useMemo(
    () => carportConfig({ places, chargers: chargers === 'yes', storage: storage === 'yes' }, carports, calc),
    [places, chargers, storage],
  );
  const nearest = r.nearest ? info[r.nearest.slug] : null;
  const summary = `${formatUnit(r.kwp, 'kWp')}, ${r.panels} панелей, ${r.evPorts} портів зарядки, накопичувач ${formatUnit(r.storageKwh, 'кВт·год')}`;
  const params = { places: r.places, chargers: chargers === 'yes', storage: storage === 'yes', kwp: r.kwp, ports: r.evPorts, storage_kwh: r.storageKwh };
  usePickerComplete('carport', params, touched);

  return (
    <div class="pk" data-picker="carport" data-ready={ready ? 'true' : undefined}>
      <form class="pk-form" onSubmit={(e) => e.preventDefault()}>
        <NumberSlider
          id="cc-places"
          label="1. Кількість машиномісць"
          unit=""
          min={c.places_min}
          max={c.places_max}
          step={c.places_step}
          value={places}
          onChange={(v) => {
            setPlaces(v);
            setTouched(true);
          }}
        />
        {mode === 'mini' ? (
          <p class="pk-muted">
            Розрахунок — із зарядками й накопичувачем. <a href="/solar-carport/#konfigurator">Повний конфігуратор</a>
          </p>
        ) : (
          <>
            <Choice
              name="cc-chargers"
              legend="2. Потрібні зарядки?"
              value={chargers}
              onChange={(v) => {
                setChargers(v);
                setTouched(true);
              }}
              options={[
                { value: 'yes', label: 'Так' },
                { value: 'no', label: 'Ні' },
              ]}
            />
            <Choice
              name="cc-storage"
              legend="3. Потрібен накопичувач?"
              value={storage}
              onChange={(v) => {
                setStorage(v);
                setTouched(true);
              }}
              options={[
                { value: 'yes', label: 'Так' },
                { value: 'no', label: 'Ні' },
              ]}
            />
          </>
        )}
      </form>

      <Result summary={summary}>
        <p class="pk-result__title">
          <span class="pk-big">{formatNumber(r.kwp)}</span> kWp
        </p>
        <dl class="pk-grid">
          <div>
            <dt>Панелей</dt>
            <dd>{formatNumber(r.panels)}</dd>
          </div>
          <div>
            <dt>Портів зарядки</dt>
            <dd>{formatNumber(r.evPorts)}</dd>
          </div>
          <div>
            <dt>Накопичувач</dt>
            <dd>{formatUnit(r.storageKwh, 'кВт·год')}</dd>
          </div>
          <div>
            <dt>CO₂ на рік*</dt>
            <dd>{formatNumber(r.co2TYear)}{' '}т</dd>
          </div>
        </dl>
        <p class="pk-muted">*орієнтовно. Ціна — за розрахунком після обстеження ділянки.</p>
        {nearest && (
          <>
            <p class="pk-result__label">Схожа конфігурація в каталозі:</p>
            <ProductLinks items={[nearest]} />
          </>
        )}
        <Cta label="Отримати проєкт навісу" picker="carport" params={params} />
      </Result>
    </div>
  );
}
