import { expect, test } from '@playwright/test';

test.describe('SPEC-010/AC-05 шрифти напряму А', () => {
  test('свої файли, swap, українські ґ є і ї ʼ малюються шрифтом, а не запасним', async ({ page }) => {
    const fontRequests: string[] = [];
    page.on('request', (r) => {
      if (r.resourceType() === 'font') fontRequests.push(r.url());
    });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family}|${f.display}`));
    expect(loaded).toContain('Geologica|swap');
    expect(loaded).toContain('Wix Madefor Text|swap');
    expect(fontRequests.every((u) => new URL(u).pathname.startsWith('/fonts/'))).toBe(true);
    expect(fontRequests.length).toBeLessThanOrEqual(2);

    // Гліф є у шрифті — ширина відрізняється від запасного monospace; ієрогліф (немає в сабсеті) — збігається.
    const widths = await page.evaluate(() => {
      const ctx = document.createElement('canvas').getContext('2d')!;
      const measure = (font: string, text: string) => {
        ctx.font = font;
        return ctx.measureText(text).width;
      };
      const out: Record<string, boolean> = {};
      for (const family of ['Geologica', '"Wix Madefor Text"']) {
        for (const ch of ['ґ', 'Ґ', 'є', 'і', 'ї', 'ʼ']) {
          out[`${family} ${ch}`] = measure(`700 60px ${family}, monospace`, ch.repeat(4)) !== measure('700 60px monospace', ch.repeat(4));
        }
        out[`${family} control`] = measure(`700 60px ${family}, monospace`, '漢漢') !== measure('700 60px monospace', '漢漢');
      }
      return out;
    });
    for (const [k, own] of Object.entries(widths)) expect(own, k).toBe(!k.endsWith('control'));
  });

  test('запасний напрям Б підвантажує свої шрифти лише після вибору', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[data-palette-fonts]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Б «Сигнал»' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'b');
    await expect(page.locator('link[data-palette-fonts="b"]')).toHaveCount(1);
  });
});
