// Поведінка головної (SPEC-006 §4.7): вкладки, фільтри хітів, варіант героя, аналітика, лінії енергії.
import { splitText } from '@motionplus/core';
import { animate, frame, inView, motionValue, scroll, stagger } from 'motion';
import { HERO_LEDS } from '../lib/photos';
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

/* ---------- Акт II · схема вмикається по черзі (SPEC-006 §4.9, D-055) ----------
   Desktop: сцена прилипає (приклад Motion+ «Scroll pinning»), прогрес прокрутки треку вмикає вузли й заповнює лінію
   (scroll()). Mobile: без прилипання — вузол вмикається, коли входить у кадр (inView, «Scroll highlight»).
   Числа докручує острів LiveNumber: отримує подію etsgrid:node-lit. Без руху (reduced-motion) схема горить цілком.
   Увімкнена лінія несе блик — енергія йде по системі (D-056). */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const flow = document.querySelector<HTMLElement>('[data-energy-flow]');
if (flow && !reduce) {
  const desktop = matchMedia('(min-width: 960px)').matches;
  const nodes = [...flow.querySelectorAll<HTMLElement>('[data-node]')];
  const pulses = nodes.map((n) => n.querySelector<HTMLElement>('[data-flow-pulse]'));
  const sparks = nodes.map((n) => n.querySelector<HTMLElement>('[data-flow-spark]'));
  const ease = [0.16, 1, 0.3, 1] as const;
  const off = desktop ? 'scaleX(0)' : 'scaleY(0)';
  const lit = nodes.map(() => false);
  // Приглушений старт одразу, щоб не блимало «увімкнено → вимкнено».
  for (const n of nodes) {
    Object.assign(n.querySelector<HTMLElement>('[data-flow-dot]')!.style, { opacity: '0.25', transform: 'scale(0.7)' });
    for (const part of n.querySelectorAll<HTMLElement>('.flow__link, .flow__body')) part.style.opacity = '0.35';
  }
  for (const p of pulses) if (p) p.style.transform = off;
  const light = (i: number, on: boolean) => {
    if (lit[i] === on) return;
    lit[i] = on;
    const n = nodes[i];
    n.toggleAttribute('data-lit', on);
    animate(n.querySelector<HTMLElement>('[data-flow-dot]')!, { opacity: on ? 1 : 0.25, transform: on ? 'scale(1)' : 'scale(0.7)' }, { duration: 0.45, ease });
    animate(n.querySelectorAll<HTMLElement>('.flow__link, .flow__body'), { opacity: on ? 1 : 0.35 }, { duration: 0.45, ease });
    n.dispatchEvent(new CustomEvent('etsgrid:node-lit', { detail: { on } }));
    if (lit.every(Boolean)) flow.dataset.done = '';
    if (!desktop && pulses[i]) animate(pulses[i]!, { transform: on ? 'scaleY(1)' : 'scaleY(0)' }, { duration: 0.4, delay: on ? 0.18 : 0, ease });
    // Блик по лінії: запускається, коли лінія до наступного вузла ввімкнена.
    sparks[i]?.toggleAttribute('data-run', on);
  };
  if (desktop) {
    const segs = pulses.filter(Boolean).length;
    const filled = pulses.map(() => 0);
    scroll(
      (progress: number) => {
        // Перші 10 % треку — заголовок; далі кожен вузол займає рівну частку.
        const p = Math.max(0, (progress - 0.1) / 0.8);
        // Сцена односпрямована: що ввімкнулося — лишається (один прохід, DESIGN.md → Рух); лінія теж не відкочується.
        nodes.forEach((_, i) => p >= i / nodes.length + 0.02 && light(i, true));
        pulses.forEach((pulse, i) => {
          if (!pulse) return;
          filled[i] = Math.max(filled[i], Math.min(1, Math.max(0, p * segs - i)));
          pulse.style.transform = `scaleX(${filled[i]})`;
        });
      },
      { target: flow, offset: ['start start', 'end end'] },
    );
  } else {
    nodes.forEach((n, i) => inView(n, () => light(i, true), { amount: 0.6 }));
  }
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
    for (const word of words) word.style.opacity = '0.3';
    heroTitle.dataset.lit = '';
    animate(words, { opacity: [0.3, 1] }, { duration: 0.55, delay: stagger(0.09, { startDelay: 0.15 }), ease: [0.4, 0, 0.2, 1] }).finished.then(() => {
      heroTitle.textContent = text;
      heroTitle.removeAttribute('aria-label');
    });
  });
}

/* ---------- Акт I · лампа-курсор над героєм (SPEC-006 §4.9, D-054) ----------
   За прикладом Motion+ «Conic gradient pointer»: позиція вказівника → motionValue → frame.render, без читання
   розмірів у кожному кадрі. Лише desktop із точним вказівником; при reduced-motion лампа не вмикається. */
const heroBlock = document.querySelector<HTMLElement>('[data-home-block="hero"]');
const heroLamp = heroBlock?.querySelector<HTMLElement>('[data-hero-lamp]');
if (heroBlock && heroLamp && !reduce && matchMedia('(pointer: fine)').matches) {
  const lx = motionValue(0);
  const ly = motionValue(0);
  let rect = heroBlock.getBoundingClientRect();
  const measure = () => (rect = heroBlock.getBoundingClientRect());
  const render = () => {
    heroBlock.style.setProperty('--lx', `${lx.get()}px`);
    heroBlock.style.setProperty('--ly', `${ly.get()}px`);
  };
  lx.on('change', () => frame.render(render));
  ly.on('change', () => frame.render(render));
  addEventListener('resize', () => frame.read(measure));
  addEventListener('scroll', () => frame.read(measure), { passive: true });
  heroBlock.addEventListener('pointermove', (e) => {
    lx.set(e.clientX - rect.left);
    ly.set(e.clientY - rect.top);
  });
  heroBlock.addEventListener('pointerenter', () => animate(heroLamp, { opacity: 1 }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] }));
  heroBlock.addEventListener('pointerleave', () => animate(heroLamp, { opacity: 0 }, { duration: 0.9, ease: [0.16, 1, 0.3, 1] }));
}

/* ---------- Акт I · вогники зарядки на стійках у кадрі (D-056) ----------
   Точки — частки кадру HERO_LEDS; екранне положення рахуємо під object-fit: cover і object-position фото героя,
   перераховуємо на зміну розміру. Лише desktop із рухом: на телефоні фото майже цілком під тінню. */
const ledLayer = heroBlock?.querySelector<HTMLElement>('[data-hero-leds]');
const heroImg = heroBlock?.querySelector<HTMLImageElement>('.hero__photo img');
if (heroBlock && ledLayer && heroImg && !reduce && matchMedia('(min-width: 960px)').matches) {
  const leds = HERO_LEDS.map((p, i) => {
    const el = document.createElement('span');
    el.className = 'hero__led';
    el.dataset.heroLed = '';
    el.style.setProperty('--i', String(i));
    ledLayer.append(el);
    return { el, p };
  });
  const place = () => {
    const W = heroBlock.clientWidth;
    const H = heroBlock.clientHeight;
    const iw = heroImg.naturalWidth;
    const ih = heroImg.naturalHeight;
    if (!iw || !ih) return;
    const s = Math.max(W / iw, H / ih);
    const w = iw * s;
    const h = ih * s;
    const [px, py] = getComputedStyle(heroImg).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    const x0 = (W - w) * px;
    const y0 = (H - h) * py;
    frame.render(() => {
      for (const { el, p } of leds) {
        const x = x0 + p.x * w;
        // Стійки, що потрапили під щільну тінь зліва (колонка тексту), не підсвічуємо.
        el.hidden = x < W * 0.55;
        el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y0 + p.y * h)}px)`;
      }
    });
  };
  place();
  if (!heroImg.complete) heroImg.addEventListener('load', place, { once: true });
  new ResizeObserver(() => frame.read(place)).observe(heroBlock);
}
