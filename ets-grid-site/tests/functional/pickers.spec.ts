import { expect, test, type Page } from '@playwright/test';
import { CatalogPage } from '../helpers/catalog';

async function openPicker(page: Page, url: string, kind: string) {
  await page.goto(url);
  const root = page.locator(`[data-picker="${kind}"]`);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute('data-ready', 'true');
  return root;
}

const status = (root: ReturnType<Page['locator']>) => root.locator('[role="status"]');

test.describe('SPEC-004/AC-12 підбірники реагують одразу', () => {
  test('зарядки: значення за замовчуванням дають результат, зміна вводу міняє його', async ({ page }) => {
    const root = await openPicker(page, '/zaryadni-stantsii/', 'charging');
    await expect(root.locator('.pk-result__title')).toHaveText('Підходить 2 станції');
    await root.getByLabel('Доступна потужність вводу, кВт').fill('30');
    await root.getByLabel('Доступна потужність вводу, кВт').blur();
    await expect(root.locator('.pk-result__title')).toHaveText('Підходить 3 станції');
  });

  test('батареї: без споживачів — підказка, із споживачами — години світла', async ({ page }) => {
    const root = await openPicker(page, '/batarei/', 'battery');
    await expect(root.locator('.pk-result__title')).toContainText('годин світла');
    await root.getByLabel(/Світло й інтернет/).uncheck();
    await root.getByLabel(/Холодильник/).uncheck();
    await expect(root.locator('.pk-result__title')).toHaveText('Оберіть, що має працювати');
    await expect(root.locator('.pk-cta')).toHaveAttribute('aria-disabled', 'true');
  });

  test('СЕС: 400 → 4,2 kWp; 800 → 8,3 kWp', async ({ page }) => {
    const root = await openPicker(page, '/sonyachni-paneli/', 'solar');
    await expect(root.locator('.pk-big .pk-vh')).toHaveText('4,2');
    const field = root.getByLabel('Споживання на місяць, кВт·год');
    await field.fill('800');
    await field.blur();
    await expect(root.locator('.pk-big .pk-vh')).toHaveText('8,3');
  });

  test('Carport: 20 місць → 66 kWp; без зарядок порти 0', async ({ page }) => {
    const root = await openPicker(page, '/solar-carport/', 'carport');
    await expect(root.locator('.pk-big .pk-vh')).toHaveText('66');
    await root.locator('fieldset', { hasText: 'Потрібні зарядки?' }).getByLabel('Ні').check();
    await expect(root.locator('dd').nth(1).locator('.pk-vh')).toHaveText('0');
  });
});

test.describe('SPEC-004/AC-13 «Чи вистачить потужності?»', () => {
  test('ввід 50 / зарядка 60 → не вистачає 15 кВт; ввід 80 → вистачає, запас 15', async ({ page }) => {
    const root = await openPicker(page, '/', 'power');
    await expect(root.locator('.pk-result__title')).toContainText('Не вистачає 15 кВт');
    await expect(root.locator('.pk-result')).toContainText('накопичувач ≈ 10 кВт·год');
    await expect(root.locator('.pk-result')).toContainText('ETS DC-120 Battery');
    const field = root.getByLabel('Доступна потужність вводу, кВт');
    await field.fill('80');
    await field.blur();
    await expect(root.locator('.pk-result__title')).toContainText('Мережі вистачає');
    await expect(root.locator('.pk-result')).toContainText('Запас по вводу: 15 кВт');
  });
});

test.describe('SPEC-004/AC-14 CTA з параметрами і picker_complete', () => {
  test('посилання на форму несе відповіді й результат; подія після дії користувача', async ({ page }) => {
    const events: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'debug' && m.text().startsWith('[track] picker_complete')) events.push(m.text());
    });
    const root = await openPicker(page, '/', 'power');
    expect(events).toEqual([]);
    await root.getByLabel('120 кВт').check();
    await expect.poll(() => events.length).toBe(1);
    const href = await root.locator('a.pk-cta').getAttribute('href');
    const url = new URL(href!, 'http://x');
    expect(url.pathname).toBe('/kontakty/');
    expect(url.hash).toBe('#rozrakhunok');
    // 120 кВт при вводі 50: DC-120 потребує 130, дефіцит 80 → ceil(80 × 0,5 / 10) × 10 = 40 кВт·год
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ picker: 'power', need_kw: '120', grid_kw: '50', outcome: 'dc_deficit', station: 'ets-dc-120', battery_kwh: '40' });
    await root.locator('a.pk-cta').click();
    await expect(page).toHaveURL(/\/kontakty\/\?picker=power/);
  });
});

test.describe('SPEC-004/AC-15 повзунок і поле синхронні, межі', () => {
  test('значення поза межами притискається до межі з підказкою', async ({ page }) => {
    const root = await openPicker(page, '/', 'power');
    const field = root.getByLabel('Доступна потужність вводу, кВт');
    await field.fill('1000');
    await field.blur();
    await expect(field).toHaveValue('300');
    await expect(root.locator('input[type="range"]')).toHaveValue('300');
    await expect(root.locator('.pk-hint')).toContainText('Від 3 до 300');
    await root.locator('input[type="range"]').evaluate((el: HTMLInputElement) => {
      // React-контрольоване поле: значення через нативний сетер, інакше React не побачить подію (SPEC-004 рев. 2).
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, '120');
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(field).toHaveValue('120');
  });
});

test.describe('SPEC-004/AC-20 «рахунок, ₴» видимий неактивний до тарифу (D-031, Q-9)', () => {
  test('варіант є, вимкнений, з поміткою; розрахунок іде за кВт·год', async ({ page }) => {
    const root = await openPicker(page, '/sonyachni-paneli/', 'solar');
    const bill = root.getByLabel('Рахунок, ₴');
    await expect(bill).toBeVisible();
    await expect(bill).toBeDisabled();
    await expect(root.locator('[data-bill-note]')).toHaveText('Тариф надасть замовник — поки рахуємо за кВт·год.');
    await expect(root.getByLabel('кВт·год на місяць')).toBeChecked();
  });
});

test.describe('SPEC-004/AC-16 фасет «Час автономії»', () => {
  test('на /batarei/ «24–48 год» залишає домашню батарею', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-1440', 'фасети в колонці — desktop');
    const catalog = new CatalogPage(page);
    await catalog.open('/batarei/');
    // Ревізія 5 SPEC-002: фасети за змістом — «Час автономії» на /batarei/ розкритий, але helper розкриє його за потреби.
    await catalog.reveal('Час автономії (базові потреби)');
    await catalog.option('Час автономії (базові потреби)', '24–48 год').click();
    await expect(catalog.visibleCards()).toHaveCount(1);
    await expect(catalog.visibleCards().first()).toHaveAttribute('data-slug', 'ets-battery-home-10');
    await expect(page).toHaveURL(/autonomy_h=24-48/);
  });
});
