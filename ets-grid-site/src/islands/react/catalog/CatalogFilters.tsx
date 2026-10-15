/** @jsxImportSource react */
// Острів фільтрів каталогу (SPEC-002 §3.7, §3.8, §3.9; ревізія 5, D-063). Картки — серверний HTML у children;
// острів лише ставить їм hidden і order за applyFilters/sortProducts — усередині animateLayout (§3.8).
// Головний фільтр — плитки з іконкою й вогником (§3.9 А); фасети за змістом — rankFacets (§3.9 Б);
// «Знайдено: N» і лічильники — AnimateNumber Motion+ (§3.9 Г). React — за D-044, лише в src/islands/react/.
import { AnimateNumber } from '@motionplus/core/react';
import { animate, animateLayout } from '../../../lib/motion-dom';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  applyFilters,
  facetCounts,
  nearestProducts,
  parseState,
  rankFacets,
  serializeState,
  sortProducts,
  SORT_OPTIONS,
  type Car,
  type FilterState,
  type ResolvedFacet,
  type SortKey,
} from '../../../lib/filters';
import { typeIcon } from '../../../lib/filters/icons';
import { ICON_PATHS } from '../../../lib/icons';
import { plural } from '../../../lib/plural';
import type { Product } from '../../../lib/schema';
import { track } from '../../../lib/track';
import './catalog-filters.css';

interface PoolItem {
  slug: string;
  name: string;
  url: string;
  price: string;
}

interface Props {
  facets: ResolvedFacet[];
  /** Фасети рівня без даних — одна плашка з переліком (D-031, §3.9 Б). */
  missing?: { key: string; label: string }[];
  products: Product[];
  /** Товари рівня для порожньої видачі. */
  pool: Product[];
  poolInfo: Record<string, PoolItem>;
  bounds: Record<string, [number, number]>;
  cars?: Car[];
  levelId: number;
  /** Ключ рівня для іконок головного фільтра (TYPE_ICON). */
  levelKey: string;
  /** ЧПУ-сторінка: передвстановлені фільтри і адреса лістингу категорії. */
  preset?: { filters: Record<string, string[]>; categoryUrl: string };
  children?: ReactNode;
}

const GOODS = ['товар', 'товари', 'товарів'] as const;
const FILTERS = ['фільтр', 'фільтри', 'фільтрів'] as const;
const LEVEL_KEYS: Record<number, string> = { 1: 'charging', 2: 'solar', 3: 'battery', 4: 'carport' };
const METRIC_FACETS = ['power_kw', 'panel_w', 'capacity_kwh', 'kwp'];
const EMPTY: FilterState = { filters: {}, sort: null };
/** Рух «світло вмикається» (DESIGN.md): 320 мс, без перельоту. */
const LAYOUT = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
/** Розряди AnimateNumber (§3.9 Г): 450 мс, експоненційне затухання. */
const NUMBER = { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

const motionOn = () => typeof document !== 'undefined' && document.documentElement.dataset.motion === 'on';

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
  const { facets, missing = [], products, pool, poolInfo, bounds, cars, levelId, levelKey, preset, children } = props;
  const ctx = useMemo(() => ({ cars }), [cars]);
  const [state, setState] = useState<FilterState>({ filters: { ...(preset?.filters ?? {}) }, sort: null });
  const [ready, setReady] = useState(false);
  const [announced, setAnnounced] = useState('');
  const results = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const sheetBody = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  /** Чи анімувати наступну правку карток: лише після дії користувача (AC-31: не при завантаженні з URL). */
  const animateNext = useRef(false);
  const layoutControls = useRef<{ complete?: () => void; cancel?: () => void } | null>(null);
  /** Фасети, що колись були вибрані: розкриті до перезавантаження (§3.9 Б). */
  const everSelected = useRef(new Set<string>(Object.keys(preset?.filters ?? {})));

  // Стан з URL після гідрації.
  useEffect(() => {
    const read = () => {
      const p = parseState(location.search, facets);
      const next = { filters: { ...(preset?.filters ?? {}), ...p.filters }, sort: p.sort };
      for (const key of Object.keys(next.filters)) everSelected.current.add(key);
      return next;
    };
    setState(read());
    setReady(true);
    const onPop = () => setState(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const filtered = useMemo(() => applyFilters(products, state, facets, ctx), [products, state, facets, ctx]);
  const sorted = useMemo(() => sortProducts(filtered, state.sort), [filtered, state.sort]);
  const counts = useMemo(() => facetCounts(products, state, facets, ctx), [products, state, facets, ctx]);
  const total = filtered.length;

  // Ранжування фасетів — раз, за повним лістингом (§3.9 Б): фасети не стрибають під час фільтрації.
  const rankBase = useMemo(() => {
    const base = rankFacets(facets, facetCounts(products, EMPTY, facets, ctx), EMPTY, bounds);
    return new Set(base.open.map((f) => f.key));
  }, [facets, products, ctx, bounds]);

  // Показ і порядок серверних карток + адреса. Правка — всередині animateLayout (§3.8), якщо рух увімкнено.
  useEffect(() => {
    const order = new Map(sorted.map((p, i) => [p.slug, i]));
    const cards = [...(results.current?.querySelectorAll<HTMLElement>('[data-product-card]') ?? [])];
    const appearing = cards.filter((card) => card.hidden && order.has(card.dataset.slug ?? ''));
    const apply = () => {
      for (const card of cards) {
        const i = order.get(card.dataset.slug ?? '');
        card.hidden = i === undefined;
        card.style.order = i === undefined ? '' : String(i);
      }
    };
    const animated = animateNext.current && ready && motionOn() && !sheet.current?.open && results.current;
    animateNext.current = false;
    if (animated) {
      // Нова зміна посеред анімації — попередню завершуємо, картки стають на місця останнього стану (AC-31).
      layoutControls.current?.complete?.();
      const controls = animateLayout(results.current!, apply, LAYOUT) as unknown;
      Promise.resolve(controls).then((c) => (layoutControls.current = c as typeof layoutControls.current));
      for (const card of appearing) animate(card, { opacity: [0, 1] }, LAYOUT);
    } else apply();
    if (!ready) return;
    const own: FilterState = { sort: state.sort, filters: { ...state.filters } };
    if (preset) for (const key of Object.keys(preset.filters)) delete own.filters[key];
    const q = serializeState(own, facets);
    const url = `${location.pathname}${q ? `?${q}` : ''}`;
    if (url !== `${location.pathname}${location.search}`) history.replaceState(null, '', url);
    const timer = setTimeout(() => setAnnounced(`Знайдено: ${total} ${plural(total, GOODS)}`), 300);
    return () => clearTimeout(timer);
  }, [sorted, ready]);

  // Повернення фокусу після закриття шторки (Esc теж).
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const onClose = () => opener.current?.focus();
    el.addEventListener('close', onClose);
    return () => el.removeEventListener('close', onClose);
  }, []);

  function commit(next: FilterState) {
    animateNext.current = true;
    setState(next);
  }

  function leavePreset(next: FilterState) {
    const q = serializeState(next, facets);
    location.assign(`${preset!.categoryUrl}${q ? `?${q}` : ''}`);
  }

  function toggleToken(facet: ResolvedFacet, token: string) {
    const on = !(state.filters[facet.key] ?? []).includes(token);
    const next = withToken(state, facet.key, token, on);
    if (!on && preset?.filters[facet.key]?.includes(token)) return leavePreset(next);
    if (on) everSelected.current.add(facet.key);
    commit(next);
    track('filter_apply', { facet: facet.key, value: token, active: on, results: applyFilters(products, next, facets, ctx).length });
  }

  function setSingle(facet: ResolvedFacet, token: string | null) {
    const filters = { ...state.filters };
    if (token) filters[facet.key] = [token];
    else delete filters[facet.key];
    if (token) everSelected.current.add(facet.key);
    const next = { ...state, filters };
    commit(next);
    track('filter_apply', { facet: facet.key, value: token, active: Boolean(token), results: applyFilters(products, next, facets, ctx).length });
  }

  function resetAll() {
    if (preset) return location.assign(preset.categoryUrl);
    commit({ filters: {}, sort: state.sort });
    track('filter_apply', { facet: '*', value: null, active: false, results: products.length });
  }

  function setSort(value: string) {
    commit({ ...state, sort: (value || null) as SortKey | null });
  }

  function openSheet() {
    sheet.current?.showModal();
  }

  function closeSheet(scroll = false) {
    sheet.current?.close();
    opener.current?.focus();
    if (scroll) results.current?.scrollIntoView({ block: 'start' });
  }

  /** Розгортання <details> у колонці — сусіди зʼїжджають через animateLayout (як FAQ на головній). */
  function toggleDetails(e: React.MouseEvent<HTMLElement>, scope: HTMLElement | null, more = false) {
    const details = (e.currentTarget as HTMLElement).parentElement as HTMLDetailsElement | null;
    if (!details) return;
    e.preventDefault();
    const flip = () => details.toggleAttribute('open');
    if (ready && motionOn() && scope) animateLayout(scope, flip, LAYOUT);
    else flip();
    if (more && details.open) track('filter_more', { level: levelKey, results: total });
  }

  const primary = facets.find((f) => f.primary);
  const secondary = facets.filter((f) => !f.primary);
  const open = secondary.filter((f) => rankBase.has(f.key) || everSelected.current.has(f.key) || (state.filters[f.key]?.length ?? 0) > 0);
  const folded = secondary.filter((f) => !open.includes(f));
  const selected = facets.flatMap((f) =>
    (state.filters[f.key] ?? []).map((token) => ({ facet: f, token, label: f.values.find((v) => v.token === token)?.label ?? token })),
  );
  const nearest =
    total === 0 && products.length > 0
      ? nearestProducts(pool, { level: levelId, exclude: [], metric: selectedMetric(state, facets) })
      : [];

  /** Живе число: після гідрації з рухом — AnimateNumber (перший показ без прокрутки), інакше звичайний текст. */
  const Num = ({ n }: { n: number }) =>
    ready && motionOn() ? (
      <AnimateNumber locales="uk-UA" transition={NUMBER}>
        {n}
      </AnimateNumber>
    ) : (
      <>{n}</>
    );

  const valueButton = (facet: ResolvedFacet, v: { token: string; label: string }, live: boolean) => {
    const isOn = (state.filters[facet.key] ?? []).includes(v.token);
    const count = counts[facet.key]?.[v.token] ?? 0;
    const disabled = count === 0 && !isOn;
    return (
      <button
        key={v.token}
        type="button"
        className="cf-option"
        aria-pressed={isOn ? 'true' : 'false'}
        aria-disabled={disabled ? 'true' : undefined}
        onClick={() => !disabled && toggleToken(facet, v.token)}
      >
        <span className="cf-option__label">{v.label}</span>
        <span className="cf-option__count" aria-hidden="true">
          {live ? <Num n={count} /> : count}
        </span>
        <span className="cf-vh">
          , {count} {plural(count, GOODS)}
        </span>
      </button>
    );
  };

  const tile = (facet: ResolvedFacet, v: { token: string; label: string }) => {
    const isOn = (state.filters[facet.key] ?? []).includes(v.token);
    const count = counts[facet.key]?.[v.token] ?? 0;
    const disabled = count === 0 && !isOn;
    const icon = typeIcon(levelKey, v.token);
    return (
      <button
        key={v.token}
        type="button"
        className="cf-tile"
        data-type-tile={v.token}
        aria-pressed={isOn ? 'true' : 'false'}
        aria-disabled={disabled ? 'true' : undefined}
        onClick={() => !disabled && toggleToken(facet, v.token)}
      >
        {icon && (
          <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" data-icon={icon}>
            <path d={ICON_PATHS[icon]} />
          </svg>
        )}
        <span className="cf-tile__label">{v.label}</span>
        <span className="cf-tile__count" aria-hidden="true">
          <Num n={count} />
        </span>
        <span className="cf-vh">
          , {count} {plural(count, GOODS)}
        </span>
      </button>
    );
  };

  const facetBody = (facet: ResolvedFacet, live: boolean) => {
    if (facet.kind === 'car') {
      const current = state.filters[facet.key]?.[0] ?? '';
      return (
        <label className="cf-field">
          <span className="cf-vh">{facet.label}</span>
          <select value={current} onChange={(e) => setSingle(facet, e.target.value || null)}>
            <option value="">Будь-яке авто</option>
            {facet.values.map((v) => (
              <option key={v.token} value={v.token}>
                {v.label}
              </option>
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
        <div className="cf-interval">
          <label className="cf-field">
            <span>від, {facet.unit}</span>
            <input type="number" inputMode="numeric" min={min} max={max} value={lo} placeholder={String(min)} onChange={(e) => update(e.target.value, hi)} />
          </label>
          <label className="cf-field">
            <span>до, {facet.unit}</span>
            <input type="number" inputMode="numeric" min={min} max={max} value={hi} placeholder={String(max)} onChange={(e) => update(lo, e.target.value)} />
          </label>
          <label className="cf-field cf-field--range">
            <span className="cf-vh">Ціна до, повзунок</span>
            <input type="range" min={min} max={max} step={Math.max(1, Math.round((max - min) / 100))} value={hi || max} onChange={(e) => update(lo, e.target.value)} />
          </label>
        </div>
      );
    }
    return (
      <div className="cf-options" role="group" aria-label={facet.label}>
        {facet.values.map((v) => valueButton(facet, v, live))}
      </div>
    );
  };

  const facetDetails = (facet: ResolvedFacet, prefix: string, isOpen: boolean, scope: () => HTMLElement | null) => (
    <details key={facet.key} className="cf-facet" data-layout open={isOpen}>
      <summary id={`${prefix}-${facet.key}`} onClick={(e) => toggleDetails(e, scope())}>
        {facet.label}
      </summary>
      {facetBody(facet, isOpen)}
    </details>
  );

  const facetList = (prefix: string, scope: () => HTMLElement | null) => [
    ...open.map((facet) => facetDetails(facet, prefix, true, scope)),
    folded.length > 0 && (
      <details key="more" className="cf-facet cf-more" data-layout>
        <summary id={`${prefix}-more`} onClick={(e) => toggleDetails(e, scope(), true)}>
          Ще {folded.length} {plural(folded.length, FILTERS)}
        </summary>
        <div className="cf-more__body">{folded.map((facet) => facetDetails(facet, prefix, false, scope))}</div>
      </details>
    ),
    missing.length > 0 && (
      <div key="missing" className="cf-missing-plate" data-layout data-missing-facets={missing.map((m) => m.key).join(',')} aria-disabled="true">
        Ще {missing.length} {plural(missing.length, FILTERS)} зʼявляться з даними замовника:{' '}
        {missing.map((m, i) => (
          <span key={m.key}>
            {i > 0 && <span aria-hidden="true"> · </span>}
            <span data-missing-facet={m.key}>{m.label}</span>
          </span>
        ))}
      </div>
    ),
  ];

  const hasColumn = secondary.length + missing.length > 0;

  return (
    <div className="cf" data-ready={ready ? 'true' : undefined}>
      {primary && (
        <div className="cf-primary js-only" role="group" aria-label={primary.label}>
          {primary.values.map((v) => tile(primary, v))}
        </div>
      )}

      <div className="cf-layout">
        {hasColumn && (
          <aside className="cf-sidebar js-only" aria-label="Фільтри" ref={sidebar}>
            {facetList('side', () => sidebar.current)}
          </aside>
        )}

        <div className="cf-main">
          <div className="cf-toolbar js-only">
            <p className="cf-total">
              Знайдено:{' '}
              <strong aria-hidden="true">
                <Num n={total} />
              </strong>
              <span className="cf-vh">
                <span data-total={total}>{total}</span> {plural(total, GOODS)}
              </span>
            </p>
            <span className="cf-vh" aria-live="polite">
              {announced}
            </span>
            {hasColumn && (
              <button type="button" className="cf-open" ref={opener} onClick={openSheet} aria-haspopup="dialog">
                Фільтри{activeCount(state) > 0 ? ` (${activeCount(state)})` : ''}
              </button>
            )}
            <label className="cf-sort">
              <span>Сортування</span>
              <select value={state.sort ?? ''} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value ?? ''} value={o.value ?? ''}>
                    {o.label}
                  </option>
                ))}
                <option value="new" disabled>
                  Новинки — немає дати появи товару
                </option>
              </select>
            </label>
          </div>

          {selected.length > 0 && (
            <div className="cf-selected js-only" aria-label="Вибрані фільтри" role="group">
              {selected.map((s) => (
                <button key={`${s.facet.key}:${s.token}`} type="button" className="cf-selected__chip" onClick={() => toggleToken(s.facet, s.token)}>
                  {s.facet.primary ? s.label : `${s.facet.label}: ${s.label}`}
                  <span aria-hidden="true"> ×</span>
                  <span className="cf-vh"> — прибрати</span>
                </button>
              ))}
              <button type="button" className="cf-reset" onClick={resetAll}>
                Скинути все
              </button>
            </div>
          )}

          <div className="cf-results" ref={results}>
            {children}
          </div>

          {nearest.length > 0 && (
            <section className="cf-empty" aria-labelledby="cf-empty-title">
              <h2 id="cf-empty-title" className="cf-empty__title">
                {levelId === 1 ? 'Таких станцій немає.' : 'Таких товарів немає.'} Скиньте фільтр або дайте нам 3 питання — підберемо.
              </h2>
              <button type="button" className="cf-reset" onClick={resetAll}>
                Скинути фільтри
              </button>
              <p className="cf-empty__lead">Подивіться схожі:</p>
              <ul role="list" className="cf-empty__list">
                {nearest.map((p) => (
                  <li key={p.slug}>
                    <a href={poolInfo[p.slug]?.url}>{poolInfo[p.slug]?.name ?? p.name}</a>
                    <span>{poolInfo[p.slug]?.price}</span>
                  </li>
                ))}
              </ul>
              <a className="cf-empty__form" href={`/kontakty/?interest=${LEVEL_KEYS[levelId] ?? ''}#rozrakhunok`}>
                Залишити заявку на підбір
              </a>
            </section>
          )}
        </div>
      </div>

      {hasColumn && (
        <dialog className="cf-sheet" ref={sheet} aria-labelledby="cf-sheet-title">
          <div className="cf-sheet__head">
            <h2 id="cf-sheet-title">Фільтри</h2>
            <button type="button" className="cf-sheet__close" onClick={() => closeSheet()}>
              Закрити
            </button>
          </div>
          <div className="cf-sheet__body" ref={sheetBody}>
            {facetList('sheet', () => sheetBody.current)}
          </div>
          <div className="cf-sheet__foot">
            {selected.length > 0 && (
              <button type="button" className="cf-reset" onClick={resetAll}>
                Скинути все
              </button>
            )}
            <button type="button" className="btn btn--primary cf-show" onClick={() => closeSheet(true)}>
              Показати{' '}
              <span aria-hidden="true">
                <Num n={total} />
              </span>
              <span className="cf-vh" data-show-total={total}>{total}</span> {plural(total, GOODS)}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
