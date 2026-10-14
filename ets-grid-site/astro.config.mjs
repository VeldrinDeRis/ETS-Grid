// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { motionStudio } from 'motion-studio';

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
  // Острови — Preact; React — лише для островів Motion+ у src/islands/react/ (D-044), файли з прагмою @jsxImportSource react.
  integrations: [
    preact({ include: ['**/src/islands/**/*.{ts,tsx}'], exclude: ['**/src/islands/react/**'] }),
    react({ include: ['**/src/islands/react/**/*.{ts,tsx}'] }),
    sitemap({ filter: (page) => !NOINDEX.some((p) => new URL(page).pathname === p) && !page.includes('404') }),
  ],
  // Motion Studio — таймлайн анімацій лише в dev; сервер редактора: `npx motion-studio serve` (порт 5200), D-052.
  vite: {
    plugins: [motionStudio({ serverUrl: 'http://localhost:5200' })],
  },
});
