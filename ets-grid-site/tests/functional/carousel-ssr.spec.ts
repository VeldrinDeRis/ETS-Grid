// Баг D-074: Ticker Motion+ рендерить список кадрів з opacity: 0 і піднімає її лише після гідратації; з client:intent
// (D-069) кадри карток лістингу й галереї товару лишалися невидимими до наведення.
import { expect, test } from '@playwright/test';

for (const [url, track] of [
  ['/zaryadni-stantsii/dlya-domu/', '.cf-results .pgal__track'],
  ['/product/ets-home-7/', '.pgallery__track'],
] as const) {
  test(`D-074 ${url}: перший кадр видно до першого наміру`, async ({ page }) => {
    await page.goto(url);
    const list = page.locator(`${track} > ul`).first();
    await expect(list.locator('xpath=ancestor::astro-island[1]')).toHaveAttribute('ssr', '');
    expect(await list.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    const img = list.locator('img').first();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  });
}
