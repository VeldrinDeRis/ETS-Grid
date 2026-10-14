import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { presetStorage } from '../helpers/viewports';

const PAGES: [string, string][] = [
  ['/', 'power'],
  ['/zaryadni-stantsii/', 'charging'],
  ['/sonyachni-paneli/', 'solar'],
  ['/batarei/', 'battery'],
  ['/solar-carport/', 'carport'],
];

async function hydrate(page: Page, kind: string) {
  const root = page.locator(`[data-picker="${kind}"]`);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute('data-ready', 'true');
  return root;
}

for (const palette of ['a', 'b'] as const) {
  test.describe(`SPEC-004/AC-17 axe-core, палітра ${palette.toUpperCase()}`, () => {
    for (const [url, kind] of PAGES) {
      test(url, async ({ page }) => {
        await presetStorage(page, { 'etsgrid:palette': palette });
        await page.goto(url);
        await hydrate(page, kind);
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const serious = result.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(serious).toEqual([]);
      });
    }
  });
}

test.describe('SPEC-004/AC-18 клавіатура і підписи', () => {
  for (const [url, kind] of PAGES) {
    test(`${kind}: у кожного поля є підпис, результат в aria-live, CTA досяжна з клавіатури`, async ({ page }) => {
      await page.goto(url);
      const root = await hydrate(page, kind);
      const unlabeled = await root.locator('input, select').evaluateAll((els) =>
        els.filter((el) => {
          const input = el as HTMLInputElement;
          const labelled = input.labels && input.labels.length > 0;
          return !labelled && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby');
        }).length,
      );
      expect(unlabeled).toBe(0);
      await expect(root.locator('[role="status"][aria-live="polite"]')).toHaveCount(1);

      const first = root.locator('input, select').first();
      await first.focus();
      for (let i = 0; i < 40; i++) {
        if (await page.evaluate(() => document.activeElement?.classList.contains('pk-cta') ?? false)) break;
        await page.keyboard.press('Tab');
      }
      const cta = root.locator('.pk-cta').first();
      if ((await cta.getAttribute('aria-disabled')) !== 'true') await expect(cta).toBeFocused();
    });
  }

  test('зміна відповіді з клавіатури (стрілки в групі радіокнопок)', async ({ page }) => {
    await page.goto('/');
    const root = await hydrate(page, 'power');
    await root.getByLabel('60 кВт', { exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(root.getByLabel('120 кВт', { exact: true })).toBeChecked();
    await expect(root.locator('.pk-result__title')).toContainText('Не вистачає 80 кВт');
  });
});

test.describe('SPEC-004/AC-19 prefers-reduced-motion', () => {
  test('вікна будинку одразу в кінцевому стані', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/batarei/');
    const root = await hydrate(page, 'battery');
    const opacities = await root.locator('[data-window]').evaluateAll((els) => els.map((el) => (el as SVGElement).style.opacity));
    // 12 год за замовчуванням на 300 Вт → батарея дає ≈ 29 год → горять усі 6 вікон
    expect(opacities).toEqual(['1', '1', '1', '1', '1', '1']);
    const animations = await page.evaluate(() => document.getAnimations().length);
    expect(animations).toBe(0);
  });
});
