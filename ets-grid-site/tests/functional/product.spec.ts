import { expect, test } from '@playwright/test';
import { isDesktop, isMobile } from '../helpers/viewports';

const HOME7 = '/product/ets-home-7/';
const NBSP = ' ';
const cart = (page: import('@playwright/test').Page) => page.evaluate(() => JSON.parse(localStorage.getItem('etsgrid:cart:v1') ?? '[]'));

test.describe('SPEC-003/AC-06 перемикач «з монтажем»', () => {
  test('міняє ціну, склад і прапорець turnkey у кошику', async ({ page }) => {
    await page.goto(HOME7);
    const block = page.locator('[data-product-block="price"]');
    await expect(block.getByLabel('З монтажем під ключ')).toBeChecked();
    await expect(block.locator('[data-price-for="true"].pprice__main')).toBeVisible();
    await expect(block.locator('[data-price-for="false"].pprice__main')).toBeHidden();
    await expect(block.locator('[data-includes-for="true"]')).toContainText('Пусконалагодження');

    await block.getByLabel('Тільки обладнання').check();
    await expect(block.locator('[data-price-for="false"].pprice__main')).toBeVisible();
    await expect(block.locator('[data-price-for="false"].pprice__main')).toContainText(`24${NBSP}900${NBSP}₴`);
    await expect(block.locator('[data-includes-for="false"]')).toContainText('Доставка по Україні');
    await block.getByRole('button', { name: 'До кошика' }).click();
    expect(await cart(page)).toEqual([{ slug: 'ets-home-7', qty: 1, turnkey: false }]);

    await block.getByLabel('З монтажем під ключ').check();
    await block.getByRole('button', { name: /До кошика|Додано/ }).click();
    expect(await cart(page)).toEqual([
      { slug: 'ets-home-7', qty: 1, turnkey: false },
      { slug: 'ets-home-7', qty: 1, turnkey: true },
    ]);
    await expect(block.locator('[data-cart-added]')).toBeVisible();
    await expect(page.locator('[data-cart-count-value]')).toHaveText('2');
  });

  test('товар під розрахунок: лише «Розрахувати» з товаром у формі', async ({ page }) => {
    await page.goto('/product/ets-dc-60/');
    const block = page.locator('[data-product-block="price"]');
    await expect(block.getByRole('button', { name: 'До кошика' })).toHaveCount(0);
    await block.getByRole('link', { name: 'Розрахувати' }).click();
    await expect(page).toHaveURL(/\/kontakty\/\?product=ets-dc-60/);
  });
});

test.describe('SPEC-003/AC-07 сумісність з авто', () => {
  test('вибір авто міняє результат і швидкість', async ({ page }) => {
    await page.goto(HOME7);
    const select = page.getByLabel('Ваше авто');
    const result = page.locator('[data-compat-result]');
    await select.selectOption('tesla-model-3-lr-awd-2020');
    await expect(result).toHaveText(`Підходить: до 7,4${NBSP}кВт.`);
    await select.selectOption('vw-id4-crozz-cn');
    await expect(result).toContainText('Потрібен адаптер: Адаптер Type 2 → GB/T AC');
    await expect(result).toContainText(`до 7${NBSP}кВт`);
    await page.goto('/product/ets-dc-60/');
    await page.getByLabel('Ваше авто').selectOption('nissan-leaf-40-ze1');
    await expect(page.locator('[data-compat-result]')).toContainText('Не підходить');
  });
});

test.describe('SPEC-003/AC-08 збільшення фото', () => {
  test('dialog, Esc, повернення фокусу (картинка підставлена тестом — реальних фото до SPEC-010 немає)', async ({ page }) => {
    await page.goto(HOME7);
    await page.evaluate(() => {
      const item = document.querySelector('[data-gallery-placeholder]')!;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.zoom = '/favicon.svg';
      button.dataset.zoomAlt = 'Тестове фото';
      button.textContent = 'Збільшити фото';
      item.replaceChildren(button);
    });
    const trigger = page.getByRole('button', { name: 'Збільшити фото' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Фото товару' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('img', { name: 'Тестове фото' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe('SPEC-003/AC-09 липка панель (375)', () => {
  test.beforeEach(({}, info) => test.skip(!isMobile(info), 'тільки mobile'));

  test('зʼявляється після блоку ціни, кнопка працює', async ({ page }) => {
    await page.goto(HOME7);
    const sticky = page.locator('[data-sticky]');
    await expect(sticky).toBeHidden();
    await page.locator('[data-product-block="install"]').scrollIntoViewIfNeeded();
    await expect(sticky).toBeVisible();
    await sticky.getByRole('button', { name: 'До кошика' }).click();
    expect(await cart(page)).toEqual([{ slug: 'ets-home-7', qty: 1, turnkey: true }]);
  });
});

test.describe('SPEC-003/AC-10 недавно переглянуті', () => {
  test('перегляд пишеться; блок показує до 4 інших товарів', async ({ page }) => {
    for (const slug of ['ets-home-22', 'ets-dc-60', 'panel-550-topcon', 'ets-bess-100', 'carport-hub-20']) {
      await page.goto(`/product/${slug}/`);
    }
    await page.goto(HOME7);
    const recent = page.locator('[data-recent-list] a');
    await expect(recent).toHaveCount(4);
    await expect(recent.first()).toHaveText('Енергохаб: навіс 20 місць + DC + накопичувач');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('etsgrid:recent:v1') ?? '[]'));
    expect(stored[0]).toBe('ets-home-7');
  });

  test('перший перегляд — підказка замість списку', async ({ page }) => {
    await page.goto(HOME7);
    await expect(page.locator('[data-recent-empty]')).toBeVisible();
  });
});

test.describe('SPEC-003/AC-11 шлях до кошика ≤ 6 кроків (ТЗ §14)', () => {
  test('головна → підбірник → картка → з монтажем → До кошика → кошик', async ({ page }, info) => {
    let steps = 0;
    await page.goto('/'); // 1
    steps++;
    const picker = page.locator('[data-picker="power"]');
    await picker.scrollIntoViewIfNeeded();
    await expect(picker).toHaveAttribute('data-ready', 'true');
    await picker.getByLabel('22 кВт', { exact: true }).check(); // 2
    steps++;
    await picker.getByRole('link', { name: 'ETS Home 22' }).click(); // 3
    steps++;
    await expect(page.locator('h1')).toHaveText('ETS Home 22');
    await expect(page.getByLabel('З монтажем під ключ')).toBeChecked(); // 4 — за замовчуванням, без кліку
    steps++;
    await page.locator('[data-product-block="price"]').getByRole('button', { name: 'До кошика' }).click(); // 5
    steps++;
    if (isDesktop(info)) await page.locator('header').getByRole('link', { name: /^Кошик/ }).click();
    else await page.locator('[data-cart-added] a').click(); // 6
    steps++;
    await expect(page.locator('h1')).toHaveText('Кошик');
    expect(steps).toBeLessThanOrEqual(6);
    expect(await cart(page)).toEqual([{ slug: 'ets-home-22', qty: 1, turnkey: true }]);
  });
});
