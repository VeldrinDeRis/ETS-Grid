// SPEC-002 ревізія 4–5: перестановка карток animateLayout (AC-30, AC-31), плитки, «Ще N фільтрів», AnimateNumber (AC-36, AC-37).
import { expect, test, type Page } from '@playwright/test';
import { CatalogPage } from '../helpers/catalog';
import { isDesktop } from '../helpers/viewports';

const LEVEL = '/zaryadni-stantsii/';

/** Клік і вибірка transform у видимих карток через `afterMs` (анімація йде 320 мс). */
async function transformsAfterClick(page: Page, selector: string, afterMs: number): Promise<number> {
  return page.evaluate(
    async ([sel, ms]) => {
      (document.querySelector(sel as string) as HTMLElement).click();
      await new Promise((r) => setTimeout(r, ms as number));
      return [...document.querySelectorAll<HTMLElement>('.cf-results [data-product-card]:not([hidden])')].filter(
        (c) => getComputedStyle(c).transform !== 'none',
      ).length;
    },
    [selector, afterMs] as const,
  );
}

const openKeys = (page: Page, scope = '.cf-sidebar') =>
  page.$$eval(`${scope} > details.cf-facet:not(.cf-more) > summary`, (els) => els.map((e) => e.id.replace(/^\w+-/, '')));

test.describe('SPEC-002/AC-30 перестановка карток animateLayout', () => {
  test('після зміни фільтра картки їдуть transform-ом, за ≤ 400 мс стоять на місцях у порядку sortProducts; «Знайдено» — одразу', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    expect(await transformsAfterClick(page, '.cf-tile[data-type-tile="wall_ac"]', 120)).toBeGreaterThan(0);
    await expect(catalog.total()).toHaveText('3');
    await page.waitForTimeout(400);
    expect(await page.$$eval('.cf-results [data-product-card]:not([hidden])', (els) => els.filter((c) => getComputedStyle(c).transform !== 'none').length)).toBe(0);
    await page.locator('.cf-sort select').selectOption('price-asc');
    await page.waitForTimeout(450);
    expect(await catalog.orderedSlugs()).toEqual(['ets-home-11-gbt', 'ets-home-7', 'ets-home-22']);
  });
});

test.describe('SPEC-002/AC-31 без анімації', () => {
  test('стан з URL при завантаженні — без transform', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open(`${LEVEL}?type=wall_ac`);
    await expect(catalog.visibleCards()).toHaveCount(3);
    expect(await page.$$eval('.cf-results [data-product-card]', (els) => els.filter((c) => getComputedStyle(c).transform !== 'none').length)).toBe(0);
  });

  test('5 швидких змін поспіль закінчуються видачею останнього стану', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    // Плитки — перемикачі: wall_ac → +dc → −wall_ac → +split_dc → −split_dc = лише dc.
    for (const type of ['wall_ac', 'dc', 'wall_ac', 'split_dc', 'split_dc']) await page.locator(`.cf-tile[data-type-tile="${type}"]`).click();
    await expect(page).toHaveURL(/\?type=dc$/);
    await page.waitForTimeout(450);
    await expect(catalog.visibleCards()).toHaveCount(2);
    expect(await page.$$eval('.cf-results [data-product-card]:not([hidden])', (els) => els.filter((c) => getComputedStyle(c).transform !== 'none').length)).toBe(0);
  });

  test.describe('prefers-reduced-motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('правка без animateLayout, числа — одразу', async ({ page }, info) => {
      test.skip(!isDesktop(info), 'desktop');
      const catalog = new CatalogPage(page);
      await catalog.open(LEVEL);
      await expect(page.locator('html')).not.toHaveAttribute('data-motion', 'on');
      expect(await transformsAfterClick(page, '.cf-tile[data-type-tile="wall_ac"]', 60)).toBe(0);
      await expect(page.locator('.cf-total strong')).toHaveText('3');
      await expect(page.locator('.cf-total strong [aria-label]')).toHaveCount(0);
    });
  });
});

test.describe('SPEC-002/AC-36 плитки, вогник, «Ще N фільтрів», стабільне ранжування', () => {
  test('плитка: aria-pressed, вогник ::after горить, видача й URL змінюються', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    const tile = catalog.chip('Настінна AC');
    await expect(tile.locator('svg[data-icon="wall-charger"]')).toBeAttached();
    expect(await tile.evaluate((el) => getComputedStyle(el, '::after').opacity)).toBe('0.3');
    await tile.click();
    await expect(tile).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => tile.evaluate((el) => getComputedStyle(el, '::after').opacity)).toBe('1');
    await expect(catalog.visibleCards()).toHaveCount(3);
    await expect(page).toHaveURL(/\?type=wall_ac$/);
  });

  test('«Ще N фільтрів» розкриває згорнуті фасети, фільтр усередині працює; фасети не стрибають між групами (1440)', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'колонка — desktop');
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    const more = page.locator('.cf-sidebar details.cf-more');
    const folded = await more.locator('.cf-more__body > details.cf-facet').count();
    await expect(more.locator('> summary')).toHaveText(new RegExp(`^Ще ${folded} фільтр`));
    expect(await openKeys(page)).toHaveLength(4);
    const before = await openKeys(page);

    await catalog.reveal('Захист');
    const ip = catalog.option('Захист', 'IP55');
    await expect(ip).toBeVisible();
    await ip.click();
    await expect(page).toHaveURL(/ip=IP55/);
    await expect(catalog.visibleCards()).toHaveCount(await catalog.visibleCards().count());
    // Вибраний фасет переїжджає до розкритих і лишається там; решта не рухається.
    const after = await openKeys(page);
    expect(after).toContain('ip');
    expect(after.filter((k) => k !== 'ip')).toEqual(before);
    await ip.click();
    expect(await openKeys(page)).toEqual(after);
    await catalog.chip('Швидка DC').click();
    expect(await openKeys(page)).toEqual(after);
  });

  test('фасети без даних — одна плашка з переліком (D-031)', async ({ page }, info) => {
    const catalog = new CatalogPage(page);
    await catalog.open('/batarei/');
    const scope = isDesktop(info) ? '.cf-sidebar' : '.cf-sheet';
    if (!isDesktop(info)) await page.getByRole('button', { name: /^Фільтри/ }).click();
    const plate = page.locator(`${scope} .cf-missing-plate`);
    await expect(plate).toBeVisible();
    await expect(plate).toHaveAttribute('aria-disabled', 'true');
    await expect(plate).toHaveAttribute('data-missing-facets', 'inverters,brand,warranty');
    await expect(plate).toContainText('зʼявляться з даними замовника');
    for (const label of ['Сумісні інвертори', 'Бренд', 'Гарантія']) await expect(plate.locator('[data-missing-facet]', { hasText: label })).toBeVisible();
    await expect(page.locator(`${scope} details.cf-facet`, { hasText: 'Бренд' })).toHaveCount(0);
  });
});

test.describe('SPEC-002/AC-37 живі числа AnimateNumber', () => {
  test('«Знайдено: N» докручується до N за ≤ 600 мс; перший показ — без прокрутки; aria-live — звичайний текст', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    const live = page.locator('.cf-total strong [aria-label]').first();
    await expect(live).toHaveAttribute('aria-label', '10');
    const started = Date.now();
    await catalog.chip('Настінна AC').click();
    await expect(live).toHaveAttribute('aria-label', '3', { timeout: 600 });
    expect(Date.now() - started).toBeLessThanOrEqual(1500);
    await expect(catalog.total()).toHaveText('3');
    await expect(page.locator('.cf-toolbar [aria-live]')).toHaveText('Знайдено: 3 товари');
    // Лічильник розкритого фасету теж живий.
    await expect(catalog.option('Розʼєм', 'Type 2').locator('.cf-option__count [aria-label]')).toHaveAttribute('aria-label', '2');
  });
});
