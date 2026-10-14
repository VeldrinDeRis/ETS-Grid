import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { presetStorage } from '../helpers/viewports';

const FORM = '#rozrakhunok form[data-lead-form]';

async function serious(page: Page) {
  const result = await new AxeBuilder({ page }).include(FORM).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return result.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

for (const palette of ['a', 'b'] as const) {
  test.describe(`SPEC-009/AC-12 axe-core, палітра ${palette.toUpperCase()}`, () => {
    test('звичайний стан і стан з помилками', async ({ page }) => {
      await presetStorage(page, { 'etsgrid:palette': palette });
      await page.goto('/kontakty/?product=ets-dc-60&picker=power&need_kw=60&grid_kw=50&outcome=ok#rozrakhunok');
      expect(await serious(page)).toEqual([]);
      await page.locator(FORM).getByRole('button', { name: 'Надіслати заявку' }).click();
      await expect(page.locator(`${FORM} [data-lead-summary]`)).toBeVisible();
      expect(await serious(page)).toEqual([]);
    });
  });
}

test.describe('SPEC-009/AC-13 клавіатура', () => {
  test('форма проходиться Tab, помилка оголошується і повʼязана з полем', async ({ page }) => {
    await page.goto('/kontakty/#rozrakhunok');
    const form = page.locator(FORM);
    await form.getByLabel('Імʼя').focus();
    await page.keyboard.press('Tab');
    await expect(form.getByLabel(/Телефон/)).toBeFocused();
    await page.keyboard.type('123');
    await page.keyboard.press('Tab');
    const phone = form.getByLabel(/Телефон/);
    await expect(phone).toHaveAttribute('aria-invalid', 'true');
    const describedBy = await phone.getAttribute('aria-describedby');
    await expect(page.locator(`#${describedBy}`)).toHaveText('Вкажіть номер у форматі +380 XX XXX XX XX');

    for (let i = 0; i < 30; i++) {
      if (await page.evaluate(() => document.activeElement?.matches('[data-lead-submit]') ?? false)) break;
      await page.keyboard.press('Tab');
    }
    await expect(form.locator('[data-lead-submit]')).toBeFocused();
    await expect(form.locator('input[name="website"]')).not.toBeFocused();
  });
});
