// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// Службові сторінки не йдуть у sitemap (SPEC-008 §3.3); список дублює NOINDEX_PATHS із src/lib/seo.ts — тест звіряє.
const NOINDEX = ['/koshyk/', '/oformlennya/', '/dyakuyemo/', '/porivnyannya/', '/poshuk/'];

// SPEC-001 §3.9. Домен тимчасовий, заведомо неіснуючий, до відповіді на Q-7.
export default defineConfig({
  site: 'https://ets-grid.test',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS — у HTML: без блокуючих запитів на першому екрані (SPEC-010 AC-10, трасування mobile).
    inlineStylesheets: 'always',
  },
  integrations: [preact(), sitemap({ filter: (page) => !NOINDEX.some((p) => new URL(page).pathname === p) && !page.includes('404') })],
});
