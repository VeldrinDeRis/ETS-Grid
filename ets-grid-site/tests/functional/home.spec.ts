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

test.describe('SPEC-006/AC-40 кнопки-фільтри хітів: вогник замість інверсії (The Lit Chip Rule, D-064)', () => {
  // Обчислені стилі кнопки та її ::before: вогник акценту, фон кнопки прозорий у всіх, вибрана — рамка ink і текст 700.
  // Кнопку шукаємо всередині сторінки за data-hits-filter щоразу заново: острів під час гідратації перебудовує вузли,
  // і захоплений раніше елемент може виявитися від'єднаним (у нього обчислені стилі порожні).
  const probe = (block: import('@playwright/test').Locator, filter: string) =>
    block.evaluate((root, f) => {
      const el = root.querySelector<HTMLElement>(`.hits__filters button[data-hits-filter="${f}"]`)!;
      const cs = getComputedStyle(el);
      const before = getComputedStyle(el, '::before');
      const vars = getComputedStyle(document.documentElement);
      const toRgb = (v: string) => {
        const s = document.createElement('span');
        s.style.color = v.trim();
        document.body.append(s);
        const rgb = getComputedStyle(s).color;
        s.remove();
        return rgb;
      };
      return {
        pressed: el.getAttribute('aria-pressed'),
        background: cs.backgroundColor,
        borderColor: cs.borderColor,
        fontWeight: cs.fontWeight,
        dotWidth: before.width,
        dotHeight: before.height,
        dotRadius: before.borderRadius,
        dotBackground: before.backgroundColor,
        dotOpacity: before.opacity,
        dotShadow: before.boxShadow,
        accent: toRgb(vars.getPropertyValue('--color-accent')),
        ink: toRgb(vars.getPropertyValue('--color-ink')),
      };
    }, filter);

  const expectLit = (s: Awaited<ReturnType<typeof probe>>) => {
    expect(s.dotOpacity).toBe('1');
    expect(s.dotShadow).toContain(s.accent);
    expect(s.borderColor).toBe(s.ink);
    expect(s.fontWeight).toBe('700');
  };
  const expectDim = (s: Awaited<ReturnType<typeof probe>>) => {
    expect(Number(s.dotOpacity)).toBeCloseTo(0.3, 2);
    expect(s.dotShadow).toBe('none');
    expect(s.borderColor).not.toBe(s.ink);
    expect(s.fontWeight).not.toBe('700');
  };

  test('невибрана — вогник 0,3 без ореолу; вибрана — вогник 1 з ореолом, рамка ink, текст 700; фон прозорий; після кліку міняються місцями', async ({ page }) => {
    await page.goto('/');
    const block = page.locator('[data-home-block="hits"]');
    await block.scrollIntoViewIfNeeded();
    // Острів гідратований (Astro знімає атрибут ssr) — далі вузли кнопок стабільні.
    await expect(block.locator('astro-island')).not.toHaveAttribute('ssr', /.*/, { timeout: 10_000 });
    const all = block.getByRole('button', { name: 'Усі' });
    const batteries = block.getByRole('button', { name: 'Батареї' });
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await expect(batteries).toHaveAttribute('aria-pressed', 'false');

    const filters = await block.locator('.hits__filters button').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.hitsFilter!));
    expect(filters.length).toBeGreaterThanOrEqual(2);
    for (const f of filters) {
      const s = await probe(block, f);
      // Вогник: 6 × 6 px, коло, колір акценту; фон самої кнопки прозорий у всіх (інверсії нема).
      expect(s.dotWidth).toBe('6px');
      expect(s.dotHeight).toBe('6px');
      expect(s.dotRadius).toBe('50%');
      expect(s.dotBackground).toBe(s.accent);
      expect(s.background).toBe('rgba(0, 0, 0, 0)');
    }

    expectLit(await probe(block, 'all'));
    expectDim(await probe(block, '3'));

    await batteries.click();
    await expect(batteries).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(async () => (await probe(block, '3')).dotOpacity).toBe('1');
    expectLit(await probe(block, '3'));
    await expect.poll(async () => Number((await probe(block, 'all')).dotOpacity)).toBeCloseTo(0.3, 2);
    expectDim(await probe(block, 'all'));
    expect((await probe(block, '3')).background).toBe('rgba(0, 0, 0, 0)');
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

test.describe('SPEC-006/AC-35 доба по колу в першому екрані (D-059)', () => {
  test('три шари неба крутяться 48 с по колу; у фазі «день» контраст тексту героя не падає', async ({ page }) => {
    await page.goto('/');
    const layers = page.locator('[data-hero-sky]');
    await expect(layers).toHaveCount(3);
    const anims = await layers.evaluateAll((els) => els.map((el) => { const cs = getComputedStyle(el); return [cs.animationName, cs.animationDuration, cs.animationIterationCount]; }));
    expect(anims).toEqual([['sky-predawn', '48s', 'infinite'], ['sky-dawn', '48s', 'infinite'], ['sky-day', '48s', 'infinite']]);
    // Перемотуємо добу в «день» (60 % циклу) і дивимось: шар дня видимий, текст героя лишається на ночі.
    const dayOpacity = await layers.nth(2).evaluate((el) => { for (const a of el.getAnimations()) a.currentTime = 48000 * 0.6; return getComputedStyle(el).opacity; });
    expect(parseFloat(dayOpacity)).toBeGreaterThan(0.9);
    const under = await page.locator('.hero__subtitle').evaluate((el) => { const r = el.getBoundingClientRect(); const probe = document.elementFromPoint(r.left + 4, r.top + 4); return probe?.closest('.hero__text') ? 'text' : probe?.className; });
    expect(under).toBe('text');
  });
});

test.describe('SPEC-006/AC-37 галереї «Обʼєкти» на Carousel (D-061)', () => {
  test('стрілка показує другий кадр, точки відмічають поточний; до гортання видно лише перший', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('[data-home-block="cases"] [data-case="parking"]');
    await card.scrollIntoViewIfNeeded();
    const gallery = card.locator('[data-case-gallery]');
    await expect(gallery).toBeVisible({ timeout: 5000 });
    const dots = gallery.getByRole('tab');
    await expect(dots.first()).toHaveAttribute('aria-selected', 'true');
    const first = card.locator('picture[data-photo="case-parking-1"]');
    const second = card.locator('picture[data-photo="case-parking-2"]');
    const box = (await card.locator('.case__photo').boundingBox())!;
    const b1 = (await first.boundingBox())!;
    expect(b1.x).toBeGreaterThanOrEqual(box.x - 1);
    expect(b1.x + b1.width).toBeLessThanOrEqual(box.x + box.width + 1);
    await gallery.getByRole('button', { name: /Наступний кадр/ }).click();
    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true', { timeout: 3000 });
    await expect.poll(async () => (await second.boundingBox())!.x, { timeout: 3000 }).toBeLessThan(box.x + box.width);
    await expect.poll(async () => (await second.boundingBox())!.x + (await second.boundingBox())!.width).toBeGreaterThan(box.x);
  });
});

test.describe('SPEC-006/AC-38 акт IV: карусель хітів і стики', () => {
  test('1440: ≥ 3 картки в рамці, стрілка гортає, точки відмічають; стики — градієнт; Carport ≤ 720 px', async ({ page }, info) => {
    await page.goto('/');
    const block = page.locator('[data-home-block="hits"]');
    await block.scrollIntoViewIfNeeded();
    const nav = block.locator('.hits__nav');
    await expect(nav).toBeVisible({ timeout: 5000 });
    const seams = await page.evaluate(() => ['[data-seam="dawn"]', '[data-seam="dusk"]'].map((s) => getComputedStyle(document.querySelector(s)!, '::before').backgroundImage));
    for (const bg of seams) expect(bg).toContain('linear-gradient');
    if (isMobile(info)) return;
    const track = (await block.locator('.hits__track').boundingBox())!;
    const inFrame = async () => {
      const boxes = await block.locator('.hits__item').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
      return boxes.filter((b) => b.left >= track.x - 1 && b.right <= track.x + track.width + 1).length;
    };
    expect(await inFrame()).toBeGreaterThanOrEqual(3);
    const dots = nav.getByRole('tab');
    await expect(dots.first()).toHaveAttribute('aria-selected', 'true');
    await nav.getByRole('button', { name: 'Наступні товари' }).click();
    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true', { timeout: 3000 });
    await expect.poll(async () => (await block.locator('.hits__item').first().boundingBox())!.x, { timeout: 3000 }).toBeLessThan(track.x);
    const carport = (await page.locator('[data-home-block="carport"]').boundingBox())!;
    expect(carport.height).toBeLessThanOrEqual(720);
  });
});

test.describe('SPEC-006/AC-39 акт V: кроки-лінія, акордеон, форма праворуч', () => {
  test('кроки вмикаються з прокруткою; FAQ відкривається кліком; на 1440 форма праворуч від довіри, на 375 — під нею', async ({ page }, info) => {
    await page.goto('/');
    const section = page.locator('#zayavka');
    const steps = section.locator('[data-step]');
    await expect(steps).toHaveCount(5);
    await expect(steps.last()).not.toHaveAttribute('data-lit', '');
    const sb = (await section.boundingBox())!;
    const top = sb.y + (await page.evaluate(() => window.scrollY));
    for (let y = top - 400; y < top + sb.height; y += 150) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(60);
    }
    await expect(steps.last()).toHaveAttribute('data-lit', '', { timeout: 3000 });
    const fills = await section.locator('[data-step-fill]').evaluateAll((els) => els.map((e) => (e as HTMLElement).style.transform));
    for (const f of fills) expect(f).toBe('scaleY(1)');
    const first = section.locator('[data-faq] details').first();
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
    await expect(first.locator('p')).toBeVisible();
    const trust = (await section.locator('[data-home-block="steps"]').boundingBox())!;
    const form = (await section.locator('[data-home-block="final"]').boundingBox())!;
    if (isMobile(info)) expect(form.y).toBeGreaterThan(trust.y + trust.height - 1);
    else expect(form.x).toBeGreaterThan(trust.x + trust.width - 1);
  });
});
