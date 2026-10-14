// Дії карток (SPEC-002 §3.5): «До кошика» і «Порівняти». Делегування подій, без Preact.
import { add } from '../lib/cart';
import { has, toggle } from '../lib/compare';
import { track } from '../lib/track';

function announce(card: Element | null, text: string) {
  const status = card?.querySelector<HTMLElement>('[data-card-status]');
  if (!status) return;
  status.textContent = '';
  requestAnimationFrame(() => (status.textContent = text));
}

function syncCompare() {
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-compare]')) {
    b.setAttribute('aria-pressed', String(has(b.dataset.compare!)));
  }
}

document.addEventListener('click', (event) => {
  const target = event.target as Element;

  const addButton = target.closest<HTMLButtonElement>('[data-add-to-cart]');
  if (addButton) {
    const slug = addButton.dataset.addToCart!;
    add(slug, false);
    track('add_to_cart', { slug, turnkey: false, source: 'listing' });
    const label = addButton.textContent;
    addButton.textContent = 'Додано ✓';
    setTimeout(() => (addButton.textContent = label), 1600);
    announce(addButton.closest('[data-product-card]'), 'Товар додано до кошика');
    return;
  }

  const compareButton = target.closest<HTMLButtonElement>('[data-compare]');
  if (compareButton) {
    const slug = compareButton.dataset.compare!;
    const result = toggle(slug);
    const card = compareButton.closest('[data-product-card]');
    if (!result.ok) {
      announce(card, 'Можна порівняти до 4 товарів');
      compareButton.dataset.limit = '';
      compareButton.title = 'Можна порівняти до 4 товарів';
      return;
    }
    syncCompare();
    if (result.active) track('compare_add', { slug });
    announce(card, result.active ? 'Додано до порівняння' : 'Прибрано з порівняння');
  }
});

syncCompare();
window.addEventListener('storage', syncCompare);
