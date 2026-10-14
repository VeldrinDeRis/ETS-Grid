// Перемикання палітри А/Б одним атрибутом data-palette на <html> (SPEC-001 §3.6).
// Збережений вибір застосовує вбудований скрипт у <head> ще до відмальовки.
import { KEYS, PALETTE_B_FONTS, type Palette, write } from '../lib/storage';

const root = document.documentElement;
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-palette-set]')];

function render() {
  const current = root.dataset.palette;
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.paletteSet === current));
}

for (const button of buttons) {
  button.addEventListener('click', () => {
    const palette = button.dataset.paletteSet as Palette;
    root.dataset.palette = palette;
    write(KEYS.palette, palette);
    if (palette === 'b' && !document.querySelector('link[data-palette-fonts]')) {
      const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: PALETTE_B_FONTS });
      link.dataset.paletteFonts = 'b';
      document.head.append(link);
    }
    render();
  });
}

render();
