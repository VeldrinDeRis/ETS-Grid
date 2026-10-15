// SPEC-005 ревізія 1 (D-071, AC-14): axe wcag22aa на кошику, оформленні, порівнянні й «Дякуємо» з новими мініатюрами й плитками.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { presetStorage } from '../helpers/viewports';

async function serious(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return result.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

const CART = [
  { slug: 'ets-home-7', qty: 1, turnkey: true },
  { slug: 'panel-550-topcon', qty: 10, turnkey: false },
];

test.describe('SPEC-005/AC-14 axe wcag22aa', () => {
  test('порожній кошик (плитки рівнів)', async ({ page }) => {
    await page.goto('/koshyk/');
    await expect(page.locator('.shop-tile')).toHaveCount(4);
    expect(await serious(page)).toEqual([]);
  });

  test('кошик із товарами', async ({ page }) => {
    await presetStorage(page, { 'etsgrid:cart:v1': CART, 'etsgrid:recent:v1': ['ets-home-22'] });
    await page.goto('/koshyk/');
    await expect(page.locator('[data-product-thumb]').first()).toBeVisible();
    expect(await serious(page)).toEqual([]);
  });

  test('оформлення', async ({ page }) => {
    await presetStorage(page, { 'etsgrid:cart:v1': CART });
    await page.goto('/oformlennya/');
    await expect(page.locator('.shop-summary [data-product-thumb]').first()).toBeVisible();
    expect(await serious(page)).toEqual([]);
  });

  test('порівняння', async ({ page }) => {
    await presetStorage(page, { 'etsgrid:compare:v1': ['ets-home-7', 'ets-home-22'] });
    await page.goto('/porivnyannya/');
    await expect(page.locator('[data-product-thumb]').first()).toBeVisible();
    expect(await serious(page)).toEqual([]);
  });

  test('«Дякуємо»', async ({ page }) => {
    await page.goto('/dyakuyemo/');
    expect(await serious(page)).toEqual([]);
  });
});
