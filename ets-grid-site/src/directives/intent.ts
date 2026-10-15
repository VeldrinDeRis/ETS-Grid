// Клієнтська директива client:intent (SPEC-002 §3.10.1, D-069): острів оживає при першому намірі —
// наведення, натиск, дотик або фокус на ньому. Поки його немає, острів — серверний HTML: так кадри
// галереї не перемальовуються під час завантаження сторінки і не зсувають LCP. Клік по кнопці до
// гідратації не губиться: директива запам'ятовує, яку кнопку натиснули, і повторює клік після гідратації.
import type { ClientDirective } from 'astro';

const INTENT = ['pointerenter', 'pointerdown', 'touchstart', 'focusin'] as const;

interface Pending {
  cls: string;
  index: number;
}

const intent: ClientDirective = (load, _opts, el) => {
  let started = false;
  let hydrated = false;
  let pending: Pending | null = null;

  const onClick = (e: Event) => {
    if (hydrated) return;
    const button = (e.target as Element | null)?.closest?.('button');
    if (!button || !el.contains(button)) return;
    e.preventDefault();
    e.stopPropagation();
    const cls = button.classList[0];
    if (cls) pending = { cls, index: [...el.querySelectorAll(`button.${cls}`)].indexOf(button) };
    start();
  };

  const start = async () => {
    if (started) return;
    started = true;
    for (const type of INTENT) el.removeEventListener(type, start);
    const hydrate = await load();
    await hydrate();
    hydrated = true;
    el.removeEventListener('click', onClick, true);
    if (!pending) return;
    const { cls, index } = pending;
    pending = null;
    // Острів після гідратації ще міряє себе (Carousel рахує сторінки): чекаємо мітку готовності
    // [data-intent-ready], якщо острів її ставить, і потрібну кнопку — до 2 с, потім повторюємо клік.
    const until = performance.now() + 2000;
    const replay = () => {
      const button = el.querySelectorAll<HTMLButtonElement>(`button.${cls}`)[index];
      const ready = !el.querySelector('[data-intent-wait]') || el.querySelector('[data-intent-ready]');
      if (button && ready && !button.disabled) return button.click();
      if (performance.now() < until) requestAnimationFrame(replay);
    };
    requestAnimationFrame(replay);
  };

  for (const type of INTENT) el.addEventListener(type, start, { once: true, passive: true });
  el.addEventListener('click', onClick, true);
};

export default intent;
