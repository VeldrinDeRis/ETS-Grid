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

/** Головна в кінцевому стані (SPEC-006 AC-24, AC-30): слова H1 загорілися, схема акту II ввімкнена цілком —
 *  контраст перевіряємо після анімацій. На інших сторінках — одразу. */
export async function heroSettled(page: Page) {
  await page.waitForFunction(() => {
    const h1 = document.querySelector('.hero__title');
    return !h1 || (!h1.querySelector('.hero__word') && getComputedStyle(h1).opacity === '1');
  }, null, { timeout: 3000 });
  const flow = page.locator('[data-energy-flow]');
  if ((await flow.count()) === 0) return;
  // Desktop: прокрутка до кінця треку вмикає всі вузли; mobile: вузли вмикаються в кадрі — проходимо список.
  // boundingBox — відносно вікна, тому переводимо в координати документа.
  const rect = (await flow.boundingBox())!;
  const box = { ...rect, y: rect.y + (await page.evaluate(() => window.scrollY)) };
  const vh = page.viewportSize()!.height;
  for (let y = box.y; y <= box.y + box.height; y += vh * 0.6) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(80);
  }
  // Лишаємося в кінці треку (axe сам гортає сторінку під час перевірки — сцена односпрямована, тож це безпечно).
  const end = Math.max(0, box.y + box.height - vh);
  const allLit = () => [...document.querySelectorAll('[data-energy-flow] [data-node]')].every((n) => n.hasAttribute('data-lit'));
  for (let attempt = 0; attempt < 8; attempt++) {
    await page.evaluate((v) => window.scrollTo(0, v), end - (attempt % 2));
    const ok = await page.waitForFunction(allLit, null, { timeout: 1500 }).then(() => true, () => false);
    if (ok) break;
    if (attempt === 7) throw new Error('схема не ввімкнулася цілком');
  }
  await page.waitForTimeout(700);
}
