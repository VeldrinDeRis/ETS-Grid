import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { heroSettled, presetStorage } from '../helpers/viewports';

for (const palette of ['a', 'b'] as const) {
  test.describe(`SPEC-006/AC-18 axe-core, палітра ${palette.toUpperCase()}`, () => {
    test('головна цілком', async ({ page }) => {
      await presetStorage(page, { 'etsgrid:palette': palette });
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
      // Контраст перевіряємо в кінцевому стані: H1 загорівся, схема акту II увімкнена (helpers/viewports heroSettled).
      await heroSettled(page);
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

  test('SPEC-006/AC-28: лампа-курсор не вмикається', async ({ page }) => {
    await page.goto('/');
    await page.mouse.move(900, 300);
    await page.mouse.move(1000, 400);
    await page.waitForTimeout(500);
    await expect(page.locator('[data-hero-lamp]')).not.toHaveCSS('opacity', '1');
  });

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

test.describe('SPEC-006/AC-33 reduced-motion: без блимання (D-056)', () => {
  test.use({ reducedMotion: 'reduce' });
  test('світлодіодів нема, вогники плиток і блик лінії без анімацій, схема горить цілком', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-hero-led]')).toHaveCount(0);
    const tileAnims = await page.locator('.hero__tile').evaluateAll((els) => els.map((el) => getComputedStyle(el, '::after').animationName));
    for (const a of tileAnims) expect(a).toBe('none');
    const flow = page.locator('[data-energy-flow]');
    await flow.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const dim = await flow.locator('.flow__body').evaluateAll((els) => els.filter((el) => parseFloat(getComputedStyle(el).opacity) < 1).length);
    expect(dim).toBe(0);
    await expect(flow.locator('[data-flow-spark][data-run]')).toHaveCount(0);
  });
});

test.describe('SPEC-006/AC-35 reduced-motion: доба не крутиться (D-059)', () => {
  test.use({ reducedMotion: 'reduce' });
  test('шари неба без анімації і невидимі — статична ніч', async ({ page }) => {
    await page.goto('/');
    const anims = await page.locator('[data-hero-sky]').evaluateAll((els) => els.map((el) => [getComputedStyle(el).animationName, getComputedStyle(el).opacity]));
    expect(anims).toEqual([['none', '0'], ['none', '0'], ['none', '0']]);
  });
});
