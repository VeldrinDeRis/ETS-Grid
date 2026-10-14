import { expect, test } from '@playwright/test';

test.describe('SPEC-007/AC-06 навігатор фінансування', () => {
  test('відповіді змінюють список; «нічого» — пояснення; скидання повертає все', async ({ page }) => {
    await page.goto('/finansuvannya/');
    const nav = page.locator('[data-financing-nav]');
    const visible = page.locator('[data-program]:visible');
    const count = page.locator('[data-financing-count]');
    await expect(visible).toHaveCount(4);
    await expect(count).toHaveText('Підходить: 4 програми');

    await nav.getByLabel('Бізнес').check();
    await nav.getByLabel('Solar Carport').check();
    await expect(visible).toHaveCount(1);
    await expect(page.locator('[data-program="grants"]')).toBeVisible();
    await expect(count).toHaveText('Підходить: 1 програма');

    await nav.getByLabel('Приватна особа').check();
    await expect(visible).toHaveCount(0);
    await expect(page.locator('[data-financing-none]')).toBeVisible();

    await nav.getByRole('button', { name: 'Скинути відповіді' }).click();
    await expect(visible).toHaveCount(4);
    await expect(page.locator('[data-financing-none]')).toBeHidden();
  });

  test.describe('без JS', () => {
    test.use({ javaScriptEnabled: false });

    test('питання сховані, видно весь список програм', async ({ page }) => {
      await page.goto('/finansuvannya/');
      await expect(page.locator('[data-financing-nav]')).toBeHidden();
      await expect(page.locator('[data-program]:visible')).toHaveCount(4);
    });
  });
});

test.describe('SPEC-007/AC-03 CTA системи', () => {
  test('«Розрахувати систему» приносить назву системи у форму', async ({ page }) => {
    await page.goto('/systems/dim-plus-avto/');
    await page.getByRole('link', { name: 'Розрахувати систему' }).click();
    await expect(page).toHaveURL(/\/kontakty\/\?picker=system&system=dim-plus-avto#rozrakhunok$/);
    await expect(page.locator('#rozrakhunok [data-lead-picker-text]')).toHaveText('Готова система: Дім + авто');
  });

  test('схема системи на 375 — вертикально, без прокрутки сторінки вбік', async ({ page }) => {
    await page.goto('/systems/dim-plus-avto/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});
