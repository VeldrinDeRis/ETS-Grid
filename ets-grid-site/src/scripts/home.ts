// Поведінка головної (SPEC-006 §4.7): вкладки, фільтри хітів, варіант героя, аналітика, лінії енергії.
import { animate, inView } from 'motion';
import { track } from '../lib/track';

/* ---------- вкладки блоку 2: WAI-ARIA Tabs ---------- */
for (const root of document.querySelectorAll<HTMLElement>('[data-tabs]')) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-tab-panel]')];
  const select = (tab: HTMLButtonElement, focus = false) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    }
    for (const p of panels) p.hidden = p.id !== tab.getAttribute('aria-controls');
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const keys: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
    });
  });
  if (tabs[0]) select(tabs[0]);
}

/* ---------- фільтри хітів (блок 4) ---------- */
for (const root of document.querySelectorAll<HTMLElement>('[data-hits]')) {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-hits-filter]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-hits-level]')];
  for (const b of buttons) {
    b.addEventListener('click', () => {
      const level = b.dataset.hitsFilter;
      for (const x of buttons) x.setAttribute('aria-pressed', String(x === b));
      for (const item of items) item.hidden = level !== 'all' && item.dataset.hitsLevel !== level;
    });
  }
}

/* ---------- варіант першого екрана за ?hero= (SPEC-006 §4.3) ---------- */
const variantsEl = document.getElementById('hero-variants');
const requested = new URLSearchParams(location.search).get('hero');
if (variantsEl && requested) {
  const variants = JSON.parse(variantsEl.textContent ?? '{}') as Record<string, Record<string, string>>;
  const v = variants[requested.toLowerCase()];
  if (v) {
    for (const el of document.querySelectorAll<HTMLElement>('[data-hero-field]')) {
      const value = v[el.dataset.heroField!];
      if (value) el.textContent = value;
    }
    for (const el of document.querySelectorAll<HTMLElement>('[data-anchor-for]')) {
      el.hidden = !el.dataset.anchorFor!.split(' ').includes(v.id);
    }
    document.documentElement.dataset.heroVariant = v.id;
  }
}

/* ---------- аналітика першого екрана ---------- */
document.addEventListener('click', (e) => {
  const target = e.target as Element;
  const cta = target.closest<HTMLElement>('[data-hero-cta]');
  if (cta) track('hero_cta_click', { cta: cta.dataset.heroCta, variant: document.documentElement.dataset.heroVariant ?? 'default' });
  const tile = target.closest<HTMLElement>('[data-level-tile]');
  if (tile) track('level_tile_click', { level: tile.dataset.levelTile, source: 'hero' });
});

/* ---------- лінії енергії (блок 5): лише transform/opacity, вимкнено при reduced-motion ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const flow = document.querySelector<HTMLElement>('[data-energy-flow]');
if (flow && !reduce) {
  inView(flow, () => {
    const vertical = matchMedia('(max-width: 959.98px)').matches;
    const controls = [...flow.querySelectorAll<HTMLElement>('[data-flow-pulse]')].map((pulse, i) =>
      animate(
        pulse,
        vertical
          ? { transform: ['translateY(-100%)', 'translateY(250%)'], opacity: [0, 1, 0] }
          : { transform: ['translateX(-100%)', 'translateX(250%)'], opacity: [0, 1, 0] },
        { duration: 2.4, delay: i * 0.45, repeat: Infinity, ease: 'linear' },
      ),
    );
    return () => controls.forEach((c) => c.stop());
  });
}
