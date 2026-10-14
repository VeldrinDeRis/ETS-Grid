import { describe, expect, test } from 'vitest';
import { cutAtWord, faqPage, fitDescription, fitTitle, isNoindexPath, productLd, seoTitle } from '../../src/lib/seo';
import { products } from '../fixtures/catalog';

const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;

describe('SPEC-008/AC-01 шаблони title і description', () => {
  test('cutAtWord ріже за межею слова і ставить «…»', () => {
    expect(cutAtWord('Кріплення та комплектуючі для сонячних панелей', 30)).toBe('Кріплення та комплектуючі для…');
    expect(cutAtWord('Коротко', 30)).toBe('Коротко');
  });

  test('fitTitle: суфікс, межа 60, головна — через тире', () => {
    expect(fitTitle('Послуги')).toBe('Послуги · ETS GRID');
    expect(fitTitle('Зарядні станції для бізнесу', true)).toBe('Зарядні станції для бізнесу — ETS GRID');
    expect(fitTitle('Дуже довга назва сторінки, яка точно не влізе в шістдесят знаків разом із суфіксом').length).toBeLessThanOrEqual(60);
  });

  test('fitDescription: короткий доповнюється до 120, довгий ріжеться до 160', () => {
    const short = fitDescription('Послуги ETS GRID');
    expect(short.length).toBeGreaterThanOrEqual(120);
    expect(short.length).toBeLessThanOrEqual(160);
    expect(short.startsWith('Послуги ETS GRID.')).toBe(true);
    expect(fitDescription('слово '.repeat(60)).length).toBeLessThanOrEqual(160);
  });

  test('лістинг: «Категорія: рівень — ціни», абревіатури зберігаються; задовгий — без рівня', () => {
    expect(seoTitle.listing('Інвертори', 'Сонячні панелі та СЕС')).toBe('Інвертори: сонячні панелі та СЕС — ціни');
    expect(seoTitle.listing('Кріплення та комплектуючі', 'Сонячні панелі та СЕС')).toBe('Кріплення та комплектуючі — ціни');
  });

  test('товар: з ціною і без', () => {
    expect(seoTitle.product('ETS Home 7', '24 900 ₴')).toBe('ETS Home 7 — ціна 24 900 ₴');
    expect(seoTitle.product('ETS BESS 100', null)).toBe('ETS BESS 100');
  });
});

describe('SPEC-008/AC-02 службові адреси', () => {
  test.each(['/koshyk/', '/oformlennya/', '/dyakuyemo/', '/porivnyannya/', '/poshuk/', '/404.html'])('%s — noindex', (p) => {
    expect(isNoindexPath(p)).toBe(true);
  });
  test('каталог індексується', () => {
    expect(isNoindexPath('/zaryadni-stantsii/')).toBe(false);
  });
});

describe('SPEC-008/AC-04 Product і Offer', () => {
  const site = 'https://ets-grid.test';

  test('ціна обладнання → price', () => {
    const ld = productLd(site, bySlug('ets-home-7'), null);
    expect(ld.offers).toMatchObject({ price: 24900, priceCurrency: 'UAH', availability: 'https://schema.org/InStock' });
    expect(ld).not.toHaveProperty('image');
  });

  test('лише «під ключ від» → priceSpecification.minPrice, без price', () => {
    const ld = productLd(site, bySlug('ets-dc-60'), '/img/x.webp');
    expect(ld.offers).not.toHaveProperty('price');
    expect(ld.offers).toMatchObject({ priceSpecification: { minPrice: 780000, priceCurrency: 'UAH' } });
    expect(ld.image).toBe('https://ets-grid.test/img/x.webp');
  });

  test('без цін — Offer без price і priceSpecification', () => {
    const ld = productLd(site, bySlug('ets-bess-100'), null);
    expect(ld.offers).not.toHaveProperty('price');
    expect(ld.offers).not.toHaveProperty('priceSpecification');
  });

  test('бренд-плейсхолдер не виводиться', () => {
    const p = { ...bySlug('ets-home-7'), brand: '[БРЕНД]' };
    expect(productLd(site, p, null)).not.toHaveProperty('brand');
  });

  test('FAQPage: порожній FAQ — розмітки немає', () => {
    expect(faqPage([])).toBeNull();
    expect(faqPage([{ q: 'Питання?', a: 'Відповідь.' }])).toMatchObject({ '@type': 'FAQPage', mainEntity: [{ name: 'Питання?' }] });
  });
});
