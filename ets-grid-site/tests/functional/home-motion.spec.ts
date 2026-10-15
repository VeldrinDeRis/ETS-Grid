// SPEC-006 ревізія 6.3 (D-072): цикли на паузі поза кадром, лампа на transform (AC-43), карусель без анімації
// при reduced-motion (AC-44).
import { expect, test } from '@playwright/test';
import { isDesktop } from '../helpers/viewports';

const playState = (sel: string) => (page: import('@playwright/test').Page) =>
  page.locator(sel).first().evaluate((el) => getComputedStyle(el).animationPlayState);

test.describe('SPEC-006/AC-43 рух без зайвого перемальовування', () => {
  test('доба над героєм іде в кадрі й стоїть поза ним', async ({ page }) => {
    await page.goto('/');
    const sky = playState('.hero__sky--dawn');
    await expect.poll(() => sky(page)).toBe('running');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect.poll(() => sky(page)).toBe('paused');
    await page.evaluate(() => scrollTo(0, 0));
    await expect.poll(() => sky(page)).toBe('running');
  });

  test('лампа-курсор їде transform, без змінних на .hero', async ({ page }, info) => {
    test.skip(!isDesktop(info), 'лампа — лише з точним вказівником');
    await page.goto('/');
    const hero = page.locator('[data-home-block="hero"]');
    const box = (await hero.boundingBox())!;
    await page.mouse.move(box.x + 300, box.y + 200);
    await page.mouse.move(box.x + 600, box.y + 300, { steps: 5 });
    const lamp = page.locator('[data-hero-lamp]');
    await expect.poll(() => lamp.evaluate((el) => el.style.transform)).toBe('translate(600px, 300px)');
    expect(await hero.evaluate((el) => el.style.getPropertyValue('--lx'))).toBe('');
  });

  test('після [data-done] риска підказки без анімації', async ({ page }) => {
    await page.goto('/');
    const flow = page.locator('[data-energy-flow]');
    await flow.evaluate((el) => el.setAttribute('data-done', ''));
    expect(await page.locator('.flow__hint').evaluate((el) => getComputedStyle(el, '::before').animationName)).toBe('none');
  });
});

test.describe('SPEC-006/AC-44 карусель при reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('хіти гортаються миттєво', async ({ page }) => {
    await page.goto('/');
    const hits = page.locator('[data-hits]');
    await hits.scrollIntoViewIfNeeded();
    await expect(hits.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', '');
    const next = hits.getByRole('button', { name: /Наступн/ }).first();
    await expect(next).toBeEnabled();
    const track = hits.locator('.hits__track ul, .hits__track > *').first();
    const before = await track.evaluate((el) => getComputedStyle(el).transform);
    await next.click();
    // Через два кадри після кліку зсув уже кінцевий: замір через 600 мс той самий.
    const early = await track.evaluate(() => new Promise<string>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(getComputedStyle(document.querySelector('.hits__track ul, .hits__track > *')!).transform)))));
    await page.waitForTimeout(600);
    const late = await track.evaluate((el) => getComputedStyle(el).transform);
    expect(late).not.toBe(before);
    expect(early).toBe(late);
  });
});
