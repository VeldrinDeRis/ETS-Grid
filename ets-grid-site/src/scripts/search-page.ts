// Сторінка пошуку (SPEC-005 §3.7): збіги з індексу на сторінці, «Знайдено: N», порожній стан.
import { plural } from '../lib/plural';
import { search, type SearchEntry } from '../lib/search';

const GOODS = ['товар', 'товари', 'товарів'] as const;

const index = JSON.parse(document.querySelector('[data-search-index]')?.textContent ?? '[]') as SearchEntry[];
const query = new URLSearchParams(location.search).get('q') ?? '';
const input = document.querySelector<HTMLInputElement>('#search-q');
const count = document.querySelector<HTMLElement>('[data-search-count]')!;
const cats = document.querySelector<HTMLElement>('[data-search-categories]')!;
const catList = document.querySelector<HTMLElement>('[data-search-category-list]')!;
const empty = document.querySelector<HTMLElement>('[data-search-empty]')!;

if (input) input.value = query;

if (query.trim() === '') {
  count.textContent = 'Введіть назву, артикул або розʼєм.';
} else {
  const results = search(index, query);
  const products = results.filter((r) => r.kind === 'product');
  const categories = results.filter((r) => r.kind === 'category');
  const order = new Map(products.map((r, i) => [r.slug, i]));
  for (const item of document.querySelectorAll<HTMLElement>('[data-search-item]')) {
    const i = order.get(item.dataset.searchItem!);
    item.hidden = i === undefined;
    item.style.order = i === undefined ? '' : String(i);
  }
  catList.replaceChildren(
    ...categories.map((c) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = c.url;
      a.textContent = c.title;
      li.append(a);
      return li;
    }),
  );
  cats.hidden = categories.length === 0;
  empty.hidden = results.length > 0;
  count.textContent = `Знайдено: ${products.length} ${plural(products.length, GOODS)}`;
  document.title = `«${query.trim()}» — пошук · ETS GRID`;
}
