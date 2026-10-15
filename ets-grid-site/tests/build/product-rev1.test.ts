// SPEC-003 ревізія 1 (D-071): товар у мові вітрини — галерея з набору кадрів (AC-14), три смуги (AC-16).
import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import { PHOTOS, productFrames } from '../../src/lib/photos';
import { routes } from '../../src/lib/routes';
import { page } from '../helpers/dist';

const slugs = catalog.products.map((p) => p.slug);

describe('SPEC-003/AC-14 галерея товару = набір кадрів картки', () => {
  test.each(slugs.filter((s) => productFrames(s).length).map((s) => [s]))('%s', (slug) => {
    const gallery = page(routes.product(slug)).document.querySelector('[data-product-block="gallery"]')!;
    const island = gallery.querySelector('astro-island')!;
    expect(island.getAttribute('component-url')).toContain('ProductGallery');
    expect(island.getAttribute('client')).toBe('intent');
    const frames = [...gallery.querySelectorAll('.gallery__frame')];
    const keys = productFrames(slug);
    expect(frames.map((f) => f.querySelector('picture')?.getAttribute('data-photo'))).toEqual(keys);
    // Головний кадр — LCP: eager і високий пріоритет; решта — lazy.
    const first = frames[0].querySelector('img')!;
    expect(first.getAttribute('fetchpriority')).toBe('high');
    expect(first.getAttribute('loading')).toBe('eager');
    for (const f of frames.slice(1)) expect(f.querySelector('img')!.getAttribute('loading')).toBe('lazy');
    for (const f of frames) expect(f.querySelector('.photo-note')?.textContent?.trim()).toBe('Ілюстративне фото');
    // Мініатюри — у серверному HTML, по одній на кадр.
    expect(gallery.querySelectorAll('.pgallery__thumb')).toHaveLength(keys.length);
    expect(gallery.querySelectorAll('.pgallery__thumb picture')).toHaveLength(keys.length);
    // Пунктирних «[ФОТО N]» немає, поки є ілюстрації.
    expect(gallery.querySelectorAll('[data-gallery-placeholder]')).toHaveLength(0);
    expect(gallery.textContent).not.toMatch(/\[ФОТО \d\]/);
    expect(PHOTOS[keys[0]].alt).toBeTruthy();
  });

  test('товари без ілюстрацій лишають видимі рамки [ФОТО N] (D-031)', () => {
    const without = slugs.filter((s) => !productFrames(s).length);
    for (const slug of without) {
      const gallery = page(routes.product(slug)).document.querySelector('[data-product-block="gallery"]')!;
      expect(gallery.querySelectorAll('[data-gallery-placeholder]').length, slug).toBeGreaterThan(0);
    }
  });
});

describe('SPEC-003/AC-16 три смуги після порогу', () => {
  test.each(slugs.map((s) => [s]))('%s', (slug) => {
    const doc = page(routes.product(slug)).document;
    // Смуга 1: «Головне» і повна таблиця — у лівій колонці поруч із блоком покупки.
    const main = doc.querySelector('.ptop__main')!;
    expect(main.querySelector('[data-product-block="chars"]')).toBeTruthy();
    expect(main.querySelector('[data-product-part="spec-table"] table')).toBeTruthy();
    // Смуга 2: акордеон <details>, відкритий лише перший пункт — працює без JS.
    const acc = [...doc.querySelectorAll('[data-product-accordion] > details')];
    expect(acc.map((d) => d.getAttribute('data-product-block') ?? d.getAttribute('data-product-part'))).toEqual(
      doc.querySelector('[data-product-part="compat"]') ? ['fit', 'compat', 'install', 'delivery'] : ['fit', 'install', 'delivery'],
    );
    expect(acc.map((d) => d.hasAttribute('open'))).toEqual(acc.map((_, i) => i === 0));
    // Смуга 3: вітрина «Разом працює краще» на Carousel (або плашка) і «Ще про товар».
    const cross = doc.querySelector('[data-product-block="cross"]')!;
    const shelf = cross.querySelector('astro-island');
    if (shelf) expect(shelf.getAttribute('component-url')).toContain('HitsCarousel');
    else expect(cross.querySelector('.plate')).toBeTruthy();
    const more = doc.querySelector('.pmore')!;
    for (const part of ['[data-product-part="accessories"]', '[data-product-block="docs"]', '[data-product-block="reviews"]']) {
      expect(more.querySelector(part), part).toBeTruthy();
    }
    // Нічна лише поріг (крихти): секції товару — на дні.
    expect(doc.querySelectorAll('main [data-surface="night"]')).toHaveLength(0);
  });
});
