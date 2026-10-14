import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { CatalogPage } from '../helpers/catalog';
import { isDesktop, isMobile, presetStorage } from '../helpers/viewports';

const PAGES = ['/zaryadni-stantsii/', '/zaryadni-stantsii/dlya-domu/', '/zaryadni-stantsii/dlya-domu/gbt/', '/sonyachni-paneli/kriplennya/'];

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

    await tabTo('.cf-primary .cf-chip:not([aria-disabled="true"])');
    await page.keyboard.press('Enter');
    await expect(page.locator('.cf-primary .cf-chip[aria-pressed="true"]')).toHaveCount(1);

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
