// Підказки пошуку в шапці (SPEC-005 §3.7, ревізія SPEC-001): WAI-ARIA Combobox зі списком.
// Індекс вантажиться з /search-index.json при першому фокусі; без JS форма просто веде на /poshuk/?q=.
import { search, type SearchEntry } from '../lib/search';

const MIN_CHARS = 2;
const LIMIT = 6;

let index: SearchEntry[] | null = null;
let loading: Promise<void> | null = null;

function load(): Promise<void> {
  loading ??= fetch('/search-index.json')
    .then((r) => (r.ok ? r.json() : []))
    .then((data: SearchEntry[]) => {
      index = data;
    })
    .catch(() => {
      index = [];
    });
  return loading;
}

function setup(form: HTMLFormElement) {
  const input = form.querySelector<HTMLInputElement>('input[role="combobox"]');
  const list = form.querySelector<HTMLUListElement>('[role="listbox"]');
  const status = form.querySelector<HTMLElement>('[data-suggest-status]');
  if (!input || !list) return;
  let results: SearchEntry[] = [];
  let active = -1;

  const optionId = (i: number) => `${list.id}-${i}`;

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };

  const highlight = (i: number) => {
    active = i;
    for (const [n, li] of [...list.children].entries()) li.setAttribute('aria-selected', String(n === i));
    if (i >= 0) {
      input.setAttribute('aria-activedescendant', optionId(i));
      list.children[i]?.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };

  const render = () => {
    list.replaceChildren(
      ...results.map((r, i) => {
        const li = document.createElement('li');
        li.id = optionId(i);
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.dataset.url = r.url;
        const title = document.createElement('span');
        title.className = 'suggest__title';
        title.textContent = r.title;
        const sub = document.createElement('span');
        sub.className = 'suggest__sub';
        sub.textContent = r.subtitle;
        li.append(title, sub);
        // mousedown не забирає фокус з поля — клік відкриває сторінку.
        li.addEventListener('mousedown', (e) => e.preventDefault());
        li.addEventListener('click', () => location.assign(r.url));
        return li;
      }),
    );
    active = -1;
    input.removeAttribute('aria-activedescendant');
    const open = results.length > 0;
    list.hidden = !open;
    input.setAttribute('aria-expanded', String(open));
    if (status) status.textContent = open ? `Підказок: ${results.length}. Стрілки вниз і вгору — вибір.` : 'Підказок немає';
  };

  const update = async () => {
    const q = input.value;
    if (q.trim().length < MIN_CHARS) {
      results = [];
      close();
      if (status) status.textContent = '';
      return;
    }
    await load();
    if (input.value !== q) return;
    results = search(index ?? [], q, LIMIT);
    render();
  };

  input.addEventListener('focus', () => void load());
  input.addEventListener('input', () => void update());
  input.addEventListener('blur', close);

  input.addEventListener('keydown', (e) => {
    const open = !list.hidden;
    switch (e.key) {
      case 'ArrowDown':
        if (results.length === 0) return;
        e.preventDefault();
        if (!open) {
          list.hidden = false;
          input.setAttribute('aria-expanded', 'true');
        }
        highlight(active + 1 >= results.length ? 0 : active + 1);
        break;
      case 'ArrowUp':
        if (!open || results.length === 0) return;
        e.preventDefault();
        highlight(active <= 0 ? results.length - 1 : active - 1);
        break;
      case 'Enter':
        if (open && active >= 0) {
          e.preventDefault();
          location.assign(results[active].url);
        }
        break;
      case 'Escape':
        // Не даємо шапці закрити мобільне меню: Esc спершу закриває підказки, потім чистить поле.
        e.stopPropagation();
        if (open) {
          e.preventDefault();
          close();
        } else if (input.value) {
          e.preventDefault();
          input.value = '';
          results = [];
        }
        break;
    }
  });
}

for (const form of document.querySelectorAll<HTMLFormElement>('[data-search-suggest]')) setup(form);
