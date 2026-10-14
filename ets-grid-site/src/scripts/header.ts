// Поведінка шапки (SPEC-001 §3.4, §4): мега-меню, мобільне меню, лічильник кошика.
import { CART_CHANGE_EVENT, KEYS, cartCount, read } from '../lib/storage';
import './search-suggest';

document.documentElement.classList.add('js');

/* ---------- мега-меню: WAI-ARIA disclosure navigation ---------- */
const toggles = [...document.querySelectorAll<HTMLButtonElement>('[data-megamenu-toggle]')];

function panelOf(toggle: HTMLButtonElement): HTMLElement | null {
  return document.getElementById(toggle.getAttribute('aria-controls') ?? '');
}

function setOpen(toggle: HTMLButtonElement, open: boolean) {
  toggle.setAttribute('aria-expanded', String(open));
  const panel = panelOf(toggle);
  if (panel) panel.hidden = !open;
}

function closeAll(except?: HTMLButtonElement) {
  for (const t of toggles) if (t !== except) setOpen(t, false);
}

for (const toggle of toggles) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    closeAll(toggle);
    setOpen(toggle, open);
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const open = toggles.find((t) => t.getAttribute('aria-expanded') === 'true');
  if (open) {
    setOpen(open, false);
    open.focus();
  }
  const menu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu][open]');
  if (menu) {
    menu.open = false;
    menu.querySelector('summary')?.focus();
  }
});

document.addEventListener('click', (event) => {
  const target = event.target as Node;
  if (!toggles.some((t) => t.closest('[data-megamenu]')?.contains(target))) closeAll();
});

document.addEventListener('focusin', (event) => {
  const target = event.target as Node;
  for (const t of toggles) {
    if (t.getAttribute('aria-expanded') === 'true' && !t.closest('[data-megamenu]')?.contains(target)) {
      setOpen(t, false);
    }
  }
});

/* ---------- мобільне меню: закрити після вибору посилання ---------- */
const mobileMenu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
mobileMenu?.addEventListener('click', (event) => {
  if ((event.target as Element).closest('a')) mobileMenu.open = false;
});

/* ---------- лічильник кошика ---------- */
const badge = document.querySelector<HTMLElement>('[data-cart-count]');
const badgeValue = document.querySelector<HTMLElement>('[data-cart-count-value]');

function renderCartCount() {
  if (!badge || !badgeValue) return;
  const count = cartCount(read<unknown>(KEYS.cart, []));
  badgeValue.textContent = String(count);
  badge.hidden = count === 0;
}

renderCartCount();
window.addEventListener(CART_CHANGE_EVENT, renderCartCount);
window.addEventListener('storage', (event) => {
  if (event.key === null || event.key === KEYS.cart) renderCartCount();
});
