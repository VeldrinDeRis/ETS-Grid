// SPEC-002 ревізія 6 (D-065): доступність міні-галереї картки (AC-44).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { CatalogPage } from '../helpers/catalog';
import { isDesktop } from '../helpers/viewports';

test.describe('SPEC-002/AC-44 міні-галерея картки доступна', () => {
  test('axe-core: 0 serious/critical на лістингу з галереями', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/dlya-domu/');
    await expect(page.locator('[data-card-gallery]').first()).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });

  test('стрілки й точки з іменами товару, керування з клавіатури (1440)', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/dlya-domu/');
    const card = catalog.visibleCards().first();
    const name = (await card.locator('.product-card__title a').textContent())!.trim();
    const next = card.getByRole('button', { name: `Наступний кадр: ${name}` });
    await expect(next).toBeVisible();
    await expect(card.getByRole('tablist', { name: `Кадри: ${name}` })).toBeVisible();
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(card.locator('.pgal__dot[aria-selected="true"]')).toHaveAttribute('aria-label', 'Кадр 2 з 5');
    await card.getByRole('tab', { name: 'Кадр 4 з 5' }).focus();
    await page.keyboard.press('Enter');
    await expect(card.locator('.pgal__dot[aria-selected="true"]')).toHaveAttribute('aria-label', 'Кадр 4 з 5');
    await expect(next).toBeEnabled();
  });
});
