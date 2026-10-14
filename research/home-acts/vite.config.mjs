// Макет актів I–II головної (SPEC-006 §4.9, D-053). Пакети — з ets-grid-site/node_modules, щоб macет жив на тих самих
// motion / @motionplus/core / react, що й сайт. Запуск: npm run dev --prefix ets-grid-site -- --config ../research/home-acts/vite.config.mjs
// Без import { defineConfig } from 'vite': пакет vite живе в ets-grid-site/node_modules і звідси не резолвиться.
import { fileURLToPath } from 'node:url';
const defineConfig = (c) => c;

const here = fileURLToPath(new URL('.', import.meta.url));
const site = fileURLToPath(new URL('../../ets-grid-site/', import.meta.url));
const nm = (name) => `${site}node_modules/${name}`;

export default defineConfig({
  root: here,
  publicDir: `${site}public`,
  server: { port: 4330, strictPort: true, fs: { allow: [site, here] } },
  resolve: {
    alias: [
      { find: /^motion(\/.*)?$/, replacement: `${nm('motion')}$1` },
      // Підшляхи @motionplus/core — лише через exports пакета; аліас на теку їх ламає, тому прямо на файли.
      { find: /^@motionplus\/core\/react$/, replacement: `${nm('@motionplus/core')}/dist/es/react-entry.mjs` },
      { find: /^@motionplus\/core\/curtains$/, replacement: `${nm('@motionplus/core')}/dist/es/curtains.mjs` },
      { find: /^@motionplus\/core$/, replacement: `${nm('@motionplus/core')}/dist/es/index.mjs` },
      { find: /^react(\/.*)?$/, replacement: `${nm('react')}$1` },
      { find: /^react-dom(\/.*)?$/, replacement: `${nm('react-dom')}$1` },
    ],
  },
  build: { outDir: `${here}dist`, emptyOutDir: true, copyPublicDir: false },
});
