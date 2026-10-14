// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// SPEC-001 §3.9. Домен тимчасовий, заведомо неіснуючий, до відповіді на Q-7.
export default defineConfig({
  site: 'https://ets-grid.test',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [preact(), sitemap()],
});
