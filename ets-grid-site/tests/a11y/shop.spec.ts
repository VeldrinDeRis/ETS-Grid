import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { presetStorage } from '../helpers/viewports';

async function serious(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return result.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

const CART = [
  { slug: 'ets-home-7', qty: 1, turnkey: true },
  { slug: 'panel-550-topcon', qty: 10, turnkey: false },
];

for (const palette of ['a', 'b'] as const) {
  test.describe(`SPEC-005/AC-11 axe-core, палітра ${palette.toUpperCase()}`, () => {
    test('кошик порожній і з товарами', async ({ page }) => {
      await presetStorage(page, { 'etsgrid:palette': palette, 'etsgrid:recent:v1': ['ets-home-22'] });
      await page.goto('/koshyk/');
      await expect(page.getByRole('heading', { name: 'Кошик порожній' })).toBeVisible();
      expect(await serious(page)).toEqual([]);
      await page.evaluate((cart) => {
        localStorage.setItem('etsgrid:cart:v1', JSON.stringify(cart));
        window.dispatchEvent(new Event('etsgrid:cart-change'));
      }, CART);
      await expect(page.locator('[data-totals]')).toBeVisible();
      expect(await serious(page)).toEqual([]);
    });

    test('оформлення з помилками', async ({ page }) => {
      await presetStorage(page, { 'etsgrid:palette': palette, 'etsgrid:cart:v1': CART });
      await page.goto('/oformlennya/');
      await page.getByLabel('Рахунок для юрособи').check();
      await page.getByRole('button', { name: 'Підтвердити замовлення' }).click();
      await expect(page.locator('[data-checkout-errors]')).toBeVisible();
      expect(await serious(page)).toEqual([]);
    });

    test('порівняння і «Тільки відмінності»', async ({ page }) => {
      await presetStorage(page, { 'etsgrid:palette': palette, 'etsgrid:compare:v1': ['ets-home-7', 'ets-dc-60', 'ets-battery-home-10'] });
      await page.goto('/porivnyannya/');
      await expect(page.locator('table.cmp')).toBeVisible();
      expect(await serious(page)).toEqual([]);
      await page.getByRole('button', { name: 'Тільки відмінності' }).click();
      expect(await serious(page)).toEqual([]);
    });

    test('пошук: результати і нічого не знайдено', async ({ page }) => {
      await presetStorage(page, { 'etsgrid:palette': palette });
      await page.goto('/poshuk/?q=ets');
      await expect(page.locator('[data-search-count]')).toContainText('Знайдено:');
      expect(await serious(page)).toEqual([]);
      await page.goto('/poshuk/?q=qwertyuiop');
      await expect(page.locator('[data-search-empty]')).toBeVisible();
      expect(await serious(page)).toEqual([]);
    });

    test('«Дякуємо» за замовлення', async ({ page }) => {
      await presetStorage(page, { 'etsgrid:palette': palette });
      await page.goto('/dyakuyemo/?type=order&id=ETS-20261014-AB12');
      await expect(page.locator('[data-thanks-order]')).toBeVisible();
      expect(await serious(page)).toEqual([]);
    });
  });
}
