// SPEC-002 ревізія 6 (D-065): гортання міні-галереї картки (AC-43).
import { expect, test } from '@playwright/test';
import { CatalogPage } from '../helpers/catalog';
import { isDesktop, isMobile } from '../helpers/viewports';

const LISTING = '/zaryadni-stantsii/dlya-domu/';

test.describe('SPEC-002/AC-43 гортання міні-галереї картки', () => {
  test('«Наступний кадр» показує другий кадр, точка 2 активна', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open(LISTING);
    const card = catalog.visibleCards().first();
    const gallery = card.locator('[data-card-gallery]');
    await expect(gallery).toBeVisible();
    await expect(card.locator('.pgal__dot')).toHaveCount(5);
    await expect(card.locator('.pgal__dot[aria-selected="true"]')).toHaveAttribute('aria-label', 'Кадр 1 з 5');
    const second = card.locator('.pgal__shot').nth(1);
    const before = await second.boundingBox();
    await card.getByRole('button', { name: /^Наступний кадр/ }).click();
    await expect(card.locator('.pgal__dot[aria-selected="true"]')).toHaveAttribute('aria-label', 'Кадр 2 з 5');
    await expect.poll(async () => (await second.boundingBox())!.x).toBeLessThan(before!.x);
    // Другий кадр став у вікно картки.
    const frame = await card.locator('.product-card__photo').boundingBox();
    await expect.poll(async () => Math.abs((await second.boundingBox())!.x - frame!.x)).toBeLessThan(4);
  });

  test('перетягування листає кадри (375)', async ({ page }, info) => {
    test.skip(!isMobile(info), 'mobile');
    const catalog = new CatalogPage(page);
    await catalog.open(LISTING);
    const card = catalog.visibleCards().first();
    const box = (await card.locator('.product-card__photo').boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(box.x + box.width * (0.8 - 0.075 * i), y);
    await page.mouse.up();
    await expect(card.locator('.pgal__dot[aria-selected="true"]')).toHaveAttribute('aria-label', 'Кадр 2 з 5');
  });

  test('фільтр і сортування працюють із галереями (1440)', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/');
    await catalog.chip('Настінна AC').click();
    await expect(catalog.visibleCards()).toHaveCount(3);
    await page.locator('.cf-sort select').selectOption('price-asc');
    await page.waitForTimeout(450);
    expect(await catalog.orderedSlugs()).toEqual(['ets-home-11-gbt', 'ets-home-7', 'ets-home-22']);
    for (const card of await catalog.visibleCards().all()) await expect(card.locator('[data-card-gallery]')).toBeVisible();
  });

  test.describe('без JS', () => {
    test.use({ javaScriptEnabled: false });
    test('видно перший кадр, решта не стирчить', async ({ page }) => {
      await page.goto(LISTING);
      const card = page.locator('[data-product-card]').first();
      const photo = card.locator('.product-card__photo');
      await expect(photo).toBeVisible();
      const box = (await photo.boundingBox())!;
      expect(Math.abs(box.width - box.height)).toBeLessThan(3);
      const first = (await card.locator('.product-card__frame').first().boundingBox())!;
      expect(Math.abs(first.width - box.width)).toBeLessThan(3);
      // Кадри після першого — нижче видимої області картки (overflow: hidden обрізає їх).
      const second = (await card.locator('.product-card__frame').nth(1).boundingBox())!;
      expect(second.y).toBeGreaterThanOrEqual(box.y + box.height - 1);
    });
  });
});
