// SPEC-002 ревізія 6.1, SPEC-006 ревізія 6.2 (D-069): зона дотику точок і контраст сцени (AC-49, AC-41, AC-42).
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function violations(page: Page, rules?: string[]) {
  let b = new AxeBuilder({ page }).withTags(TAGS);
  if (rules) b = b.withRules(rules);
  const r = await b.analyze();
  return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical' || rules).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

async function dotBoxes(page: Page, selector: string) {
  return page.$$eval(selector, (els) => els.map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0).map((r) => ({ w: r.width, h: r.height })));
}

test.describe('SPEC-002/AC-49 точки галерей — зона дотику 24 px', () => {
  for (const url of ['/zaryadni-stantsii/dlya-domu/', '/batarei/']) {
    test(url, async ({ page }) => {
      await page.goto(url);
      await page.locator('.cf-results').scrollIntoViewIfNeeded();
      const boxes = await dotBoxes(page, '.pgal__dot');
      expect(boxes.length).toBeGreaterThan(0);
      for (const b of boxes) {
        expect(b.w).toBeGreaterThanOrEqual(24);
        expect(b.h).toBeGreaterThanOrEqual(24);
      }
      expect(await violations(page, ['target-size'])).toEqual([]);
    });
  }
});

test.describe('SPEC-006/AC-41, AC-42 головна без проходу сцени', () => {
  test('axe wcag22aa: без порушень контрасту й target-size до прокрутки сцени', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    // Дочекатися анімації заголовка першого екрана, сцену «Система» не прокручувати.
    await page.waitForTimeout(2200);
    expect(await violations(page, ['color-contrast', 'target-size'])).toEqual([]);
  });

  test('точки хітів і «Обʼєктів» — зона дотику 24 px', async ({ page }) => {
    await page.goto('/');
    for (const [sel, host] of [
      ['.hits__dot', '.hits__filters'],
      ['.case__dot', '.case__photo'],
    ]) {
      await page.locator(host).first().scrollIntoViewIfNeeded();
      await expect(page.locator(sel).first()).toBeAttached({ timeout: 10_000 });
      const boxes = await dotBoxes(page, sel);
      expect(boxes.length, sel).toBeGreaterThan(0);
      for (const b of boxes) expect(Math.min(b.w, b.h), sel).toBeGreaterThanOrEqual(24);
    }
  });
});
