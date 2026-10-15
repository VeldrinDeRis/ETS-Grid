// Клієнтська директива client:intent (SPEC-002 §3.10.1, D-069): острів оживає при першому намірі —
// наведення, натиск, дотик або фокус на ньому. Поки його немає, острів — серверний HTML: так кадри
// галереї не перемальовуються під час завантаження сторінки і не зсувають LCP.
// Клік по кнопці, поки острів не готовий (ще не гідратований або ще міряє себе — немає мітки
// [data-intent-ready] при наявній [data-intent-wait]), не губиться: директива запам'ятовує кнопку
// і повторює клік, щойно острів готовий (до 2 с).
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
  let replaying = false;

  const ready = () => hydrated && (!el.querySelector('[data-intent-wait]') || !!el.querySelector('[data-intent-ready]'));

  const replay = () => {
    if (replaying || !pending) return;
    replaying = true;
    const until = performance.now() + 2000;
    const tick = () => {
      const target = pending;
      if (!target) return void (replaying = false);
      const button = el.querySelectorAll<HTMLButtonElement>(`button.${target.cls}`)[target.index];
      if (ready() && button && !button.disabled) {
        pending = null;
        replaying = false;
        el.removeEventListener('click', onClick, true);
        button.click();
        return;
      }
      if (performance.now() < until) requestAnimationFrame(tick);
      else replaying = false;
    };
    requestAnimationFrame(tick);
  };

  const onClick = (e: Event) => {
    if (ready() && !pending) {
      el.removeEventListener('click', onClick, true);
      return;
    }
    const button = (e.target as Element | null)?.closest?.('button');
    if (!button || !el.contains(button)) return;
    e.preventDefault();
    e.stopPropagation();
    const cls = button.classList[0];
    if (cls) pending = { cls, index: [...el.querySelectorAll(`button.${cls}`)].indexOf(button) };
    if (hydrated) replay();
    else start();
  };

  const start = async () => {
    if (started) return;
    started = true;
    for (const type of INTENT) el.removeEventListener(type, start);
    const hydrate = await load();
    await hydrate();
    hydrated = true;
    replay();
  };

  for (const type of INTENT) el.addEventListener(type, start, { once: true, passive: true });
  el.addEventListener('click', onClick, true);
};

export default intent;
