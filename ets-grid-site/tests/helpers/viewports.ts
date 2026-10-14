// Спільне для Playwright-тестів (D-024): екрани, палітра, кошик у сховищі.
import type { Page, TestInfo } from '@playwright/test';

export const isMobile = (info: TestInfo) => info.project.name === 'mobile-375';
export const isDesktop = (info: TestInfo) => info.project.name === 'desktop-1440';

/** Сторінки-представники шаблонів фундаменту. */
export const SAMPLE_PAGES = ['/', '/zaryadni-stantsii/', '/zaryadni-stantsii/dlya-domu/', '/product/ets-home-7/', '/koshyk/'];

/** Записує значення у localStorage до завантаження сторінки — у JSON, як lib/storage.ts. */
export async function presetStorage(page: Page, values: Record<string, unknown>) {
  await page.addInitScript((entries) => {
    for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, JSON.stringify(v));
  }, values);
}

export async function cssVar(page: Page, name: string): Promise<string> {
  return page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}
