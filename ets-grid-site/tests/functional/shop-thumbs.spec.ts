// SPEC-005 ревізія 1 (D-071): мініатюри в кошику, оформленні, порівнянні, «Недавно переглянуті» (AC-13), плитки (AC-14).
import { expect, test, type Locator } from '@playwright/test';
import { presetStorage } from '../helpers/viewports';

const CART = [
  { slug: 'ets-home-7', qty: 1, turnkey: true },
  { slug: 'panel-550-topcon', qty: 10, turnkey: false },
];

/** Кожна мініатюра — <picture> з завантаженим кадром і підписом «Ілюстративне фото»; сірих квадратів з рівнем немає. */
async function expectThumbs(scope: Locator, n: number) {
  const thumbs = scope.locator('[data-product-thumb]');
  await expect(thumbs).toHaveCount(n);
  for (const t of await thumbs.all()) {
    const img = t.locator('img');
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await expect(t.locator('.pthumb__note')).toHaveText('Ілюстративне фото');
  }
  await expect(scope.locator('.shop-thumb')).toHaveCount(0);
}

test.describe('SPEC-005/AC-13 мініатюра товару', () => {
  test('кошик: позиції й «Недавно переглянуті»', async ({ page }) => {
    await presetStorage(page, { 'etsgrid:cart:v1': CART, 'etsgrid:recent:v1': ['ets-home-22'] });
    await page.goto('/koshyk/');
    await expect(page.locator('[data-totals]')).toBeVisible();
    await expectThumbs(page.locator('main'), 3);
  });

  test('оформлення: зведення замовлення', async ({ page }) => {
    await presetStorage(page, { 'etsgrid:cart:v1': CART });
    await page.goto('/oformlennya/');
    await expectThumbs(page.locator('.shop-summary'), 2);
  });

  test('порівняння', async ({ page }) => {
    await presetStorage(page, { 'etsgrid:compare:v1': ['ets-home-7', 'ets-home-22'] });
    await page.goto('/porivnyannya/');
    await expectThumbs(page.locator('main'), 2);
  });

  test('картка товару: «Недавно переглянуті»', async ({ page }) => {
    await presetStorage(page, { 'etsgrid:recent:v1': ['ets-home-22', 'panel-550-topcon'] });
    await page.goto('/product/ets-home-7/');
    await expectThumbs(page.locator('[data-recent-list]'), 2);
  });
});

test.describe('SPEC-005/AC-14 плитки рівнів', () => {
  test('порожній кошик: плитки з іконкою, ціною «від», вогник загоряється на наведенні', async ({ page }) => {
    await page.goto('/koshyk/');
    const tiles = page.locator('.shop-tile');
    await expect(tiles).toHaveCount(4);
    await expect(tiles.first().locator('svg.icon')).toBeVisible();
    await expect(tiles.first().locator('.shop-tile__price')).toHaveText(/від\s\d|Ціна за розрахунком/);
    const glow = () => tiles.first().evaluate((el) => getComputedStyle(el, '::after').opacity);
    await expect.poll(glow).toBe('0.3');
    await tiles.first().focus();
    await expect.poll(glow).toBe('1');
  });
});
