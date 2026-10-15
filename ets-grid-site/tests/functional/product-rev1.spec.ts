// SPEC-003 ревізія 1 (D-071): прилиплий блок покупки, нижня плашка (AC-15), висота й акордеон (AC-16), гортання (AC-14).
import { expect, test } from '@playwright/test';
import { isDesktop, isMobile } from '../helpers/viewports';

const HOME7 = '/product/ets-home-7/';

test.describe('SPEC-003/AC-15 блок покупки під рукою', () => {
  test('1440: блок покупки прилипає, поки гортаються характеристики', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    await page.goto(HOME7);
    const buy = page.locator('.ptop__info');
    // «Головне» під галереєю біля верху кадру: блок покупки праворуч стоїть на відступі space-m.
    await page.evaluate(() => document.querySelector('[data-product-block="chars"]')!.scrollIntoView({ block: 'start' }));
    const top = await buy.evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThan(60);
    await expect(buy.getByRole('button', { name: 'До кошика' })).toBeInViewport();
  });

  test('375: нижня плашка зʼявляється, коли блок покупки пішов з кадру, і зникає при поверненні', async ({ page }, info) => {
    test.skip(!isMobile(info), 'mobile');
    await page.goto(HOME7);
    const sticky = page.locator('[data-sticky]');
    await expect(sticky).toBeHidden();
    await page.locator('[data-product-part="spec-table"]').scrollIntoViewIfNeeded();
    await expect(sticky).toBeVisible();
    await expect(sticky.locator('[data-sticky-price]')).toHaveText(/\d/);
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('[data-product-block="price"]').scrollIntoViewIfNeeded();
    await expect(sticky).toBeHidden();
  });
});

test.describe('SPEC-003/AC-16 три смуги', () => {
  test('висота сторінки без підвалу: ≤ 3 600 px на 1440, ≤ 5 000 на 375', async ({ page }, info) => {
    await page.goto(HOME7);
    const height = await page.evaluate(() => document.querySelector('footer')!.getBoundingClientRect().top + scrollY);
    expect(height).toBeLessThanOrEqual(isDesktop(info) ? 3600 : 5000);
  });

  test('акордеон: пункт відкривається й закривається, працює і без JS', async ({ page }) => {
    await page.goto(HOME7);
    const install = page.locator('[data-product-block="install"]');
    await expect(install).not.toHaveAttribute('open', '');
    await install.locator('summary').click();
    await expect(install).toHaveAttribute('open', '');
    await expect(install.getByText('Строки монтажу')).toBeVisible();
    await install.locator('summary').click();
    await expect(install).not.toHaveAttribute('open', '');
  });
});

test.describe('SPEC-003/AC-14 галерея гортається', () => {
  test('мініатюра до гідратації веде на свій кадр', async ({ page }) => {
    await page.goto(HOME7);
    const gallery = page.locator('[data-product-gallery]');
    await expect(gallery.locator('xpath=ancestor::astro-island[1]')).toHaveAttribute('ssr', '');
    await gallery.getByRole('button', { name: 'Кадр 3 з 5' }).click();
    await expect(gallery.getByRole('button', { name: 'Кадр 3 з 5' })).toHaveAttribute('aria-current', 'true');
  });
});

test.describe('SPEC-003/AC-16 без JS', () => {
  test.use({ javaScriptEnabled: false });
  test('акордеон — звичайні <details>, перший кадр галереї видно', async ({ page }) => {
    await page.goto(HOME7);
    const delivery = page.locator('[data-product-block="delivery"]');
    await delivery.locator('summary').click();
    await expect(delivery).toHaveAttribute('open', '');
    const img = page.locator('.gallery__frame img').first();
    await expect(img).toBeVisible();
  });
});
