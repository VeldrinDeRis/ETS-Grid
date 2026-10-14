// Поведінка картки товару (SPEC-003 §3.1, §4): перемикач «з монтажем», сумісність з авто,
// збільшення фото, липка панель, недавно переглянуті.
import { push, list } from '../lib/recent';
import { formatUnit } from '../lib/format';

const slug = document.querySelector<HTMLElement>('[data-product-slug]')?.dataset.productSlug;

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

/* ---------- недавно переглянуті ---------- */
if (slug) {
  const index = JSON.parse(document.querySelector('[data-product-index]')?.textContent ?? '{}') as Record<string, { name: string; url: string }>;
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
        li.append(a);
        return li;
      }),
    );
    if (empty) empty.hidden = true;
  }
  push(slug);
}
