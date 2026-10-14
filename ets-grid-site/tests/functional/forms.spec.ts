import { expect, test, type Page } from '@playwright/test';

const FORM = '#rozrakhunok form[data-lead-form]';

/** Форма приймає надсилання лише через 3 с після показу (антиспам). */
async function waitAntispam(page: Page) {
  await page.waitForTimeout(3100);
}

function captureLeads(page: Page) {
  const leads: Record<string, unknown>[] = [];
  page.on('console', (m) => {
    if (m.type() === 'info' && m.text().startsWith('[lead]')) leads.push(JSON.parse(m.text().slice('[lead] '.length)));
  });
  return leads;
}

test.describe('SPEC-009/AC-06 товар із ?product=', () => {
  test('показує товар і відмічає рівень', async ({ page }) => {
    await page.goto('/kontakty/?product=ets-dc-60#rozrakhunok');
    const form = page.locator(FORM);
    await expect(form.locator('[data-lead-product]')).toBeVisible();
    await expect(form.locator('[data-lead-product-text]')).toContainText('ETS DC-60 Duo');
    await expect(form.getByLabel('Зарядні станції')).toBeChecked();
  });
});

test.describe('SPEC-009/AC-07 параметри підбірника', () => {
  test('CTA підбірника приносить зведення; «Прибрати» прибирає його із заявки', async ({ page }) => {
    const leads = captureLeads(page);
    await page.goto('/');
    const root = page.locator('[data-picker="power"]');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveAttribute('data-ready', 'true');
    await root.locator('a.pk-cta').click();
    await expect(page).toHaveURL(/\/kontakty\/\?picker=power/);
    const form = page.locator(FORM);
    await expect(form.locator('[data-lead-picker-text]')).toContainText('Потрібна зарядка 60 кВт, ввід 50 кВт');
    await expect(form.getByLabel('Зарядні станції')).toBeChecked();

    await form.locator('[data-lead-picker-remove]').click();
    await expect(form.locator('[data-lead-picker]')).toBeHidden();
    await waitAntispam(page);
    await form.getByLabel(/Телефон/).fill('0671234567');
    await form.getByRole('button', { name: 'Надіслати заявку' }).click();
    await expect(page).toHaveURL(/\/dyakuyemo\//);
    expect(leads[0]?.picker).toBeNull();
  });
});

test.describe('SPEC-009/AC-08 помилки', () => {
  test('порожнє надсилання → зведення помилок і фокус; виправлення знімає помилку', async ({ page }) => {
    await page.goto('/kontakty/#rozrakhunok');
    const form = page.locator(FORM);
    await form.getByRole('button', { name: 'Надіслати заявку' }).click();
    const summary = form.locator('[data-lead-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Вкажіть номер телефону');
    const phone = form.getByLabel(/Телефон/);
    await expect(phone).toHaveAttribute('aria-invalid', 'true');
    await phone.fill('067 123 45 67');
    await phone.blur();
    await expect(phone).not.toHaveAttribute('aria-invalid', 'true');
    await expect(phone).toHaveValue('+380 67 123 45 67');
  });
});

test.describe('SPEC-009/AC-09 успішна заявка', () => {
  test('[lead] за контрактом, quote_submit, перехід без персональних даних в адресі', async ({ page }) => {
    const leads = captureLeads(page);
    const events: string[] = [];
    page.on('console', (m) => m.type() === 'debug' && m.text().startsWith('[track] quote_submit') && events.push(m.text()));
    await page.goto('/kontakty/?product=ets-home-7#rozrakhunok');
    const form = page.locator(FORM);
    await waitAntispam(page);
    await form.getByLabel('Імʼя').fill('Олена');
    await form.getByLabel(/Телефон/).fill('+38 (067) 123-45-67');
    await form.getByLabel('Бізнес / паркінг').check();
    await form.getByLabel('Telegram').check();
    await form.getByRole('button', { name: 'Надіслати заявку' }).click();
    await expect(page).toHaveURL(/\/dyakuyemo\/\?type=lead&id=L-\d{8}-[A-Z0-9]{4}$/);
    expect(page.url()).not.toContain('0671234567');
    expect(page.url()).not.toContain('Олена');
    expect(leads[0]).toMatchObject({
      type: 'lead',
      kind: 'quote',
      name: 'Олена',
      phone: '+380671234567',
      object_type: 'business',
      interests: ['charging'],
      messenger: 'telegram',
      product: 'ets-home-7',
      source_url: '/kontakty/',
    });
    expect(events).toHaveLength(1);
    await expect(page.locator('[data-thanks-lead]')).toBeVisible();
    await expect(page.locator('[data-thanks-id]')).toHaveText(String(leads[0].id));
  });
});

test.describe('SPEC-009/AC-10 антиспам', () => {
  test('заповнена пастка — заявка не йде', async ({ page }) => {
    const leads = captureLeads(page);
    await page.goto('/kontakty/#rozrakhunok');
    const form = page.locator(FORM);
    await waitAntispam(page);
    await form.locator('input[name="website"]').evaluate((el: HTMLInputElement) => (el.value = 'spam'));
    await form.getByLabel(/Телефон/).fill('0671234567');
    await form.getByRole('button', { name: 'Надіслати заявку' }).click();
    await page.waitForTimeout(800);
    expect(leads).toEqual([]);
    await expect(page).toHaveURL(/\/kontakty\//);
  });

  test('надсилання раніше 3 с — заявка не йде', async ({ page }) => {
    const leads = captureLeads(page);
    await page.goto('/kontakty/#rozrakhunok');
    const form = page.locator(FORM);
    await form.getByLabel(/Телефон/).fill('0671234567');
    await form.getByRole('button', { name: 'Надіслати заявку' }).click();
    await page.waitForTimeout(800);
    expect(leads).toEqual([]);
  });
});

test.describe('SPEC-009/AC-11 UTM', () => {
  test('UTM першого входу потрапляють у заявку на іншій сторінці', async ({ page }) => {
    const leads = captureLeads(page);
    await page.goto('/?utm_source=google&utm_campaign=ev');
    await page.goto('/batarei/');
    const form = page.locator('[data-level-block="form"] form');
    await form.scrollIntoViewIfNeeded();
    await waitAntispam(page);
    await form.getByLabel(/Телефон/).fill('0671234567');
    await form.getByRole('button', { name: 'Надіслати заявку' }).click();
    await expect(page).toHaveURL(/\/dyakuyemo\//);
    expect(leads[0]).toMatchObject({ kind: 'level', interests: ['battery'], utm: { utm_source: 'google', utm_campaign: 'ev' } });
  });
});
