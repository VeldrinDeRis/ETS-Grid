import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { presetStorage } from '../helpers/viewports';

const PAGES = [
  '/systems/',
  '/systems/dim-plus-avto/',
  '/posluhy/',
  '/posluhy/dostavka/',
  '/posluhy/montazh/',
  '/posluhy/proekt-tekhumovy/',
  '/posluhy/servis/',
  '/finansuvannya/',
  '/obiekty/',
  '/pro-kompaniyu/',
  '/kontakty/',
  '/oferta/',
  '/gid/',
  '/gid/yak-obraty-zaryadnu-stantsiyu/',
  '/404.html',
];

for (const palette of ['a', 'b'] as const) {
  test.describe(`SPEC-007/AC-07 axe-core, палітра ${palette.toUpperCase()}`, () => {
    for (const url of PAGES) {
      test(url, async ({ page }) => {
        await presetStorage(page, { 'etsgrid:palette': palette });
        await page.goto(url);
        await expect(page.locator('h1')).toHaveCount(1);
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const serious = result.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(serious).toEqual([]);
      });
    }
  });
}
