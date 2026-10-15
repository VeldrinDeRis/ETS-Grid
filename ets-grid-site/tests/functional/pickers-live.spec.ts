// SPEC-004 ревізія 2 (D-045): живі числа підбірників (AC-22, AC-23, AC-24).
import { expect, test, type Page } from '@playwright/test';

async function openPicker(page: Page, url: string, kind: string) {
  await page.goto(url);
  const root = page.locator(`[data-picker="${kind}"]`);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute('data-ready', 'true');
  return root;
}

test.describe('SPEC-004/AC-22 числа підсумку — через LiveNumber', () => {
  test('«Чи вистачить потужності?» 60 / 50: «15 кВт» і «10 кВт·год» — живі числа з точним текстом', async ({ page }) => {
    const root = await openPicker(page, '/', 'power');
    const live = root.locator('.pk-result [data-live-value]');
    await expect(live.first()).toBeAttached();
    const values = await live.evaluateAll((els) => els.map((e) => e.getAttribute('data-live-value')));
    expect(values).toContain('15 кВт');
    expect(values).toContain('10 кВт·год');
    // Розряди — aria-hidden, точний рядок — у прихованому тексті.
    for (const el of await live.all()) {
      await expect(el.locator('.pk-vh')).toHaveText((await el.getAttribute('data-live-value'))!);
      await expect(el.locator('[aria-hidden="true"]').first()).toBeAttached();
    }
  });

  test('Carport 20 місць: kWp, панелі, порти, ємність, CO₂ — живі', async ({ page }) => {
    const root = await openPicker(page, '/solar-carport/', 'carport');
    await expect(root.locator('.pk-result [data-live-value]')).toHaveCount(5);
  });

  test('СЕС і батареї: kWp, панелі, площа, ціна; години, навантаження, ємність — живі', async ({ page }) => {
    const solar = await openPicker(page, '/sonyachni-paneli/', 'solar');
    expect(await solar.locator('.pk-result [data-live-value]').count()).toBeGreaterThanOrEqual(3);
    const battery = await openPicker(page, '/batarei/', 'battery');
    expect(await battery.locator('.pk-result [data-live-value]').count()).toBeGreaterThanOrEqual(3);
  });
});

test.describe('SPEC-004/AC-23 серія швидких змін закінчується останнім значенням', () => {
  test('10 змін повзунка ввода — підсумок відповідає останньому значенню', async ({ page }) => {
    const root = await openPicker(page, '/', 'power');
    const range = root.locator('input[type="range"]');
    for (const v of [55, 58, 52, 61, 49, 70, 66, 80, 75, 80]) {
      await range.evaluate((el: HTMLInputElement, value) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, String(value));
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, v);
    }
    await page.waitForTimeout(600);
    await expect(root.locator('.pk-result__title')).toContainText('Мережі вистачає');
    await expect(root.locator('.pk-result')).toContainText('Запас по вводу: 15 кВт');
  });
});

test.describe('SPEC-004/AC-24 prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('числа — звичайний текст без розрядів AnimateNumber', async ({ page }) => {
    const root = await openPicker(page, '/', 'power');
    await expect(root.locator('.pk-result [data-live-value]')).toHaveCount(0);
    await expect(root.locator('.pk-result__title')).toHaveText('Не вистачає 15 кВт');
  });
});
