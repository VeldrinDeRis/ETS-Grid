// SPEC-001 ревізія 10, SPEC-002 ревізія 7 (D-067): висота порогу і вітрина в першому екрані (AC-27, AC-46).
import { expect, test } from '@playwright/test';
import { isDesktop, isMobile } from '../helpers/viewports';

// Висота порогу без лід-абзацу: ліміт min — крихти + H1 (SPEC-001 AC-27), лід росте з текстом.
const heightOf = (page: import('@playwright/test').Page) =>
  page.locator('[data-page-top]').evaluate((el) => {
    const lead = [...el.querySelectorAll('.cp-lead')].reduce((h, p) => h + p.getBoundingClientRect().height, 0);
    return el.getBoundingClientRect().height - lead;
  });

test.describe('SPEC-001/AC-27 висота нічного порогу', () => {
  test('min ≤ 160 px на 375 (крихти + H1)', async ({ page }, info) => {
    test.skip(!isMobile(info), 'mobile');
    for (const url of ['/koshyk/', '/kontakty/', '/product/ets-home-7/', '/porivnyannya/']) {
      await page.goto(url);
      expect(await heightOf(page), url).toBeLessThanOrEqual(160);
    }
  });

  test('rich ≤ 560 px на 1440 і ≤ 720 px на 375', async ({ page }, info) => {
    const limit = isDesktop(info) ? 560 : 720;
    for (const url of ['/zaryadni-stantsii/', '/batarei/', '/solar-carport/']) {
      await page.goto(url);
      expect(await heightOf(page), url).toBeLessThanOrEqual(limit);
    }
  });

  test('шапка й поріг — ніч: фон тла ночі', async ({ page }) => {
    await page.goto('/batarei/dlya-domu/');
    const [header, top] = await Promise.all([
      page.locator('header.site-header').evaluate((el) => getComputedStyle(el).backgroundColor),
      page.locator('[data-page-top]').evaluate((el) => getComputedStyle(el).backgroundColor),
    ]);
    expect(header).toBe('rgb(13, 20, 36)');
    expect(top).toBe('rgb(13, 20, 36)');
  });
});

test.describe('SPEC-002/AC-46 вітрина в першому екрані', () => {
  test('на 1440 перша плитка головного фільтра видна без прокрутки', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    await page.goto('/zaryadni-stantsii/dlya-domu/');
    const box = await page.locator('.cf-primary .cf-tile, .cf').first().boundingBox();
    expect(box!.y).toBeLessThan(900);
  });
});
