import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { CatalogPage } from '../helpers/catalog';
import { isDesktop, isMobile, presetStorage } from '../helpers/viewports';

const PAGES = ['/zaryadni-stantsii/', '/zaryadni-stantsii/dlya-domu/', '/zaryadni-stantsii/dlya-domu/gbt/', '/sonyachni-paneli/kriplennya/', '/batarei/'];

async function serious(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
  if (include) builder = builder.include(include);
  const result = await builder.analyze();
  return result.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

for (const palette of ['a', 'b'] as const) {
  test.describe(`SPEC-002/AC-27 axe-core, палітра ${palette.toUpperCase()}`, () => {
    for (const url of PAGES) {
      test(url, async ({ page }) => {
        await presetStorage(page, { 'etsgrid:palette': palette });
        await page.goto(url);
        await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
        expect(await serious(page)).toEqual([]);
      });
    }

    test('відкрита шторка (375)', async ({ page }, info) => {
      test.skip(!isMobile(info), 'тільки mobile');
      await presetStorage(page, { 'etsgrid:palette': palette });
      const catalog = new CatalogPage(page);
      await catalog.open('/zaryadni-stantsii/');
      await page.getByRole('button', { name: /^Фільтри/ }).click();
      expect(await serious(page, '.cf-sheet')).toEqual([]);
    });
  });
}

test.describe('SPEC-002/AC-28 клавіатура', () => {
  test('у доступному імені значення фасету є лічильник', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'фасети в колонці — desktop');
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/');
    // На рівні Type 2 мають 5 товарів: home-7, home-22, duo-22, portable-7, адаптер.
    await expect(page.locator('.cf-sidebar').getByRole('button', { name: /^Type 2\s*,\s*5 товарів$/ })).toBeVisible();
  });

  test('чип → фасет → сортування → «До кошика» з клавіатури (1440)', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/');

    const tabTo = async (predicate: string, limit = 120) => {
      for (let i = 0; i < limit; i++) {
        await page.keyboard.press('Tab');
        if (await page.evaluate((sel) => document.activeElement?.matches(sel) ?? false, predicate)) return;
      }
      throw new Error(`не дійшли Tab до ${predicate}`);
    };

    await tabTo('.cf-primary .cf-tile:not([aria-disabled="true"])');
    await page.keyboard.press('Enter');
    await expect(page.locator('.cf-primary .cf-tile[aria-pressed="true"]')).toHaveCount(1);

    await tabTo('.cf-sidebar .cf-option:not([aria-disabled="true"])');
    await page.keyboard.press('Space');
    await expect(page.locator('.cf-sidebar .cf-option[aria-pressed="true"]')).toHaveCount(1);

    await tabTo('.cf-sort select');
    await page.keyboard.press('ArrowDown');
    await expect(page).toHaveURL(/sort=/);

    await tabTo('.cf-results [data-product-card]:not([hidden]) [data-add-to-cart]');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-cart-count-value]')).toHaveText('1');
  });
});

test.describe('SPEC-002/AC-32 анімація не ламає фокус', () => {
  test('фокус на плитці й на значенні фасету лишається під час перестановки (1440)', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/');
    const tile = catalog.chip('Настінна AC');
    await tile.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    await expect(tile).toBeFocused();
    await page.waitForTimeout(300);
    await expect(tile).toBeFocused();
    const option = catalog.option('Розʼєм', 'Type 2');
    await option.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);
    await expect(option).toBeFocused();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('SPEC-002/AC-39 ревізія 5 з клавіатури', () => {
  test('у доступному імені плитки є лічильник', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/');
    await expect(page.locator('.cf-primary').getByRole('button', { name: /^Настінна AC\s*,\s*3 товари$/ })).toBeVisible();
  });

  test('плитка → фасет → «Ще N фільтрів» → фасет усередині → картка (1440)', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/');
    const tabTo = async (predicate: string, limit = 160) => {
      for (let i = 0; i < limit; i++) {
        await page.keyboard.press('Tab');
        if (await page.evaluate((sel) => document.activeElement?.matches(sel) ?? false, predicate)) return;
      }
      throw new Error(`не дійшли Tab до ${predicate}`);
    };
    await tabTo('.cf-primary .cf-tile:not([aria-disabled="true"])');
    await page.keyboard.press('Enter');
    await expect(page.locator('.cf-primary .cf-tile[aria-pressed="true"]')).toHaveCount(1);
    await tabTo('.cf-sidebar .cf-option:not([aria-disabled="true"])');
    await page.keyboard.press('Space');
    await expect(page.locator('.cf-sidebar .cf-option[aria-pressed="true"]')).toHaveCount(1);
    await tabTo('.cf-sidebar .cf-more > summary');
    await page.keyboard.press('Enter');
    await expect(page.locator('.cf-sidebar .cf-more')).toHaveAttribute('open', '');
    // Перший згорнутий фасет зарядок — «Підбір за авто» (select); беремо «Захист» зі значеннями-кнопками.
    await tabTo('.cf-sidebar .cf-more__body details.cf-facet > summary#side-ip');
    await page.keyboard.press('Enter');
    await expect(page.locator('.cf-sidebar #side-ip').locator('..')).toHaveAttribute('open', '');
    await tabTo('.cf-sidebar .cf-more__body .cf-option:not([aria-disabled="true"])');
    await page.keyboard.press('Space');
    // Вибраний фасет переїжджає з «Ще N» до розкритих (§3.9 Б): у колонці тепер два вибрані значення.
    await expect(page.locator('.cf-sidebar > details.cf-facet .cf-option[aria-pressed="true"]')).toHaveCount(2);
    await expect(page.locator('.cf-sidebar > details.cf-facet > summary#side-ip')).toBeAttached();
    await tabTo('.cf-results [data-product-card]:not([hidden]) a');
  });
});
