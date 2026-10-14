import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import levelContent from '../../src/data/level-content.json';
import homeJson from '../../src/data/home-content.json';
import { routes } from '../../src/lib/routes';
import { NOINDEX_PATHS } from '../../src/lib/seo';
import { DIST, page, pages } from '../helpers/dist';

type Doc = Document;
const meta = (doc: Doc, sel: string) => doc.querySelector(sel)?.getAttribute('content') ?? null;
const robots = (doc: Doc) => meta(doc, 'meta[name="robots"]') ?? '';
const indexable = () => pages().filter((p) => !robots(p.document).startsWith('noindex'));
const schemas = (doc: Doc) =>
  [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent!) as Record<string, unknown>);
const ofType = (doc: Doc, type: string) => schemas(doc).filter((s) => s['@type'] === type);

const SERVICE = [...NOINDEX_PATHS, '/404.html'];

describe('SPEC-008/AC-01 title і description', () => {
  test.each(indexable().map((p) => [p.url, p] as const))('%s', (_url, p) => {
    const title = p.document.querySelector('title')!.textContent!;
    const description = meta(p.document, 'meta[name="description"]')!;
    expect(title.length, title).toBeLessThanOrEqual(60);
    expect(description.length, description).toBeGreaterThanOrEqual(120);
    expect(description.length, description).toBeLessThanOrEqual(160);
    expect(title).toContain('ETS GRID');
  });

  test('усі title і description унікальні', () => {
    const list = indexable();
    const titles = list.map((p) => p.document.querySelector('title')!.textContent);
    const descriptions = list.map((p) => meta(p.document, 'meta[name="description"]'));
    expect(titles.filter((t, i) => titles.indexOf(t) !== i)).toEqual([]);
    expect(descriptions.filter((d, i) => descriptions.indexOf(d) !== i)).toEqual([]);
  });

  test('шаблони: рівень, лістинг, товар', () => {
    expect(page('/zaryadni-stantsii/').document.title).toBe('Зарядні станції під ключ — ціни, монтаж · ETS GRID');
    expect(page('/zaryadni-stantsii/dlya-domu/').document.title).toBe('Для дому: зарядні станції — ціни · ETS GRID');
    expect(page('/product/ets-home-7/').document.title).toBe('ETS Home 7 — ціна 24 900 ₴ · ETS GRID');
    const home = homeJson.hero.variants.find((v) => v.id === homeJson.hero.active)!;
    expect(page('/').document.title).toBe(`${home.h1} — ETS GRID`);
  });
});

describe('SPEC-008/AC-02 службові сторінки', () => {
  const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');

  test.each(SERVICE)('%s: noindex, follow і немає в sitemap', (url) => {
    expect(robots(page(url).document)).toBe('noindex, follow');
    expect(sitemap).not.toContain(`<loc>https://ets-grid.test${url}</loc>`);
  });

  test('noindex — рівно на службових сторінках', () => {
    const closed = pages()
      .filter((p) => robots(p.document).startsWith('noindex'))
      .map((p) => p.url)
      .sort();
    expect(closed).toEqual([...SERVICE].sort());
  });

  test('усі індексовані сторінки є в sitemap', () => {
    for (const p of indexable()) expect(sitemap, p.url).toContain(`<loc>https://ets-grid.test${p.url}</loc>`);
  });
});

describe('SPEC-008/AC-03 JSON-LD без плейсхолдерів', () => {
  test.each(pages().map((p) => [p.url, p] as const))('%s', (_url, p) => {
    const raw = [...p.document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent!).join('\n');
    const list = schemas(p.document);
    expect(list.every((s) => s['@context'] === 'https://schema.org')).toBe(true);
    expect(ofType(p.document, 'Organization')).toHaveLength(1);
    expect(raw).not.toMatch(/\[[^\]"]+\]/);
    expect(raw).not.toContain('AggregateRating');
    if (p.url !== '/' && p.document.querySelector('nav[aria-label] ol, .breadcrumbs')) {
      expect(ofType(p.document, 'BreadcrumbList')).toHaveLength(1);
    }
  });

  test('Organization: контакти-плейсхолдери не виводяться', () => {
    const org = ofType(page('/').document, 'Organization')[0];
    expect(org).toMatchObject({ name: 'ETS GRID', url: 'https://ets-grid.test/', areaServed: 'UA' });
    expect(org).not.toHaveProperty('telephone');
    expect(org).not.toHaveProperty('email');
  });

  test('BreadcrumbList товару: 4 ланки з абсолютними адресами', () => {
    const list = ofType(page('/product/ets-home-7/').document, 'BreadcrumbList')[0].itemListElement as { name: string; item: string }[];
    expect(list.map((i) => i.name)).toEqual(['Головна', 'Зарядні станції', 'Для дому', 'ETS Home 7']);
    expect(list.at(-1)!.item).toBe('https://ets-grid.test/product/ets-home-7/');
  });

  test('LocalBusiness на контактах, ItemList на лістингу, Article у гіді', () => {
    expect(ofType(page('/kontakty/').document, 'LocalBusiness')).toHaveLength(1);
    const items = ofType(page('/zaryadni-stantsii/dlya-domu/').document, 'ItemList')[0].itemListElement as { url: string }[];
    const cards = [...page('/zaryadni-stantsii/dlya-domu/').document.querySelectorAll('[data-product-card]')].map((c) => c.getAttribute('data-slug'));
    expect(items.map((i) => i.url)).toEqual(cards.map((s) => `https://ets-grid.test${routes.product(s!)}`));
    expect(ofType(page(routes.guideArticle('yak-obraty-zaryadnu-stantsiyu')).document, 'Article')).toHaveLength(1);
  });
});

describe('SPEC-008/AC-04 Product і Offer', () => {
  test.each(catalog.products.map((p) => [p.slug, p] as const))('%s', (slug, p) => {
    const [product] = ofType(page(routes.product(slug)).document, 'Product');
    const offer = product.offers as Record<string, unknown>;
    expect(product.name).toBe(p.name);
    expect(offer.priceCurrency).toBe('UAH');
    expect(offer.availability).toBe(p.stock === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder');
    if (p.price_equipment !== null) expect(offer.price).toBe(p.price_equipment);
    else expect(offer).not.toHaveProperty('price');
    if (p.price_equipment === null && p.price_turnkey_from !== null) {
      expect(offer.priceSpecification).toMatchObject({ minPrice: p.price_turnkey_from, priceCurrency: 'UAH' });
    }
    if (/^\[.+\]$/.test(p.brand)) expect(product).not.toHaveProperty('brand');
    expect(meta(page(routes.product(slug)).document, 'meta[property="og:type"]')).toBe('product');
  });
});

describe('SPEC-008/AC-05 FAQPage = FAQ у HTML', () => {
  const faqCases: [string, { q: string; a: string }[]][] = [
    ['/', homeJson.faq],
    ['/zaryadni-stantsii/', levelContent.charging.faq],
    ['/sonyachni-paneli/', levelContent.solar.faq],
    ['/batarei/', levelContent.battery.faq],
    ['/product/ets-home-7/', levelContent.charging.faq],
  ];

  test.each(faqCases)('%s', (url, faq) => {
    const doc = page(url).document;
    const [ld] = ofType(doc, 'FAQPage');
    const entities = ld.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(entities.map((e) => [e.name, e.acceptedAnswer.text])).toEqual(faq.map((f) => [f.q, f.a]));
    const html = [...doc.querySelectorAll('details')].map((d) => d.textContent!.replace(/\s+/g, ' ').trim()).join(' | ');
    for (const f of faq) {
      expect(html).toContain(f.q);
      expect(html).toContain(f.a);
    }
  });
});

describe('SPEC-008/AC-06 robots, sitemap, hreflang, Open Graph', () => {
  test('robots.txt: службові адреси закриті, є sitemap', () => {
    const robotsTxt = readFileSync(join(DIST, 'robots.txt'), 'utf8');
    for (const p of NOINDEX_PATHS) expect(robotsTxt).toContain(`Disallow: ${p}`);
    expect(robotsTxt).toContain('Sitemap: https://ets-grid.test/sitemap-index.xml');
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true);
  });

  test('список службових сторінок у astro.config.mjs збігається з seo.ts', () => {
    const config = readFileSync(join(DIST, '..', 'astro.config.mjs'), 'utf8');
    for (const p of NOINDEX_PATHS) expect(config).toContain(`'${p}'`);
  });

  test.each(indexable().map((p) => [p.url, p] as const))('%s: hreflang uk і x-default, Open Graph', (_url, p) => {
    const doc = p.document;
    const canonical = doc.querySelector('link[rel="canonical"]')!.getAttribute('href');
    expect(doc.querySelector('link[rel="alternate"][hreflang="uk"]')?.getAttribute('href')).toBe(canonical);
    expect(doc.querySelector('link[rel="alternate"][hreflang="x-default"]')?.getAttribute('href')).toBe(canonical);
    expect(meta(doc, 'meta[property="og:title"]')).toBe(doc.querySelector('title')!.textContent);
    expect(meta(doc, 'meta[property="og:description"]')).toBe(meta(doc, 'meta[name="description"]'));
    expect(meta(doc, 'meta[property="og:url"]')).toBe(canonical);
    expect(meta(doc, 'meta[property="og:locale"]')).toBe('uk_UA');
    const image = meta(doc, 'meta[property="og:image"]');
    if (image) expect(existsSync(join(DIST, new URL(image).pathname))).toBe(true);
  });
});
