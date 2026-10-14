// Навігатор фінансування (SPEC-007 §3.1, §4): відповіді фільтрують список програм; без JS видно всі.
import { matchPrograms, type FinancingAnswers, type ProgramTags } from '../lib/financing';
import { plural } from '../lib/plural';

const form = document.querySelector<HTMLFormElement>('[data-financing-nav]');
const items = [...document.querySelectorAll<HTMLElement>('[data-program]')];
const count = document.querySelector<HTMLElement>('[data-financing-count]');
const none = document.querySelector<HTMLElement>('[data-financing-none]');

// Теги програм — з розмітки, щоб скрипт не тягнув JSON і схему сторінки.
const programs: ProgramTags[] = items.map((el) => ({
  id: el.dataset.program!,
  who: el.dataset.who!.split(' '),
  what: el.dataset.what!.split(' '),
  sum: el.dataset.sum!.split(' '),
}));

function update() {
  if (!form) return;
  const data = new FormData(form);
  const answers: FinancingAnswers = {
    who: (data.get('who') as string) ?? undefined,
    what: (data.get('what') as string) ?? undefined,
    sum: (data.get('sum') as string) ?? undefined,
  };
  const ids = new Set(matchPrograms(programs, answers).map((p) => p.id));
  for (const el of items) el.hidden = !ids.has(el.dataset.program!);
  if (none) none.hidden = ids.size > 0;
  if (count) count.textContent = `Підходить: ${ids.size} ${plural(ids.size, ['програма', 'програми', 'програм'])}`;
}

form?.addEventListener('change', update);
form?.addEventListener('reset', () => requestAnimationFrame(update));
update();
