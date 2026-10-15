import { expect, test } from '@playwright/test';

// SPEC-010/AC-09: візуальні еталони після затвердження напряму А (D-039) і доводки (D-040, D-041).
// Еталони — tests/visual/templates.spec.ts-snapshots/; оновлення лише свідомо: npx playwright test tests/visual --update-snapshots.

const TEMPLATES = [
  ['home', '/'],
  ['level', '/zaryadni-stantsii/'],
  ['listing', '/zaryadni-stantsii/dlya-domu/'],
  ['product', '/product/ets-home-7/'],
] as const;

test.use({ reducedMotion: 'reduce' });

for (const [name, url] of TEMPLATES) {
  test(`SPEC-010/AC-09 ${name}`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Ліниві фото й острови — докрутити сторінку, щоб усе намалювалося, і повернутися нагору.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    // Усі острови гідратовані (Astro знімає атрибут ssr), інакше висота сторінки гуляє між прогонами.
    await page.waitForFunction(() => [...document.querySelectorAll('astro-island')].every((i) => !i.hasAttribute('ssr')), null, { timeout: 15_000 });
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.01 });
  });
}
