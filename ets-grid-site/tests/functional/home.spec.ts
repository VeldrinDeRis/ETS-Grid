import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const homeJson = JSON.parse(readFileSync(new URL('../../src/data/home-content.json', import.meta.url), 'utf8')) as typeof import('../../src/data/home-content.json');
import { isDesktop, isMobile } from '../helpers/viewports';

const catalog = JSON.parse(readFileSync(new URL('../../src/data/catalog.json', import.meta.url), 'utf8')) as { products: { slug: string; level: number }[] };
const levelOf = (slug: string) => catalog.products.find((p) => p.slug === slug)!.level;

const variant = (id: string) => homeJson.hero.variants.find((v) => v.id === id)!;

test.describe('SPEC-006/AC-04 рамки фото видно на обох екранах (D-031)', () => {
  test('фото героя — тло всього блоку, фото навісу видиме (рев. 5, акт I)', async ({ page }) => {
    await page.goto('/');
    const heroPhoto = page.locator('.hero__photo');
    await expect(heroPhoto).toBeVisible();
    await expect(page.locator('.carport__photo')).toBeVisible();
    const hero = (await page.locator('[data-home-block="hero"]').boundingBox())!;
    const photo = (await heroPhoto.boundingBox())!;
    expect(Math.abs(photo.y - hero.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(photo.height - hero.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(photo.width - hero.width)).toBeLessThanOrEqual(2);
    await expect(heroPhoto.locator('img')).toHaveAttribute('fetchpriority', 'high');
  });
});

test.describe('SPEC-006/AC-28 лампа-курсор над героєм (акт I)', () => {
  test('desktop: після руху вказівника лампа видима і йде за ним; на 375 лампи нема', async ({ page }, info) => {
    await page.goto('/');
    const lamp = page.locator('[data-hero-lamp]');
    if (isMobile(info)) {
      await expect(lamp).toBeHidden();
      return;
    }
    await page.mouse.move(900, 300);
    await page.mouse.move(1000, 400);
    await expect(lamp).toHaveCSS('opacity', '1', { timeout: 1500 });
    const vars = await page.locator('[data-home-block="hero"]').evaluate((el) => [el.style.getPropertyValue('--lx'), el.style.getPropertyValue('--ly')]);
    expect(vars[0]).toBe('1000px');
    expect(parseFloat(vars[1])).toBeGreaterThan(0);
    await page.mouse.move(700, 20);
    await expect(lamp).toHaveCSS('opacity', '0', { timeout: 2000 });
  });
});

test.describe('SPEC-006/AC-29 довіра і контакт у першому екрані 1440', () => {
  test.beforeEach(({}, info) => test.skip(!isDesktop(info), 'тільки desktop'));
  test('полоса довіри й контакти — в межах 900 px, лампа не акцентний елемент (AC-17)', async ({ page }) => {
    await page.goto('/');
    const box = (await page.locator('[data-home-block="hero"] .hero__trust').boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  });
});

test.describe('SPEC-006/AC-11 1440: перший екран цілком', () => {
  test.beforeEach(({}, info) => test.skip(!isDesktop(info), 'тільки desktop'));

  test('усі елементи першого екрана в межах 900 px', async ({ page }) => {
    await page.goto('/');
    const height = page.viewportSize()!.height;
    for (const sel of ['h1', '[data-hero-cta="primary"]', '[data-hero-cta="secondary"]', '.hero__anchor:visible', '.hero__tiles', '.hero__trust', '.hero__photo']) {
      const box = await page.locator(`[data-home-block="hero"] ${sel}`).first().boundingBox();
      expect(box, sel).not.toBeNull();
      expect(box!.y + box!.height, sel).toBeLessThanOrEqual(height);
    }
  });
});

test.describe('SPEC-006/AC-12 375: основна CTA в першому екрані, плитки — стрічкою', () => {
  test.beforeEach(({}, info) => test.skip(!isMobile(info), 'тільки mobile'));

  test('H1, підзаголовок, CTA видно; верх плиток видно; плитки гортаються без прокрутки сторінки', async ({ page }) => {
    await page.goto('/');
    const height = page.viewportSize()!.height;
    for (const sel of ['h1', '[data-hero-field="subtitle"]', '[data-hero-cta="primary"]']) {
      const box = await page.locator(`[data-home-block="hero"] ${sel}`).boundingBox();
      expect(box!.y + box!.height, sel).toBeLessThanOrEqual(height);
    }
    const tiles = page.locator('.hero__tiles');
    expect((await tiles.boundingBox())!.y).toBeLessThan(height);
    const { scroll, client } = await tiles.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(scroll).toBeGreaterThan(client);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});

test.describe('SPEC-006/AC-13 CTA і аналітика', () => {
  test('основна → #potuzhnist, вторинна → форма; hero_cta_click і level_tile_click', async ({ page }) => {
    const log: string[] = [];
    page.on('console', (m) => log.push(m.text()));
    await page.goto('/');
    await page.locator('[data-hero-cta="primary"]').click();
    await expect(page).toHaveURL(/#potuzhnist$/);
    await expect.poll(() => log.some((l) => l.includes('hero_cta_click'))).toBe(true);
    await expect(page.locator('[data-hero-cta="secondary"]')).toHaveAttribute('href', '/kontakty/#rozrakhunok');

    await page.locator('[data-level-tile="solar"]').click();
    await expect(page).toHaveURL(/\/sonyachni-paneli\/$/);
    expect(log.some((l) => l.includes('level_tile_click'))).toBe(true);
  });
});

test.describe('SPEC-006/AC-14, AC-19 вкладки і фільтри хітів', () => {
  test('вкладки: клік і стрілки, aria-selected, одна видима панель', async ({ page }) => {
    await page.goto('/');
    const block = page.locator('[data-home-block="systems"]');
    const tabs = block.getByRole('tab');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(block.locator('[data-tab-panel]:visible')).toHaveCount(1);

    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(block.locator('#panel-home')).toBeVisible();
    await expect(block.locator('#panel-business')).toBeHidden();

    await tabs.nth(1).press('ArrowRight');
    await expect(tabs.nth(2)).toBeFocused();
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  });

  test('фільтри хітів лишають картки вибраного рівня', async ({ page }) => {
    await page.goto('/');
    const block = page.locator('[data-home-block="hits"]');
    await block.scrollIntoViewIfNeeded();
    await block.getByRole('button', { name: 'Батареї' }).click();
    await expect(block.getByRole('button', { name: 'Батареї' })).toHaveAttribute('aria-pressed', 'true');
    const visible = block.locator('[data-hits-level]:visible');
    await expect(visible).toHaveCount(homeJson.hits.filter((s) => levelOf(s) === 3).length);
    for (const level of await visible.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.hitsLevel))) expect(level).toBe('3');
    await block.getByRole('button', { name: 'Усі' }).click();
    await expect(block.locator('[data-hits-level]:visible')).toHaveCount(homeJson.hits.length);
  });
});

test.describe('SPEC-006/AC-15 варіанти першого екрана', () => {
  test('без параметра — B; ?hero=a і ?hero=c — свої тексти; невідомий — B', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(variant('b').h1);
    for (const id of ['a', 'c']) {
      await page.goto(`/?hero=${id}`);
      await expect(page.locator('h1')).toHaveText(variant(id).h1);
      await expect(page.locator('[data-hero-cta="primary"]')).toHaveText(variant(id).primary_cta);
    }
    await expect(page.locator('.hero__anchor:visible')).toContainText(variant('c').anchor_label);
    await page.goto('/?hero=zzz');
    await expect(page.locator('h1')).toHaveText(variant('b').h1);
  });
});

test.describe('SPEC-006/AC-16 міні-конфігуратор', () => {
  test('лише повзунок місць; він змінює kWp, панелі, порти, ємність', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('[data-home-block="carport"] [data-picker="carport"]');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveAttribute('data-ready', 'true');
    await expect(root.locator('fieldset')).toHaveCount(0);
    await expect(root.getByRole('link', { name: 'Повний конфігуратор' })).toHaveAttribute('href', '/solar-carport/#konfigurator');
    const before = await root.locator('.pk-result, [data-result]').first().innerText();
    const input = root.getByRole('spinbutton');
    await input.fill('60');
    await input.press('Tab');
    await expect.poll(() => root.locator('.pk-result, [data-result]').first().innerText()).not.toBe(before);
  });
});

test.describe('SPEC-006/AC-17 один акцентний елемент у першому екрані', () => {
  test('лише основна CTA має фон акцентного кольору', async ({ page }) => {
    await page.goto('/');
    const accented = await page.locator('[data-home-block="hero"]').evaluate((hero) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--color-accent)';
      hero.append(probe);
      const accent = getComputedStyle(probe).color;
      probe.remove();
      // Дрібні індикатори (світлодіоди на стійках, D-056) — не в рахунок (SPEC-006 §5).
      return [...hero.querySelectorAll<HTMLElement>('*')]
        .filter((el) => el.offsetParent !== null && !el.hasAttribute('data-hero-led') && getComputedStyle(el).backgroundColor === accent)
        .map((el) => el.dataset.heroCta ?? el.className);
    });
    expect(accented).toEqual(['primary']);
  });
});

/** Текст H1 без «сирих» пробілів між span слів. */
const h1Text = (page: import('@playwright/test').Page) => page.locator('h1').evaluate((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim());

test.describe('SPEC-006/AC-24 H1: слова загоряються (splitText, рев. 4)', () => {
  for (const id of ['b', 'a', 'c']) {
    test(`варіант ${id}: слова H1 — span.hero__word, потім H1 знову простим текстом з opacity 1`, async ({ page }) => {
      const words = variant(id).h1.split(' ');
      await page.goto(id === 'b' ? '/' : `/?hero=${id}`);
      const h1 = page.locator('h1');
      // Під час анімації: стільки span, скільки слів; доступне ім'я — текст варіанта.
      await expect(h1.locator('.hero__word')).toHaveCount(words.length);
      expect(await h1.locator('.hero__word').allTextContents()).toEqual(words);
      await expect(h1).toHaveAccessibleName(variant(id).h1);
      // Після анімації: span прибрано, текст той самий, H1 і слова на opacity 1.
      await expect(h1.locator('.hero__word')).toHaveCount(0, { timeout: 2500 });
      expect(await h1Text(page)).toBe(variant(id).h1);
      await expect(h1).toHaveCSS('opacity', '1');
      await expect(h1).not.toHaveAttribute('aria-label');
    });
  }
});

test.describe('SPEC-006/AC-25 H1 без анімації', () => {
  test.describe('reduced-motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('немає span.hero__word, H1 з opacity 1 одразу', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).not.toHaveAttribute('data-motion', 'on');
      await expect(page.locator('h1')).toHaveCSS('opacity', '1');
      await page.waitForTimeout(800);
      await expect(page.locator('h1 .hero__word')).toHaveCount(0);
    });
  });

  test.describe('без JS', () => {
    test.use({ javaScriptEnabled: false });
    test('H1 простим текстом з opacity 1', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toHaveCSS('opacity', '1');
      await expect(page.locator('h1 .hero__word')).toHaveCount(0);
      expect(await h1Text(page)).toBe(variant('b').h1);
    });
  });

  test('скрипти модулів не завантажились — страховка повертає H1 до opacity 1 за ≤ 1,5 с', async ({ page }) => {
    await page.route('**/_astro/*.js', (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
    await expect(page.locator('h1')).toHaveCSS('opacity', '1', { timeout: 1500 });
    await expect(page.locator('h1 .hero__word')).toHaveCount(0);
  });
});

test.describe('SPEC-006/AC-30, AC-31 схема вмикається прокруткою (акт II)', () => {
  test('desktop: до прокрутки вузли приглушені, наприкінці треку всі 5 увімкнені, числа докручені; mobile: вузол вмикається в кадрі', async ({ page }, info) => {
    await page.goto('/');
    const flow = page.locator('[data-energy-flow]');
    const nodes = flow.locator('[data-node]');
    await expect(nodes).toHaveCount(5);
    if (isMobile(info)) {
      await expect(nodes.nth(0)).not.toHaveAttribute('data-lit', '');
      await nodes.nth(2).scrollIntoViewIfNeeded();
      await expect(nodes.nth(2)).toHaveAttribute('data-lit', '', { timeout: 2000 });
      return;
    }
    const box = (await flow.boundingBox())!;
    expect(box.height).toBeGreaterThan(page.viewportSize()!.height * 2.5);
    await page.evaluate((y) => window.scrollTo(0, y), box.y + 10);
    await page.waitForTimeout(400);
    await expect(nodes.nth(4)).not.toHaveAttribute('data-lit', '');
    // Розряди AnimateNumber — aria-hidden, поточне значення — в його aria-label; статичне число приховане за [data-live].
    const digits = nodes.nth(2).locator('.live-number [aria-label]');
    await expect(digits).toHaveAttribute('aria-label', '0,00');
    await expect(nodes.nth(2).locator('.flow__static')).toBeHidden();
    await page.evaluate((y) => window.scrollTo(0, y), box.y + box.height - page.viewportSize()!.height - 2);
    await page.waitForTimeout(900);
    for (let i = 0; i < 5; i++) await expect(nodes.nth(i)).toHaveAttribute('data-lit', '');
    await expect(digits).toHaveAttribute('aria-label', '10,24', { timeout: 3000 });
    await expect(nodes.nth(2).locator('.flow__num .visually-hidden')).toHaveText('10,24');
    await expect(flow.locator('[data-flow-spark][data-run]')).toHaveCount(4);
  });
});

test.describe('SPEC-006/AC-33 вогники зарядки (D-056)', () => {
  test('плитки: вогники загоряються по черзі (анімація з затримкою за --i); фото: світлодіоди на desktop у межах героя', async ({ page }, info) => {
    await page.goto('/');
    const delays = await page.locator('.hero__tile').evaluateAll((els) => els.map((el) => getComputedStyle(el, '::after').animationDelay));
    expect(delays).toHaveLength(4);
    expect(new Set(delays).size).toBe(4);
    const leds = page.locator('[data-hero-led]:visible');
    if (isMobile(info)) {
      await expect(leds.first()).toBeHidden();
      return;
    }
    // Позицію ставить скрипт після завантаження фото (translate); стійки під тінню колонки тексту приховані — видимих ≥ 2.
    await expect(page.locator('[data-hero-led]').last()).toHaveAttribute('style', /translate\(/);
    expect(await leds.count()).toBeGreaterThanOrEqual(2);
    const hero = (await page.locator('[data-home-block="hero"]').boundingBox())!;
    for (const led of await leds.all()) {
      const b = (await led.boundingBox())!;
      expect(b.x).toBeGreaterThan(hero.x);
      expect(b.x + b.width).toBeLessThan(hero.x + hero.width);
      expect(b.y).toBeGreaterThan(hero.y);
      expect(b.y + b.height).toBeLessThan(hero.y + hero.height);
    }
  });
});
