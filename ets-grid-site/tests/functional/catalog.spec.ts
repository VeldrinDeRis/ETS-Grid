import { expect, test } from '@playwright/test';
import structure from '../../src/data/structure.json' with { type: 'json' };
import { CatalogPage } from '../helpers/catalog';
import { isDesktop, isMobile } from '../helpers/viewports';

const LEVEL = '/zaryadni-stantsii/';

test.describe('SPEC-002/AC-19 вибір значення', () => {
  test('видача, лічильники, «Знайдено» й URL змінюються без перезавантаження', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    await expect(catalog.visibleCards()).toHaveCount(10);
    await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1));

    await catalog.chip('Настінна AC').click();
    await expect(catalog.chip('Настінна AC')).toHaveAttribute('aria-pressed', 'true');
    await expect(catalog.visibleCards()).toHaveCount(3);
    await expect(catalog.total()).toHaveText('3');
    await expect(page).toHaveURL(/\?type=wall_ac$/);
    expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
  });

  test('значення з 0 неактивне й лишається на місці (1440)', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'фасети в колонці — desktop');
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    const ccs = catalog.option('Розʼєм', 'CCS2');
    // Позиція відносно колонки: колонка липка (ревізія 5), а клік може прокрутити сторінку.
    const position = () =>
      ccs.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const s = el.closest('.cf-sidebar')!.getBoundingClientRect();
        return { x: Math.round(r.left - s.left), y: Math.round(r.top - s.top) };
      });
    const before = await position();
    await catalog.chip('Настінна AC').click();
    await expect(ccs).toHaveAttribute('aria-disabled', 'true');
    await expect(ccs).toBeVisible();
    expect(await position()).toEqual(before);
    await ccs.click({ force: true });
    await expect(ccs).toHaveAttribute('aria-pressed', 'false');
    await expect(catalog.visibleCards()).toHaveCount(3);
  });
});

test.describe('SPEC-002/AC-20 зняття фільтрів', () => {
  test('повторний клік, «×» і «Скинути все»', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    await catalog.chip('Настінна AC').click();
    await catalog.chip('Настінна AC').click();
    await expect(catalog.visibleCards()).toHaveCount(10);

    await catalog.chip('Швидка DC').click();
    await page.locator('.cf-selected__chip', { hasText: 'Швидка DC' }).click();
    await expect(catalog.visibleCards()).toHaveCount(10);

    await catalog.chip('Швидка DC').click();
    await catalog.chip('Split DC').click();
    await page.locator('.cf-main .cf-reset', { hasText: 'Скинути все' }).click();
    await expect(catalog.visibleCards()).toHaveCount(10);
    await expect(page).toHaveURL(new RegExp(`${LEVEL}$`));
  });

  test('на ЧПУ-сторінці «Скинути все» веде на лістинг категорії', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/dlya-domu/gbt/');
    await expect(catalog.visibleCards()).toHaveCount(1);
    await page.locator('.cf-main .cf-reset', { hasText: 'Скинути все' }).click();
    await expect(page).toHaveURL(/\/zaryadni-stantsii\/dlya-domu\/$/);
    await expect(page.locator('h1')).toHaveText('Для дому');
  });
});

test.describe('SPEC-002/AC-21 стан з URL', () => {
  test('перезавантаження і «Назад» відновлюють стан', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open(`${LEVEL}?type=wall_ac`);
    await expect(catalog.visibleCards()).toHaveCount(3);
    await page.reload();
    await expect(catalog.visibleCards()).toHaveCount(3);
    await catalog.visibleCards().first().locator('.product-card__title a').click();
    await expect(page).toHaveURL(/\/product\//);
    await page.goBack();
    await expect(page).toHaveURL(/\?type=wall_ac$/);
    await expect(catalog.visibleCards()).toHaveCount(3);
  });

  test('сміття в URL відкидається без помилок', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const catalog = new CatalogPage(page);
    await catalog.open(`${LEVEL}?type=xyz&power_kw=zzz&price=abc&sort=bad&foo=1`);
    await expect(catalog.visibleCards()).toHaveCount(10);
    await expect(page).toHaveURL(new RegExp(`${LEVEL}$`));
    expect(errors).toEqual([]);
  });
});

test.describe('SPEC-002/AC-22 сортування', () => {
  test('«Дешевші» змінює порядок і пишеться в URL', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/dlya-domu/');
    await page.getByLabel('Сортування').selectOption('price-asc');
    await expect(page).toHaveURL(/sort=price-asc/);
    expect(await catalog.orderedSlugs()).toEqual(['ets-home-11-gbt', 'ets-home-7', 'ets-home-22']);
    await page.getByLabel('Сортування').selectOption('price-desc');
    expect(await catalog.orderedSlugs()).toEqual(['ets-home-22', 'ets-home-7', 'ets-home-11-gbt']);
  });
});

test.describe('SPEC-002/AC-23 кожне значення головного фільтра дає видачу', () => {
  test.beforeEach(({}, info) => test.skip(!isDesktop(info), 'перебір — один раз, на desktop'));

  const levelSlug = new Map(structure.levels.map((l) => [l.key, l.slug]));
  const urls = [
    ...structure.levels.filter((l) => l.key !== 'carport').map((l) => `/${l.slug}/`),
    ...structure.categories.map((c) => `/${levelSlug.get(c.level)}/${c.slug}/`),
  ];

  for (const url of urls) {
    test(url, async ({ page }) => {
      await page.goto(url);
      if (await page.locator('[data-empty-state]').count()) {
        await expect(page.locator('[data-empty-state] [data-product-card]')).toHaveCount(3);
        return;
      }
      const catalog = new CatalogPage(page);
      await expect(page.locator('.cf-total')).toBeVisible();
      const chips = page.locator('.cf-primary .cf-tile');
      const n = await chips.count();
      for (let i = 0; i < n; i++) {
        const chip = chips.nth(i);
        if ((await chip.getAttribute('aria-disabled')) === 'true') continue;
        await chip.click();
        const visible = await catalog.visibleCards().count();
        const empty = await page.locator('.cf-empty').count();
        expect(visible > 0 || empty > 0, `${url}: ${await chip.innerText()}`).toBe(true);
        await chip.click();
      }
    });
  }
});

test.describe('SPEC-002/AC-24 шторка фільтрів (375)', () => {
  test.beforeEach(({}, info) => test.skip(!isMobile(info), 'тільки mobile'));

  test('відкривається, фокус всередині, Esc закриває й повертає фокус, «Показати N»', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    const open = page.getByRole('button', { name: /^Фільтри/ });
    await open.click();
    const sheet = page.getByRole('dialog', { name: 'Фільтри' });
    await expect(sheet).toBeVisible();
    expect(await page.evaluate(() => document.activeElement?.closest('dialog') !== null)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(open).toBeFocused();

    await open.click();
    await catalog.option('Розʼєм', 'GB/T AC', '.cf-sheet').click();
    await expect(sheet.locator('.cf-show [data-show-total]')).toHaveAttribute('data-show-total', '2');
    await expect(sheet.locator('.cf-show')).toContainText('товари');
    await sheet.locator('.cf-show').click();
    await expect(sheet).toBeHidden();
    await expect(catalog.visibleCards()).toHaveCount(2);
    await expect(open).toHaveText('Фільтри (1)');
  });
});

test.describe('SPEC-002/AC-25 кошик і порівняння з картки', () => {
  test('«До кошика» збільшує лічильник у шапці', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open('/zaryadni-stantsii/dlya-domu/');
    await page.locator('[data-slug="ets-home-7"] [data-add-to-cart]').click();
    await expect(page.locator('[data-cart-count-value]')).toHaveText('1');
    await page.locator('[data-slug="ets-home-7"] [data-add-to-cart]').click();
    await expect(page.locator('[data-cart-count-value]')).toHaveText('2');
  });

  test('«Порівняти»: aria-pressed, пʼятий — повідомлення', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open(LEVEL);
    const buttons = page.locator('.cf-results [data-compare]');
    for (let i = 0; i < 4; i++) {
      await buttons.nth(i).click();
      await expect(buttons.nth(i)).toHaveAttribute('aria-pressed', 'true');
    }
    await buttons.nth(4).click();
    await expect(buttons.nth(4)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.cf-results [data-product-card]').nth(4).locator('[data-card-status]')).toHaveText(
      'Можна порівняти до 4 товарів',
    );
    await buttons.nth(0).click();
    await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('SPEC-002/AC-29 пробіли видно (D-031; ревізія 5 — одна плашка, AC-36)', () => {
  test('фасети рівня без даних — у плашці; «Новинки» — неактивна', async ({ page }, info) => {
    const catalog = new CatalogPage(page);
    await catalog.open('/batarei/');
    const scope = isDesktop(info) ? page.locator('.cf-sidebar') : page.locator('.cf-sheet');
    if (!isDesktop(info)) await page.getByRole('button', { name: /^Фільтри/ }).click();
    const plate = scope.locator('.cf-missing-plate');
    await expect(plate).toBeVisible();
    await expect(plate).toContainText('з даними замовника');
    await expect(plate).toHaveAttribute('aria-disabled', 'true');
    for (const label of ['Сумісні інвертори', 'Бренд', 'Гарантія']) await expect(plate.locator('[data-missing-facet]', { hasText: label })).toBeVisible();
    const newest = page.locator('.cf-sort option[value="new"]');
    await expect(newest).toHaveText('Новинки — немає дати появи товару');
    // toBeDisabled для <option> у Playwright ненадійний — перевіряємо атрибут і властивість напряму.
    await expect(newest).toHaveAttribute('disabled', '');
    expect(await newest.evaluate((o: HTMLOptionElement) => o.disabled)).toBe(true);
  });

  test('фасет «не про цю категорію» не показується як пробіл', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'desktop');
    const catalog = new CatalogPage(page);
    await catalog.open('/sonyachni-paneli/paneli/');
    await expect(page.locator('.cf-sidebar [data-missing-facet]', { hasText: 'Тип інвертора' })).toHaveCount(0);
  });
});

test('SPEC-002/AC-26 події аналітики', async ({ page }) => {
  const events: string[] = [];
  page.on('console', async (msg) => {
    if (msg.type() === 'debug' && msg.text().startsWith('[track]')) events.push(msg.text().split(' ')[1]);
  });
  const catalog = new CatalogPage(page);
  await catalog.open('/zaryadni-stantsii/dlya-domu/');
  await catalog.chip('Настінна AC').click();
  await page.locator('[data-slug="ets-home-7"] [data-add-to-cart]').click();
  await page.locator('[data-slug="ets-home-7"] [data-compare]').click();
  await expect.poll(() => events).toEqual(expect.arrayContaining(['filter_apply', 'add_to_cart', 'compare_add']));
});
