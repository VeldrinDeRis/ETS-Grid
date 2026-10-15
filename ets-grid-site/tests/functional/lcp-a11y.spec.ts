// SPEC-002 ревізія 6.1, SPEC-006 ревізія 6.2 (D-069): гідратація за наміром, текст сцени (AC-48, AC-41).
import { expect, test } from '@playwright/test';
import { isDesktop } from '../helpers/viewports';

const LISTING = '/zaryadni-stantsii/dlya-domu/';

test.describe('SPEC-002/AC-48 галерея оживає за наміром', () => {
  test('без взаємодії модуль CardGallery не вантажиться; наведення гідратує, «Наступний кадр» листає', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'hover — desktop');
    const requested: string[] = [];
    page.on('request', (r) => r.url().includes('CardGallery') && requested.push(r.url()));
    await page.goto(LISTING);
    await page.locator('.cf-results').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    expect(requested).toEqual([]);
    const card = page.locator('.cf-results [data-product-card]').first();
    await card.locator('.product-card__photo').hover();
    await expect.poll(() => requested.length).toBeGreaterThan(0);
    await expect(card.locator('astro-island')).not.toHaveAttribute('ssr', '');
    await card.getByRole('button', { name: /^Наступний кадр/ }).click();
    await expect(card.locator('.pgal__dot[aria-selected="true"]')).toHaveAttribute('aria-label', 'Кадр 2 з 5');
  });

  test('клік по стрілці до гідратації не губиться', async ({ page }) => {
    await page.goto(LISTING);
    const card = page.locator('.cf-results [data-product-card]').first();
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('astro-island')).toHaveAttribute('ssr', '');
    await card.getByRole('button', { name: /^Наступний кадр/ }).click();
    await expect(card.locator('.pgal__dot[aria-selected="true"]')).toHaveAttribute('aria-label', 'Кадр 2 з 5');
  });
});

test.describe('SPEC-006/AC-41 текст сцени «Система» не гасне', () => {
  test('до прокрутки підписи й ціни вузлів — opacity 1, приглушені лише лампи', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-energy-flow][data-flow-dim]')).toBeAttached();
    const values = await page.$$eval('[data-node]', (nodes) =>
      nodes.map((n) => ({
        lit: n.hasAttribute('data-lit'),
        body: getComputedStyle(n.querySelector('.flow__body')!).opacity,
        link: getComputedStyle(n.querySelector('.flow__link')!).opacity,
        dot: getComputedStyle(n.querySelector('[data-flow-dot]')!).opacity,
      })),
    );
    const unlit = values.filter((v) => !v.lit);
    expect(unlit.length).toBeGreaterThan(0);
    for (const v of unlit) {
      expect(v.body).toBe('1');
      expect(v.link).toBe('1');
      expect(Number(v.dot)).toBeLessThan(1);
    }
  });
});
