import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { presetStorage } from '../helpers/viewports';

for (const palette of ['a', 'b'] as const) {
  test.describe(`SPEC-006/AC-18 axe-core, палітра ${palette.toUpperCase()}`, () => {
    test('головна цілком', async ({ page }) => {
      await presetStorage(page, { 'etsgrid:palette': palette });
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
      // Контраст перевіряємо в кінцевому стані: слова H1 загоряються ≈ 1,3 с (SPEC-006 AC-24).
      await expect(page.locator('h1 .hero__word')).toHaveCount(0, { timeout: 2500 });
      await expect(page.locator('h1')).toHaveCSS('opacity', '1');
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const serious = result.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(serious).toEqual([]);
    });
  });
}

test.describe('SPEC-006/AC-19 вкладки без JS', () => {
  test.use({ javaScriptEnabled: false });

  test('усі панелі з заголовками видно, перемикачі вкладок сховано', async ({ page }) => {
    await page.goto('/');
    const block = page.locator('[data-home-block="systems"]');
    await expect(block.locator('[data-tab-panel]:visible')).toHaveCount(3);
    await expect(block.locator('.systems__panel-title')).toHaveCount(3);
    await expect(block.getByRole('tablist')).toBeHidden();
  });
});

test.describe('SPEC-006/AC-20 reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('лінії енергії не анімуються', async ({ page }) => {
    await page.goto('/');
    const flow = page.locator('[data-energy-flow]');
    await flow.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const animated = await flow.evaluate((el) =>
      [...el.querySelectorAll<HTMLElement>('[data-flow-pulse]')].some((p) => p.style.transform !== '' || p.getAnimations().length > 0),
    );
    expect(animated).toBe(false);
  });
});
