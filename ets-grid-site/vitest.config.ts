/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Категорії D-024: unit, data, build — Vitest; functional, a11y, visual — Playwright.
export default getViteConfig({
  test: {
    environment: 'node',
    include: ['tests/{unit,data,build}/**/*.test.ts'],
  },
});
