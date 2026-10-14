// Макет актів I–II (SPEC-006 §4.9). Усе — на справжніх motion / @motionplus/core з ets-grid-site/node_modules.
// Приклади Motion+ в основі: Scroll pinning (sticky + scroll()), Scroll highlight (inView), Conic gradient pointer
// (motionValue + frame.render), Split Text (splitText + stagger). Числа — AnimateNumber (React).
import { animate, frame, inView, motionValue, scroll, stagger } from 'motion';
import { splitText } from '@motionplus/core';
import { AnimateNumber } from '@motionplus/core/react';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

const motionOn = document.documentElement.dataset.motion === 'on';
const desktop = matchMedia('(min-width: 960px)');
const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------- Акт I · слова H1 загоряються (як у src/scripts/home.ts, D-049) ---------- */
const title = document.querySelector<HTMLElement>('.hero__title')!;
if (motionOn) {
  document.fonts.ready.then(() => {
    if (getComputedStyle(title).opacity === '1') return void (title.dataset.lit = '');
    const text = title.textContent ?? '';
    const { words } = splitText(title, { preserveHyphens: true, wordClass: 'hero__word' });
    for (const w of words) w.style.opacity = '0.3';
    title.dataset.lit = '';
    animate(words, { opacity: [0.3, 1] }, { duration: 0.55, delay: stagger(0.09, { startDelay: 0.15 }), ease: [0.4, 0, 0.2, 1] }).finished.then(() => {
      title.textContent = text;
      title.removeAttribute('aria-label');
    });
  });
} else title.dataset.lit = '';

/* ---------- Акт I · лампа-курсор над героєм (за прикладом Conic gradient pointer) ---------- */
const hero = document.querySelector<HTMLElement>('.hero')!;
const lamp = hero.querySelector<HTMLElement>('.hero__lamp')!;
if (motionOn && matchMedia('(pointer: fine)').matches) {
  const lx = motionValue(0);
  const ly = motionValue(0);
  let rect = hero.getBoundingClientRect();
  const measure = () => (rect = hero.getBoundingClientRect());
  const render = () => {
    hero.style.setProperty('--lx', `${lx.get()}px`);
    hero.style.setProperty('--ly', `${ly.get()}px`);
  };
  lx.on('change', () => frame.render(render));
  ly.on('change', () => frame.render(render));
  addEventListener('resize', () => frame.read(measure));
  addEventListener('scroll', () => frame.read(measure), { passive: true });
  hero.addEventListener('pointermove', (e) => {
    lx.set(e.clientX - rect.left);
    ly.set(e.clientY - rect.top);
  });
  hero.addEventListener('pointerenter', () => animate(lamp, { opacity: 1 }, { duration: 0.6, ease: EASE }));
  hero.addEventListener('pointerleave', () => animate(lamp, { opacity: 0 }, { duration: 0.9, ease: EASE }));
}

/* ---------- Акт II · схема вмикається по черзі ----------
   Desktop: сцена прилипає (Scroll pinning), прогрес прокрутки треку вмикає вузли й заповнює лінію (scroll()).
   Mobile: без прилипання — вузол вмикається, коли входить у кадр (inView, як Scroll highlight). */
const track = document.querySelector<HTMLElement>('.system__track')!;
const nodes = [...document.querySelectorAll<HTMLElement>('[data-node]')];

type Live = { show: (v: number) => void; value: number };
const numbers: Live[] = nodes.map((node) => {
  const el = node.querySelector<HTMLElement>('[data-number]')!;
  const value = Number(el.dataset.number);
  const digits = Number(el.dataset.digits ?? 0);
  const root = createRoot(el);
  const show = (v: number) =>
    root.render(
      createElement(
        AnimateNumber,
        { locales: 'uk-UA', format: { minimumFractionDigits: digits, maximumFractionDigits: digits }, transition: { duration: 0.7, ease: EASE } },
        v,
      ),
    );
  show(motionOn ? 0 : value);
  return { show, value };
});

const lit = nodes.map(() => false);
function light(i: number, on: boolean) {
  if (lit[i] === on) return;
  lit[i] = on;
  const node = nodes[i];
  const dot = node.querySelector<HTMLElement>('.node__dot')!;
  const body = node.querySelector<HTMLElement>('.node__body')!;
  const seg = node.querySelector<HTMLElement>('.node__segfill');
  node.toggleAttribute('data-lit', on);
  animate(dot, { opacity: on ? 1 : 0.25, scale: on ? 1 : 0.7 }, { duration: 0.45, ease: EASE });
  animate(body, { opacity: on ? 1 : 0.35, y: on ? 0 : 8 }, { duration: 0.45, ease: EASE });
  numbers[i].show(on ? numbers[i].value : 0);
  // На телефоні лінія до наступного вузла заповнюється разом із вузлом; на desktop її веде прокрутка.
  if (seg && !desktop.matches) animate(seg, { scaleY: on ? 1 : 0 }, { duration: 0.4, delay: on ? 0.18 : 0, ease: EASE });
}

if (motionOn) {
  if (desktop.matches) {
    const fills = nodes.map((n) => n.querySelector<HTMLElement>('.node__segfill')).filter(Boolean) as HTMLElement[];
    const segs = fills.length;
    scroll(
      (progress: number) => {
        // Перші 10 % треку — заголовок; далі кожен вузол займає рівну частку.
        const p = Math.max(0, (progress - 0.1) / 0.8);
        nodes.forEach((_, i) => light(i, p >= i / nodes.length + 0.02));
        fills.forEach((fill, i) => {
          const local = Math.min(1, Math.max(0, p * segs - i));
          fill.style.transform = `scaleX(${local})`;
        });
      },
      { target: track, offset: ['start start', 'end end'] },
    );
  } else {
    nodes.forEach((node, i) => inView(node, () => light(i, true), { amount: 0.6 }));
  }
}

/* ---------- Акт II · вкладки «Що вам потрібно?» ---------- */
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const panels = [...document.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
function select(tab: HTMLButtonElement, focus = false) {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
  }
  for (const p of panels) {
    const on = p.id === tab.getAttribute('aria-controls');
    if (on && p.hidden && motionOn) {
      p.hidden = false;
      animate(p.querySelectorAll<HTMLElement>('.sys'), { opacity: [0, 1], y: [10, 0] }, { duration: 0.4, delay: stagger(0.06), ease: EASE });
    } else p.hidden = !on;
  }
  if (focus) tab.focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', (e) => {
    const next: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in next)) return;
    e.preventDefault();
    select(tabs[(next[e.key] + tabs.length) % tabs.length], true);
  });
});
