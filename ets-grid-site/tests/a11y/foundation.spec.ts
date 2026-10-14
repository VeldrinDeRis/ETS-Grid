import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { isDesktop, presetStorage, SAMPLE_PAGES } from '../helpers/viewports';

for (const palette of ['a', 'b'] as const) {
  test.describe(`SPEC-001/AC-18 axe-core, палітра ${palette.toUpperCase()}`, () => {
    for (const url of SAMPLE_PAGES) {
      test(`${url}`, async ({ page }) => {
        await presetStorage(page, { 'etsgrid:palette': palette });
        await page.goto(url);
        await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const serious = result.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(serious).toEqual([]);
      });
    }
  });
}

test.describe('SPEC-001/AC-18 axe-core з відкритим меню', () => {
  test('мега-меню (1440) / мобільне меню (375)', async ({ page }, info) => {
    await page.goto('/');
    if (isDesktop(info)) {
      await page.getByRole('button', { name: 'Розділи: Зарядні станції' }).click();
    } else {
      await page.locator('summary', { hasText: 'Меню' }).click();
    }
    const result = await new AxeBuilder({ page }).include('header').analyze();
    expect(result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });
});

test.describe('SPEC-001/AC-19 prefers-reduced-motion', () => {
  test.use({ colorScheme: 'light' });

  test('нульові тривалості анімацій і переходів у шапці та меню', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const durations = await page.evaluate(() => {
      const nonZero: string[] = [];
      for (const el of document.querySelectorAll('header, header *')) {
        const s = getComputedStyle(el);
        const all = [...s.transitionDuration.split(','), ...s.animationDuration.split(',')].map((d) => parseFloat(d));
        if (all.some((d) => d > 0)) nonZero.push(`${el.tagName.toLowerCase()}.${(el as HTMLElement).className}`);
      }
      return nonZero;
    });
    expect(durations).toEqual([]);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dur').trim())).toBe('0s');
  });
});
