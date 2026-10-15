// SPEC-002 ревізія 6 (D-065): міні-галереї карток у HTML (AC-42) і вага з островом Carousel.
import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import { productImage } from '../../src/lib/images';
import type { Product } from '../../src/lib/schema';
import { page } from '../helpers/dist';

const LISTINGS = ['/batarei/', '/zaryadni-stantsii/dlya-domu/', '/zaryadni-stantsii/', '/sonyachni-paneli/paneli/', '/solar-carport/pryvatnyi/'];
const products = catalog.products.map((p) => ({ docs: [], related: [], ...p })) as unknown as Product[];
const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;

describe('SPEC-002/AC-42 міні-галерея картки в HTML', () => {
  for (const url of LISTINGS) {
    test(url, () => {
      const cards = [...page(url).document.querySelectorAll('.cf-results [data-product-card]')];
      expect(cards.length).toBeGreaterThan(0);
      for (const card of cards) {
        const slug = card.getAttribute('data-slug')!;
        if (productImage(bySlug(slug))) continue; // фото замовника — без ілюстративної галереї
        const frames = card.querySelectorAll('.product-card__frame');
        expect(frames.length, `${url} ${slug}`).toBe(5);
        for (const f of frames) {
          expect(f.querySelector('picture source[type="image/avif"]'), `${slug}: avif`).not.toBeNull();
          const img = f.querySelector('img')!;
          expect(img.getAttribute('alt')?.trim().length, `${slug}: alt`).toBeGreaterThan(0);
          expect(img.getAttribute('width'), `${slug}: width`).toBeTruthy();
          expect(img.getAttribute('height'), `${slug}: height`).toBeTruthy();
          expect(f.querySelector('.photo-note')?.textContent, `${slug}: мітка`).toBe('Ілюстративне фото');
        }
        const island = card.querySelector('astro-island');
        expect(island?.getAttribute('component-url'), `${slug}: острів`).toContain('CardGallery');
        // Бейдж — поверх галереї, не всередині кадру.
        const badge = card.querySelector('.product-card__badge');
        if (badge) expect(badge.closest('.product-card__frame')).toBeNull();
      }
    });
  }

  test('compact-картки і хіти на головній — один кадр, без острова галереї', () => {
    for (const url of ['/', '/sonyachni-paneli/kriplennya/', '/product/ets-home-7/']) {
      const doc = page(url).document;
      expect(doc.querySelectorAll('astro-island[component-url*="CardGallery"]').length, url).toBe(0);
      for (const card of doc.querySelectorAll('[data-product-card]')) {
        expect(card.querySelectorAll('.product-card__frame').length, `${url} ${card.getAttribute('data-slug')}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
