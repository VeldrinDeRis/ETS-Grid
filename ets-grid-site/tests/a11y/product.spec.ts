import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { presetStorage } from '../helpers/viewports';

// Картки 4 рівнів (SPEC-003 AC-12).
const PRODUCTS = ['/product/ets-home-7/', '/product/ets-dc-60/', '/product/panel-550-topcon/', '/product/ets-battery-home-10/', '/product/carport-commercial-8/'];

for (const palette of ['a', 'b'] as const) {
  test.describe(`SPEC-003/AC-12 axe-core, палітра ${palette.toUpperCase()}`, () => {
    for (const url of PRODUCTS) {
      test(url, async ({ page }) => {
        await presetStorage(page, { 'etsgrid:palette': palette });
        await page.goto(url);
        await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        const serious = result.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(serious).toEqual([]);
      });
    }
  });
}

test('SPEC-003 перемикач — радіогрупа, зміна ціни оголошується', async ({ page }) => {
  await page.goto('/product/ets-home-7/');
  await expect(page.locator('[data-turnkey-toggle] input[type="radio"]')).toHaveCount(2);
  await expect(page.locator('[data-price-live]')).toHaveAttribute('aria-live', 'polite');
  await page.getByLabel('З монтажем під ключ').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByLabel('Тільки обладнання')).toBeChecked();
});
