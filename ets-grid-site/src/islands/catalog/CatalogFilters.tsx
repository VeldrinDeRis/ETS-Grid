/** @jsxImportSource preact */
// Острів фільтрів каталогу (SPEC-002 §3.7). Картки — серверний HTML у children;
// острів лише ставить їм hidden і order за applyFilters/sortProducts.
import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  applyFilters,
  facetCounts,
  nearestProducts,
  parseState,
  serializeState,
  sortProducts,
  SORT_OPTIONS,
  type Car,
  type FilterState,
  type ResolvedFacet,
  type SortKey,
} from '../../lib/filters';
import { plural } from '../../lib/plural';
import type { Product } from '../../lib/schema';
import { track } from '../../lib/track';
import './catalog-filters.css';

interface PoolItem {
  slug: string;
  name: string;
  url: string;
  price: string;
}

interface Props {
  facets: ResolvedFacet[];
  products: Product[];
  /** Товари рівня для порожньої видачі. */
  pool: Product[];
  poolInfo: Record<string, PoolItem>;
  bounds: Record<string, [number, number]>;
  cars?: Car[];
  levelId: number;
  /** ЧПУ-сторінка: передвстановлені фільтри і адреса лістингу категорії. */
  preset?: { filters: Record<string, string[]>; categoryUrl: string };
  children?: ComponentChildren;
}

const GOODS = ['товар', 'товари', 'товарів'] as const;
const LEVEL_KEYS: Record<number, string> = { 1: 'charging', 2: 'solar', 3: 'battery', 4: 'carport' };
const METRIC_FACETS = ['power_kw', 'panel_w', 'capacity_kwh', 'kwp'];

function withToken(state: FilterState, key: string, token: string, on: boolean): FilterState {
  const current = state.filters[key] ?? [];
  const next = on ? [...new Set([...current, token])] : current.filter((t) => t !== token);
  const filters = { ...state.filters, [key]: next };
  if (next.length === 0) delete filters[key];
  return { ...state, filters };
}

function activeCount(state: FilterState): number {
  return Object.values(state.filters).reduce((n, tokens) => n + tokens.length, 0);
}

function selectedMetric(state: FilterState, facets: ResolvedFacet[]): number | null {
  for (const facet of facets) {
    if (!METRIC_FACETS.includes(facet.key)) continue;
    const token = state.filters[facet.key]?.[0];
    const v = facet.values.find((x) => x.token === token);
    if (v?.lo !== undefined) return v.hi === null || v.hi === undefined ? v.lo : (v.lo + v.hi) / 2;
  }
  return null;
}

export default function CatalogFilters(props: Props) {
  const { facets, products, pool, poolInfo, bounds, cars, levelId, preset, children } = props;
  const ctx = useMemo(() => ({ cars }), [cars]);
  const [state, setState] = useState<FilterState>({ filters: { ...(preset?.filters ?? {}) }, sort: null });
  const [ready, setReady] = useState(false);
  const [announced, setAnnounced] = useState('');
  const results = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  // Стан з URL після гідрації.
  useEffect(() => {
    const parsed = parseState(location.search, facets);
    setState({ filters: { ...(preset?.filters ?? {}), ...parsed.filters }, sort: parsed.sort });
    setReady(true);
    const onPop = () => {
      const p = parseState(location.search, facets);
      setState({ filters: { ...(preset?.filters ?? {}), ...p.filters }, sort: p.sort });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const filtered = useMemo(() => applyFilters(products, state, facets, ctx), [products, state, facets, ctx]);
  const sorted = useMemo(() => sortProducts(filtered, state.sort), [filtered, state.sort]);
  const counts = useMemo(() => facetCounts(products, state, facets, ctx), [products, state, facets, ctx]);
  const total = filtered.length;

  // Показ і порядок серверних карток + адреса.
  useEffect(() => {
    const order = new Map(sorted.map((p, i) => [p.slug, i]));
    for (const card of results.current?.querySelectorAll<HTMLElement>('[data-product-card]') ?? []) {
      const i = order.get(card.dataset.slug ?? '');
      card.hidden = i === undefined;
      card.style.order = i === undefined ? '' : String(i);
    }
    if (!ready) return;
    const own: FilterState = { sort: state.sort, filters: { ...state.filters } };
    if (preset) for (const key of Object.keys(preset.filters)) delete own.filters[key];
    const q = serializeState(own, facets);
    const url = `${location.pathname}${q ? `?${q}` : ''}`;
    if (url !== `${location.pathname}${location.search}`) history.replaceState(null, '', url);
    const timer = setTimeout(() => setAnnounced(`Знайдено: ${total} ${plural(total, GOODS)}`), 300);
    return () => clearTimeout(timer);
  }, [sorted, ready]);

  function leavePreset(next: FilterState) {
    const q = serializeState(next, facets);
    location.assign(`${preset!.categoryUrl}${q ? `?${q}` : ''}`);
  }

  function toggleToken(facet: ResolvedFacet, token: string) {
    const on = !(state.filters[facet.key] ?? []).includes(token);
    const next = withToken(state, facet.key, token, on);
    if (!on && preset?.filters[facet.key]?.includes(token)) return leavePreset(next);
    setState(next);
    track('filter_apply', { facet: facet.key, value: token, active: on, results: applyFilters(products, next, facets, ctx).length });
  }

  function setSingle(facet: ResolvedFacet, token: string | null) {
    const filters = { ...state.filters };
    if (token) filters[facet.key] = [token];
    else delete filters[facet.key];
    const next = { ...state, filters };
    setState(next);
    track('filter_apply', { facet: facet.key, value: token, active: Boolean(token), results: applyFilters(products, next, facets, ctx).length });
  }

  function resetAll() {
    if (preset) return location.assign(preset.categoryUrl);
    setState({ filters: {}, sort: state.sort });
    track('filter_apply', { facet: '*', value: null, active: false, results: products.length });
  }

  function setSort(value: string) {
    setState({ ...state, sort: (value || null) as SortKey | null });
  }

  function openSheet() {
    sheet.current?.showModal();
  }

  function closeSheet(scroll = false) {
    sheet.current?.close();
    opener.current?.focus();
    if (scroll) results.current?.scrollIntoView({ block: 'start' });
  }

  const primary = facets.find((f) => f.primary);
  const secondary = facets.filter((f) => !f.primary);
  const selected = facets.flatMap((f) =>
    (state.filters[f.key] ?? []).map((token) => ({ facet: f, token, label: f.values.find((v) => v.token === token)?.label ?? token })),
  );
  const nearest =
    total === 0 && products.length > 0
      ? nearestProducts(pool, { level: levelId, exclude: [], metric: selectedMetric(state, facets) })
      : [];

  const valueButton = (facet: ResolvedFacet, v: { token: string; label: string }, chip = false) => {
    const isOn = (state.filters[facet.key] ?? []).includes(v.token);
    const count = counts[facet.key]?.[v.token] ?? 0;
    const disabled = count === 0 && !isOn;
    return (
      <button
        type="button"
        class={chip ? 'cf-chip' : 'cf-option'}
        aria-pressed={isOn ? 'true' : 'false'}
        aria-disabled={disabled ? 'true' : undefined}
        onClick={() => !disabled && toggleToken(facet, v.token)}
      >
        <span class="cf-option__label">{v.label}</span>
        <span class="cf-option__count" aria-hidden="true">
          {count}
        </span>
        <span class="cf-vh">
          , {count} {plural(count, GOODS)}
        </span>
      </button>
    );
  };

  const facetBody = (facet: ResolvedFacet) => {
    if (facet.kind === 'car') {
      const current = state.filters[facet.key]?.[0] ?? '';
      return (
        <label class="cf-field">
          <span class="cf-vh">{facet.label}</span>
          <select value={current} onChange={(e) => setSingle(facet, (e.target as HTMLSelectElement).value || null)}>
            <option value="">Будь-яке авто</option>
            {facet.values.map((v) => (
              <option value={v.token}>{v.label}</option>
            ))}
          </select>
        </label>
      );
    }
    if (facet.kind === 'interval') {
      const [min, max] = bounds[facet.key] ?? [0, 0];
      const [lo = '', hi = ''] = (state.filters[facet.key]?.[0] ?? '-').split('-');
      const update = (nextLo: string, nextHi: string) =>
        setSingle(facet, nextLo === '' && nextHi === '' ? null : `${nextLo}-${nextHi}`);
      return (
        <div class="cf-interval">
          <label class="cf-field">
            <span>від, {facet.unit}</span>
            <input type="number" inputMode="numeric" min={min} max={max} value={lo} placeholder={String(min)} onChange={(e) => update((e.target as HTMLInputElement).value, hi)} />
          </label>
          <label class="cf-field">
            <span>до, {facet.unit}</span>
            <input type="number" inputMode="numeric" min={min} max={max} value={hi} placeholder={String(max)} onChange={(e) => update(lo, (e.target as HTMLInputElement).value)} />
          </label>
          <label class="cf-field cf-field--range">
            <span class="cf-vh">Ціна до, повзунок</span>
            <input type="range" min={min} max={max} step={Math.max(1, Math.round((max - min) / 100))} value={hi || max} onChange={(e) => update(lo, (e.target as HTMLInputElement).value)} />
          </label>
        </div>
      );
    }
    return (
      <div class="cf-options" role="group" aria-label={facet.label}>
        {facet.values.map((v) => valueButton(facet, v))}
      </div>
    );
  };

  const facetList = (prefix: string) =>
    secondary.map((facet, i) => (
      <details class="cf-facet" open={i < 4}>
        <summary id={`${prefix}-${facet.key}`}>{facet.label}</summary>
        {facetBody(facet)}
      </details>
    ));

  return (
    <div class="cf" data-ready={ready ? 'true' : undefined}>
      {primary && (
        <div class="cf-primary js-only" role="group" aria-label={primary.label}>
          {primary.values.map((v) => valueButton(primary, v, true))}
        </div>
      )}

      <div class="cf-layout">
        {secondary.length > 0 && (
          <aside class="cf-sidebar js-only" aria-label="Фільтри">
            {facetList('side')}
          </aside>
        )}

        <div class="cf-main">
          <div class="cf-toolbar js-only">
            <p class="cf-total">
              Знайдено: <strong>{total}</strong>
            </p>
            <span class="cf-vh" aria-live="polite">
              {announced}
            </span>
            {secondary.length > 0 && (
              <button type="button" class="cf-open" ref={opener} onClick={openSheet} aria-haspopup="dialog">
                Фільтри{activeCount(state) > 0 ? ` (${activeCount(state)})` : ''}
              </button>
            )}
            <label class="cf-sort">
              <span>Сортування</span>
              <select value={state.sort ?? ''} onChange={(e) => setSort((e.target as HTMLSelectElement).value)}>
                {SORT_OPTIONS.map((o) => (
                  <option value={o.value ?? ''}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>

          {selected.length > 0 && (
            <div class="cf-selected js-only" aria-label="Вибрані фільтри" role="group">
              {selected.map((s) => (
                <button type="button" class="cf-selected__chip" onClick={() => toggleToken(s.facet, s.token)}>
                  {s.facet.primary ? s.label : `${s.facet.label}: ${s.label}`}
                  <span aria-hidden="true"> ×</span>
                  <span class="cf-vh"> — прибрати</span>
                </button>
              ))}
              <button type="button" class="cf-reset" onClick={resetAll}>
                Скинути все
              </button>
            </div>
          )}

          <div class="cf-results" ref={results}>
            {children}
          </div>

          {nearest.length > 0 && (
            <section class="cf-empty" aria-labelledby="cf-empty-title">
              <h2 id="cf-empty-title" class="cf-empty__title">
                {levelId === 1 ? 'Таких станцій немає.' : 'Таких товарів немає.'} Скиньте фільтр або дайте нам 3 питання — підберемо.
              </h2>
              <button type="button" class="cf-reset" onClick={resetAll}>
                Скинути фільтри
              </button>
              <p class="cf-empty__lead">Подивіться схожі:</p>
              <ul role="list" class="cf-empty__list">
                {nearest.map((p) => (
                  <li>
                    <a href={poolInfo[p.slug]?.url}>{poolInfo[p.slug]?.name ?? p.name}</a>
                    <span>{poolInfo[p.slug]?.price}</span>
                  </li>
                ))}
              </ul>
              <a class="cf-empty__form" href={`/kontakty/?interest=${LEVEL_KEYS[levelId] ?? ''}#rozrakhunok`}>
                Залишити заявку на підбір
              </a>
            </section>
          )}
        </div>
      </div>

      {secondary.length > 0 && (
        <dialog class="cf-sheet" ref={sheet} aria-labelledby="cf-sheet-title" onClose={() => opener.current?.focus()}>
          <div class="cf-sheet__head">
            <h2 id="cf-sheet-title">Фільтри</h2>
            <button type="button" class="cf-sheet__close" onClick={() => closeSheet()}>
              Закрити
            </button>
          </div>
          <div class="cf-sheet__body">{facetList('sheet')}</div>
          <div class="cf-sheet__foot">
            {selected.length > 0 && (
              <button type="button" class="cf-reset" onClick={resetAll}>
                Скинути все
              </button>
            )}
            <button type="button" class="cf-show" onClick={() => closeSheet(true)}>
              Показати {total} {plural(total, GOODS)}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
