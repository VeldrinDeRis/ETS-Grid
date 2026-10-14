// Поведінка головної (SPEC-006 §4.7): вкладки, фільтри хітів, варіант героя, аналітика, лінії енергії.
import { splitText } from '@motionplus/core';
import { animate, inView, stagger } from 'motion';
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

/* ---------- схема енергії (блок 5): «світло вмикається» один раз, лише transform/opacity ----------
   У спокої схема горить (без JS і при reduced-motion так і лишається). Коли схема в кадрі — лампи
   загоряються по черзі, лінія до наступної лампи заповнюється; без циклів (DESIGN.md → Рух). */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const flow = document.querySelector<HTMLElement>('[data-energy-flow]');
if (flow && !reduce) {
  const dots = [...flow.querySelectorAll<HTMLElement>('[data-flow-dot]')];
  const fills = [...flow.querySelectorAll<HTMLElement>('[data-flow-pulse]')];
  const vertical = matchMedia('(max-width: 959.98px)').matches;
  const off = vertical ? 'scaleY(0)' : 'scaleX(0)';
  const on = vertical ? 'scaleY(1)' : 'scaleX(1)';
  const ease = [0.16, 1, 0.3, 1] as const;
  const STEP = 0.32;
  // Приглушений старт ставимо одразу, щоб на вході в кадр схема не блимала «увімкнена → вимкнена».
  for (const dot of dots) Object.assign(dot.style, { opacity: '0.25', transform: 'scale(0.7)' });
  for (const fill of fills) fill.style.transform = off;
  inView(
    flow,
    () => {
      dots.forEach((dot, i) => animate(dot, { opacity: [0.25, 1], transform: ['scale(0.7)', 'scale(1)'] }, { duration: 0.45, delay: i * STEP, ease }));
      fills.forEach((fill, i) => animate(fill, { transform: [off, on] }, { duration: 0.4, delay: i * STEP + 0.18, ease }));
    },
    { amount: 0.4 },
  );
}

/* ---------- H1 першого екрана: слова загоряються (SPEC-006 §4.8, D-045) ----------
   Ділимо лише на слова (preserveHyphens — без span на кожну літеру) і лише після шрифтів, бо splitText
   фіксує рядки за розміром на момент поділу. Після проходу повертаємо H1 простим текстом: рядки знову
   переносяться самі, доступне ім'я — звичайний текст. Якщо страховка CSS уже засвітила H1 — не анімуємо. */
const heroTitle = document.querySelector<HTMLElement>('.hero__title');
if (heroTitle && document.documentElement.dataset.motion === 'on' && !reduce) {
  document.fonts.ready.then(() => {
    if (getComputedStyle(heroTitle).opacity === '1') {
      heroTitle.dataset.lit = '';
      return;
    }
    const text = heroTitle.textContent ?? '';
    const { words } = splitText(heroTitle, { preserveHyphens: true, wordClass: 'hero__word' });
    for (const word of words) word.style.opacity = '0.25';
    heroTitle.dataset.lit = '';
    animate(words, { opacity: [0.25, 1] }, { duration: 0.45, delay: stagger(0.08, { startDelay: 0.15 }), ease: [0.16, 1, 0.3, 1] }).finished.then(() => {
      heroTitle.textContent = text;
      heroTitle.removeAttribute('aria-label');
    });
  });
}
