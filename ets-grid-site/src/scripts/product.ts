// Поведінка картки товару (SPEC-003 §3.1, §4): перемикач «з монтажем», сумісність з авто,
// збільшення фото, липка панель, акордеон, недавно переглянуті.
import { animateLayout } from 'motion';
import { DUR, EASE_OUT } from '../lib/motion-tokens';
import { push, list } from '../lib/recent';
import { formatUnit } from '../lib/format';

const slug = document.querySelector<HTMLElement>('[data-product-slug]')?.dataset.productSlug;

/** Мініатюра — та сама розмітка, що ProductThumb у магазині (SPEC-005 §3.8, src/styles/shop-ui.css). */
function thumb(data: { src: string; illustrative: boolean } | null): HTMLElement {
  const figure = document.createElement('figure');
  figure.className = 'pthumb';
  figure.dataset.productThumb = '';
  const frame = document.createElement('span');
  frame.className = 'pthumb__frame';
  if (data) {
    const img = Object.assign(document.createElement('img'), { src: data.src, alt: '', width: 96, height: 96, loading: 'lazy', decoding: 'async' });
    frame.append(img);
  } else {
    const ph = Object.assign(document.createElement('span'), { className: 'placeholder', title: 'Дані надасть замовник', textContent: '[ФОТО]' });
    frame.append(ph);
  }
  figure.append(frame);
  if (data?.illustrative) figure.append(Object.assign(document.createElement('figcaption'), { className: 'pthumb__note', textContent: 'Ілюстративне фото' }));
  return figure;
}

/* ---------- перемикач «Тільки обладнання / З монтажем під ключ» ---------- */
const priceBlock = document.querySelector<HTMLElement>('[data-price-block]');
for (const radio of document.querySelectorAll<HTMLInputElement>('[data-turnkey-toggle] input[name="turnkey"]')) {
  radio.addEventListener('change', () => {
    if (!priceBlock || !radio.checked) return;
    priceBlock.dataset.turnkey = radio.value;
    for (const btn of document.querySelectorAll<HTMLElement>('[data-add-to-cart]')) btn.dataset.turnkey = radio.value;
    for (const el of document.querySelectorAll<HTMLElement>('[data-sticky-price]')) {
      const source = priceBlock.querySelector<HTMLElement>(`[data-price-for="${radio.value}"]`);
      if (source) el.textContent = source.firstChild?.textContent?.trim() ?? '';
    }
  });
}

/* ---------- сумісність з авто ---------- */
const select = document.querySelector<HTMLSelectElement>('[data-compat-select]');
const result = document.querySelector<HTMLElement>('[data-compat-result]');
const adapterNames = JSON.parse(document.querySelector('[data-adapter-names]')?.textContent ?? '{}') as Record<string, string>;
select?.addEventListener('change', () => {
  if (!result) return;
  const row = document.querySelector<HTMLElement>(`[data-compat-row="${select.value}"]`);
  if (!row) {
    result.textContent = 'Оберіть авто, щоб перевірити розʼєм і реальну швидкість зарядки.';
    result.dataset.status = '';
    return;
  }
  const status = row.dataset.status;
  const speed = row.dataset.speed ? `до ${formatUnit(Number(row.dataset.speed), 'кВт')}` : 'швидкість уточнимо';
  result.dataset.status = status ?? '';
  result.textContent =
    status === 'fits'
      ? `Підходить: ${speed}.`
      : status === 'adapter'
        ? `Потрібен адаптер: ${adapterNames[row.dataset.adapter ?? ''] ?? 'адаптер'}; ${speed}.`
        : 'Не підходить: інший розʼєм. Підберемо станцію під ваше авто.';
});

/* ---------- збільшення фото ---------- */
const dialog = document.querySelector<HTMLDialogElement>('[data-zoom-dialog]');
const frame = dialog?.querySelector<HTMLElement>('[data-zoom-frame]');
let opener: HTMLElement | null = null;
document.addEventListener('click', (e) => {
  const trigger = (e.target as Element).closest<HTMLElement>('[data-zoom]');
  if (trigger && dialog && frame) {
    opener = trigger;
    const img = document.createElement('img');
    img.src = trigger.dataset.zoom!;
    img.alt = trigger.dataset.zoomAlt ?? '';
    frame.replaceChildren(img);
    dialog.showModal();
    return;
  }
  if ((e.target as Element).closest('[data-zoom-close]')) dialog?.close();
});
dialog?.addEventListener('close', () => opener?.focus());

/* ---------- липка панель (mobile) ----------
   Не IntersectionObserver: при стрибку прокрутки (якір, швидкий свайп) блок ціни може «перескочити» екран
   без зміни стану перетину, і подія не прийде. Перевіряємо положення блоку на кожну прокрутку (rAF). */
const sticky = document.querySelector<HTMLElement>('[data-sticky]');
if (sticky && priceBlock) {
  let queued = false;
  const update = () => {
    queued = false;
    const past = priceBlock.getBoundingClientRect().bottom < 0;
    if (sticky.hidden === past) {
      sticky.hidden = !past;
      document.body.classList.toggle('has-sticky', past);
    }
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  update();
}

/* ---------- акордеон смуги 2 (SPEC-003 §3.5) ----------
   Як FAQ головної: сусіди з'їжджають animateLayout, без руху — звичайні <details>. */
const accordion = document.querySelector<HTMLElement>('[data-product-accordion]');
if (accordion && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  for (const item of accordion.querySelectorAll<HTMLDetailsElement>(':scope > details')) {
    item.querySelector(':scope > summary')!.addEventListener('click', (e) => {
      e.preventDefault();
      animateLayout(accordion, () => item.toggleAttribute('open'), { duration: DUR, ease: EASE_OUT });
    });
  }
}

/* ---------- недавно переглянуті ---------- */
if (slug) {
  const index = JSON.parse(document.querySelector('[data-product-index]')?.textContent ?? '{}') as Record<string, { name: string; url: string; thumb: { src: string; illustrative: boolean } | null }>;
  const items = list(4, slug).filter((s) => index[s]);
  const listEl = document.querySelector<HTMLElement>('[data-recent-list]');
  const empty = document.querySelector<HTMLElement>('[data-recent-empty]');
  if (listEl && items.length) {
    listEl.replaceChildren(
      ...items.map((s) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = index[s].url;
        a.textContent = index[s].name;
        li.append(thumb(index[s].thumb), a);
        return li;
      }),
    );
    if (empty) empty.hidden = true;
  }
  push(slug);
}
