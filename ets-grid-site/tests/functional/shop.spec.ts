import { expect, test, type Page } from '@playwright/test';
import { isDesktop, presetStorage } from '../helpers/viewports';

const CART = 'etsgrid:cart:v1';
const COMPARE = 'etsgrid:compare:v1';

/** Як presetStorage, але лише при першому завантаженні вкладки: оформлення очищає кошик, і він не має повернутися. */
async function seedOnce(page: Page, values: Record<string, unknown>) {
  await page.addInitScript((entries) => {
    if (sessionStorage.getItem('test:seeded')) return;
    sessionStorage.setItem('test:seeded', '1');
    for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, JSON.stringify(v));
  }, values);
}

function captureConsole(page: Page) {
  const log: { type: string; text: string }[] = [];
  page.on('console', (m) => log.push({ type: m.type(), text: m.text() }));
  return log;
}

const nbsp = (s: string) => new RegExp(s.replace(/ /g, '\\s'));

test.describe('SPEC-005/AC-05 кошик', () => {
  test('позиції, «з монтажем», кількість, видалення, підсумок і демо-ціна', async ({ page }) => {
    await presetStorage(page, {
      [CART]: [
        { slug: 'ets-home-7', qty: 1, turnkey: true },
        { slug: 'panel-550-topcon', qty: 10, turnkey: false },
      ],
    });
    await page.goto('/koshyk/');
    const totals = page.locator('[data-totals]');
    await expect(page.locator('[data-total-equipment]')).toHaveText(nbsp('66 900 ₴'));
    await expect(page.locator('[data-total-installation]')).toHaveText(nbsp('8 000 ₴'));
    await expect(page.locator('[data-total]')).toContainText(nbsp('74 900 ₴'));
    await expect(totals).toContainText('демо-ціна');
    await expect(totals).toHaveAttribute('aria-live', 'polite');

    // «з монтажем» вимикається — монтаж зникає з підсумку
    await page.locator('[data-cart-line="ets-home-7"]').getByLabel(/З монтажем/).uncheck();
    await expect(page.locator('[data-total-installation]')).toHaveText('—');
    await expect(page.locator('[data-total]')).toContainText(nbsp('66 900 ₴'));

    // кількість: + і поле з межею 99
    await page.getByRole('button', { name: 'Збільшити кількість: Панель 550 Вт TOPCon' }).click();
    await expect(page.locator('[data-total]')).toContainText(nbsp('71 100 ₴'));
    await expect(page.locator('[data-cart-count-value]')).toHaveText('12');
    const qty = page.getByLabel('Кількість, шт.: Панель 550 Вт TOPCon');
    await qty.fill('500');
    await qty.press('Tab');
    await expect(qty).toHaveValue('99');

    // видалення
    await page.getByRole('button', { name: 'Видалити: Панель 550 Вт TOPCon' }).click();
    await expect(page.locator('[data-cart-line="panel-550-topcon"]')).toHaveCount(0);
    await expect(page.locator('[data-total]')).toContainText(nbsp('24 900 ₴'));

    // промокод видно, але неактивний, з поміткою (D-031)
    await expect(page.getByLabel('Промокод')).toBeDisabled();
    await expect(page.locator('#promo-note')).toHaveText('Промокоди зʼявляться в бойовій версії.');
  });

  test('«Додайте до замовлення»: адаптер GB/T для станції з Type 2 і плашка [АКСЕСУАРИ]', async ({ page }) => {
    await presetStorage(page, { [CART]: [{ slug: 'ets-home-22', qty: 1, turnkey: false }] });
    await page.goto('/koshyk/');
    const extras = page.locator('[data-cart-extras]');
    await expect(extras).toContainText('Адаптер Type 2 → GB/T AC');
    await expect(extras.locator('[data-extras-placeholder]')).toContainText('[АКСЕСУАРИ]');
    await extras.getByRole('button', { name: /До кошика/ }).click();
    await expect(page.locator('[data-cart-line="cable-gbt-type2"]')).toBeVisible();
    await expect(extras).not.toContainText('Адаптер Type 2 → GB/T AC');
  });

  test('товар, якого немає в каталозі, — «Товар більше недоступний» і «Видалити»', async ({ page }) => {
    await presetStorage(page, { [CART]: [{ slug: 'zniklyi-tovar', qty: 1, turnkey: false }] });
    await page.goto('/koshyk/');
    await expect(page.locator('[data-cart-line="zniklyi-tovar"]')).toContainText('Товар більше недоступний');
    await page.getByRole('button', { name: /^Видалити/ }).click();
    await expect(page.getByRole('heading', { name: 'Кошик порожній' })).toBeVisible();
  });

  test('порожній кошик: плитки рівнів і «Недавно переглянуті»', async ({ page }) => {
    await presetStorage(page, { 'etsgrid:recent:v1': ['ets-home-22', 'inverter-hybrid-10'] });
    await page.goto('/koshyk/');
    const empty = page.locator('[data-cart-empty]');
    await expect(empty.getByRole('heading', { name: 'Кошик порожній' })).toBeVisible();
    await expect(empty.getByRole('link', { name: /Зарядні станції/ })).toBeVisible();
    await expect(empty.getByRole('heading', { name: 'Недавно переглянуті' })).toBeVisible();
    await expect(empty.getByRole('link', { name: 'ETS Home 22' })).toBeVisible();
    await expect(page.locator('[data-nojs-note]')).toBeHidden();
  });
});

test.describe('SPEC-005/AC-06 оформлення', () => {
  test('3 кроки, перевірка, begin_checkout, purchase, очищення кошика, «Дякуємо» з номером', async ({ page }) => {
    const log = captureConsole(page);
    await seedOnce(page, { [CART]: [{ slug: 'ets-home-7', qty: 1, turnkey: true }] });
    await page.goto('/oformlennya/');
    const form = page.locator('[data-checkout-form]');
    await expect(form.locator('fieldset legend')).toHaveText([/Контакти/, /Доставка/, /Оплата/]);
    await expect(page.locator('aside [data-total]')).toContainText(nbsp('32 900 ₴'));
    await expect.poll(() => log.some((l) => l.text.includes('begin_checkout'))).toBe(true);

    await form.getByRole('button', { name: 'Підтвердити замовлення' }).click();
    const summary = page.locator('[data-checkout-errors]');
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Вкажіть імʼя');
    await expect(summary).toContainText('Вкажіть номер відділення');

    await form.getByLabel(/^Імʼя/).fill('Олена');
    await form.getByLabel(/^Телефон/).fill('0671234567');
    await form.getByLabel(/^Місто/).fill('Київ');
    await form.getByLabel(/^Номер відділення/).fill('12');
    await form.getByLabel('Рахунок для юрособи').check();
    await form.getByLabel(/^Назва компанії/).fill('ТОВ Тест');
    await form.getByLabel(/^ЄДРПОУ/).fill('12345678');
    await form.getByRole('button', { name: 'Підтвердити замовлення' }).click();

    await expect(page).toHaveURL(/\/dyakuyemo\/\?type=order&id=ETS-\d{8}-[A-Z0-9]{4}$/);
    const url = decodeURIComponent(page.url());
    for (const personal of ['Олена', '067', 'Київ', 'ТОВ', '12345678']) expect(url).not.toContain(personal);

    const id = new URL(page.url()).searchParams.get('id')!;
    await expect(page.locator('[data-thanks-order]')).toBeVisible();
    await expect(page.locator('[data-thanks-order-id]')).toHaveText(id);
    await expect(page.locator('[data-thanks-payment]')).toContainText('Рахунок для юрособи');
    await expect(page.locator('[data-cart-count]')).toBeHidden();
    expect(await page.evaluate((k) => localStorage.getItem(k), CART)).toBe('[]');

    const orderLine = log.find((l) => l.type === 'info' && l.text.startsWith('[order]'));
    const order = JSON.parse(orderLine!.text.slice('[order] '.length));
    expect(order).toMatchObject({
      type: 'order',
      id,
      customer: { name: 'Олена', phone: '+380671234567' },
      delivery: { method: 'np_branch', city: 'Київ', branch: '12' },
      payment: { method: 'invoice', company: 'ТОВ Тест', edrpou: '12345678' },
      totals: { equipment: 24900, installation: 8000, total: 32900 },
    });
    expect(log.some((l) => l.text.includes('purchase'))).toBe(true);
  });

  test('порожній кошик — «Кошик порожній» і посилання назад', async ({ page }) => {
    await page.goto('/oformlennya/');
    await expect(page.locator('[data-checkout-empty]')).toContainText('Кошик порожній');
    await expect(page.getByRole('link', { name: 'Повернутися до кошика' })).toHaveAttribute('href', '/koshyk/');
  });
});

test.describe('SPEC-005/AC-07 шлях покупки AC-станції ≤ 6 кроків', () => {
  test('головна → рівень → категорія → «До кошика» → кошик → оформлення → «Дякуємо»', async ({ page }) => {
    let steps = 0;
    const step = async (action: Promise<unknown>) => {
      steps++;
      await action;
    };
    await page.goto('/');
    await step(page.locator('main').getByRole('link', { name: /Зарядні станції/ }).first().click());
    await expect(page.locator('h1')).toHaveText('Зарядні станції');
    await step(page.locator('main').getByRole('link', { name: 'Для дому' }).first().click());
    await expect(page.locator('h1')).toHaveText('Для дому');
    await step(page.locator('[data-slug="ets-home-7"] [data-add-to-cart]').click());
    await expect(page.locator('[data-cart-count-value]')).toHaveText('1');
    await step(page.getByRole('link', { name: /^Кошик/ }).click());
    await step(page.getByRole('link', { name: 'Оформити замовлення' }).click());
    const form = page.locator('[data-checkout-form]');
    await form.getByLabel(/^Імʼя/).fill('Олена');
    await form.getByLabel(/^Телефон/).fill('0671234567');
    await form.getByLabel(/^Місто/).fill('Київ');
    await form.getByLabel(/^Номер відділення/).fill('12');
    await step(form.getByRole('button', { name: 'Підтвердити замовлення' }).click());
    await expect(page).toHaveURL(/\/dyakuyemo\/\?type=order/);
    expect(steps).toBeLessThanOrEqual(6);
  });
});

test.describe('SPEC-005/AC-08 порівняння', () => {
  test('до 4 товарів, «Тільки відмінності», «Прибрати», порожній стан', async ({ page }) => {
    await presetStorage(page, { [COMPARE]: ['ets-home-7', 'ets-home-22', 'ets-dc-60', 'ets-battery-home-10'] });
    await page.goto('/porivnyannya/');
    const table = page.locator('table.cmp');
    await expect(table.locator('thead th[scope="col"]')).toHaveCount(4);
    await expect(table.locator('[data-level-group]')).toHaveCount(2);
    await expect(table.locator('[data-level-group="1"] th[scope="rowgroup"]')).toHaveText('Зарядні станції');
    // у батареї в рядках зарядних станцій — «—»
    await expect(table.locator('[data-level-group="1"] tr').nth(1).locator('td').nth(3)).toHaveText('—');

    const rows = table.locator('tbody tr[data-row]');
    const all = await rows.count();
    const diff = page.getByRole('button', { name: 'Тільки відмінності' });
    await diff.click();
    await expect(diff).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => rows.count()).toBeLessThan(all);
    await diff.click();
    await expect(rows).toHaveCount(all);

    for (const name of ['Домашня батарея 10 кВт·год LFP', 'ETS DC-60 Duo', 'ETS Home 22']) {
      await page.getByRole('button', { name: `Прибрати: ${name}` }).click();
    }
    await expect(table.locator('thead th[scope="col"]')).toHaveCount(1);
    await expect(diff).toHaveCount(0);
    await page.getByRole('button', { name: 'Прибрати: ETS Home 7' }).click();
    await expect(page.locator('[data-compare-empty]')).toContainText('Додайте товари кнопкою «Порівняти» в каталозі');
  });

  test('mobile: таблиця прокручується у своєму блоці, сторінка — ні', async ({ page }) => {
    await presetStorage(page, { [COMPARE]: ['ets-home-7', 'ets-home-22', 'ets-dc-60'] });
    await page.goto('/porivnyannya/');
    await expect(page.locator('table.cmp')).toBeVisible();
    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(pageOverflow).toBeLessThanOrEqual(0);
  });
});

test.describe('SPEC-005/AC-09 пошук', () => {
  test('сторінка результатів: «gbt», опечатка, нічого не знайдено', async ({ page }) => {
    await page.goto('/poshuk/?q=gbt');
    await expect(page.locator('[data-search-count]')).toHaveText('Знайдено: 4 товари');
    await expect(page.locator('[data-search-item]:visible')).toHaveCount(4);
    await expect(page.locator('#search-q')).toHaveValue('gbt');

    await page.goto('/poshuk/?q=' + encodeURIComponent('інвертр'));
    await expect(page.locator('[data-search-item]:visible')).toHaveCount(1);
    await expect(page.locator('[data-search-item="inverter-hybrid-10"]')).toBeVisible();

    await page.goto('/poshuk/?q=qwertyuiop');
    await expect(page.locator('[data-search-empty]')).toBeVisible();
    await expect(page.locator('[data-search-empty]')).toContainText('Нічого не знайшли');
  });

  test('підказки в шапці: стрілки, Enter, Esc', async ({ page }, info) => {
    await page.goto('/');
    let input = page.locator('#header-q');
    if (!isDesktop(info)) {
      await page.locator('summary', { hasText: 'Меню' }).click();
      input = page.locator('#mobile-q');
    }
    const list = page.locator(`#${await input.getAttribute('aria-controls')}`);
    await input.click();
    await input.pressSequentially('ets h');
    await expect(list).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(list.getByRole('option')).toHaveCount(3);

    await input.press('ArrowDown');
    await input.press('ArrowDown');
    const active = await input.getAttribute('aria-activedescendant');
    await expect(page.locator(`#${active}`)).toHaveAttribute('aria-selected', 'true');
    await input.press('ArrowUp');
    await expect(input).toHaveAttribute('aria-activedescendant', /-0$/);

    await input.press('Escape');
    await expect(list).toBeHidden();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveValue('ets h');

    await input.press('ArrowDown');
    await expect(list).toBeVisible();
    const target = await page.locator(`#${await input.getAttribute('aria-activedescendant')}`).getAttribute('data-url');
    await input.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${target}$`));
  });

  test('Enter без вибраної підказки — сторінка пошуку', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'поле в шапці — desktop');
    await page.goto('/');
    await page.locator('#header-q').fill('type 2');
    await page.locator('#header-q').press('Enter');
    await expect(page).toHaveURL(/\/poshuk\/\?q=type\+2$/);
    await expect(page.locator('[data-search-count]')).toContainText('Знайдено:');
  });
});
