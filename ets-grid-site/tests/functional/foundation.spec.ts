import { expect, test } from '@playwright/test';
import { cssVar, isDesktop, isMobile, presetStorage, SAMPLE_PAGES } from '../helpers/viewports';

const LEVELS = ['/zaryadni-stantsii/', '/sonyachni-paneli/', '/batarei/', '/solar-carport/'];

test.describe('SPEC-001/AC-13 перемикач палітри', () => {
  test('А → Б без перезавантаження, вибір переживає перехід і перезавантаження', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-palette', 'a');
    const bgA = await cssVar(page, '--color-bg');

    await page.getByRole('button', { name: 'Б «Сигнал»' }).click();
    await expect(html).toHaveAttribute('data-palette', 'b');
    await expect(page.getByRole('button', { name: 'Б «Сигнал»' })).toHaveAttribute('aria-pressed', 'true');
    expect(await cssVar(page, '--color-bg')).not.toBe(bgA);

    await page.goto('/koshyk/');
    await expect(html).toHaveAttribute('data-palette', 'b');
    await page.reload();
    await expect(html).toHaveAttribute('data-palette', 'b');
  });
});

test.describe('SPEC-001/AC-14 мега-меню з клавіатури (1440)', () => {
  test.beforeEach(({}, info) => test.skip(!isDesktop(info), 'тільки desktop'));

  test('Enter відкриває, Esc закриває й повертає фокус, клік поза меню закриває', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Розділи: Зарядні станції' });
    const panel = page.locator('#megamenu-charging');

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link', { name: /Для дому/ })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();

    await page.keyboard.press('Space');
    await expect(panel).toBeVisible();
    await page.locator('footer').click({ position: { x: 10, y: 10 } });
    await expect(panel).toBeHidden();
  });

  test('відкрите лише одне мега-меню', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Розділи: Зарядні станції' }).click();
    await page.getByRole('button', { name: 'Розділи: Батареї' }).click();
    await expect(page.locator('#megamenu-charging')).toBeHidden();
    await expect(page.locator('#megamenu-battery')).toBeVisible();
  });
});

test.describe('SPEC-001/AC-15 мобільна шапка і меню (375, 320)', () => {
  test.beforeEach(({}, info) => test.skip(!isMobile(info), 'тільки mobile'));

  test('шапка ≤ 64 px, у меню перші 4 пункти — плитки рівнів', async ({ page }) => {
    await page.goto('/');
    const box = await page.locator('header').boundingBox();
    expect(box!.height).toBeLessThanOrEqual(64);

    await page.locator('summary', { hasText: 'Меню' }).click();
    const links = page.locator('.mobile-menu__panel nav a');
    await expect(links.first()).toBeVisible();
    const hrefs = await links.evaluateAll((els) => els.slice(0, 4).map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual(LEVELS);
  });

  test('на 320 px немає горизонтальної прокрутки', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const url of SAMPLE_PAGES) {
      await page.goto(url);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, url).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('SPEC-001/AC-16 без JS', () => {
  test.use({ javaScriptEnabled: false });

  test('перехід на рівень із шапки (1440)', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'тільки desktop');
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Основне меню' }).getByRole('link', { name: 'Батареї' }).click();
    await expect(page).toHaveURL(/\/batarei\/$/);
    await expect(page.locator('h1')).toHaveText('Батареї');
  });

  test('мобільне меню відкривається (375)', async ({ page }, info) => {
    test.skip(!isMobile(info), 'тільки mobile');
    await page.goto('/');
    await page.locator('summary', { hasText: 'Меню' }).click();
    await expect(page.locator('.mobile-menu__panel')).toBeVisible();
    await page.locator('.mobile-menu__panel').getByRole('link', { name: /Solar Carport/ }).click();
    await expect(page).toHaveURL(/\/solar-carport\/$/);
  });
});

test.describe('SPEC-001/AC-17 лічильник кошика', () => {
  test('сума qty, оновлення за подією, приховано при порожньому або зіпсованому ключі', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));

    await presetStorage(page, {
      'etsgrid:cart:v1': [
        { slug: 'ets-home-7', qty: 2, turnkey: true },
        { slug: 'ets-home-22', qty: 1, turnkey: false },
      ],
    });
    await page.goto('/');
    const badge = page.locator('[data-cart-count]');
    await expect(badge).toBeVisible();
    await expect(page.locator('[data-cart-count-value]')).toHaveText('3');

    await page.evaluate(() => {
      localStorage.setItem('etsgrid:cart:v1', JSON.stringify([{ slug: 'ets-home-7', qty: 5, turnkey: false }]));
      window.dispatchEvent(new Event('etsgrid:cart-change'));
    });
    await expect(page.locator('[data-cart-count-value]')).toHaveText('5');

    await page.evaluate(() => {
      localStorage.setItem('etsgrid:cart:v1', '{зіпсовано');
      window.dispatchEvent(new Event('etsgrid:cart-change'));
    });
    await expect(badge).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('порожній кошик — лічильник прихований', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-cart-count]')).toBeHidden();
  });
});

test('@smoke головна → рівень → лістинг → товар → кошик', async ({ page }, info) => {
  await page.goto('/');
  await page.locator('main').getByRole('link', { name: /Зарядні станції/ }).click();
  await expect(page.locator('h1')).toHaveText('Зарядні станції');
  await page.locator('main').getByRole('link', { name: 'Для дому' }).click();
  await expect(page.locator('h1')).toHaveText('Для дому');
  await page.locator('main').getByRole('link', { name: 'ETS Home 7' }).click();
  await expect(page.locator('h1')).toHaveText('ETS Home 7');
  await expect(page.locator('main [data-product-block="price"]')).toContainText('демо-ціна');
  if (isDesktop(info)) {
    await page.getByRole('link', { name: /^Кошик/ }).click();
  } else {
    await page.goto('/koshyk/');
  }
  await expect(page.locator('h1')).toHaveText('Кошик');
});
