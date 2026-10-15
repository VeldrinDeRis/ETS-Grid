// SPEC-002 ревізія 6.1 (D-069): галерея за наміром, перший ряд без lazy (AC-47).
import { describe, expect, test } from 'vitest';
import { page } from '../helpers/dist';

const LISTINGS = ['/zaryadni-stantsii/dlya-domu/', '/zaryadni-stantsii/', '/batarei/', '/sonyachni-paneli/paneli/'];

describe('SPEC-002/AC-47 галерея за наміром, перший ряд — eager', () => {
  for (const url of LISTINGS) {
    test(url, () => {
      const doc = page(url).document;
      const islands = [...doc.querySelectorAll('astro-island')].filter((i) => (i.getAttribute('component-url') ?? '').includes('CardGallery'));
      expect(islands.length, url).toBeGreaterThan(0);
      for (const island of islands) {
        expect(island.getAttribute('client'), url).toBe('intent');
        // Навігація в серверному HTML: стрілки й точки на кожен кадр.
        expect(island.querySelectorAll('.pgal__arrow').length, url).toBe(2);
        expect(island.querySelectorAll('.pgal__dot').length, url).toBe(island.querySelectorAll('.product-card__frame').length);
      }
      const cards = [...doc.querySelectorAll('.cf-results [data-product-card]')];
      cards.forEach((card, i) => {
        const first = card.querySelector('.product-card__photo img');
        if (!first) return;
        if (i < 3) {
          expect(first.getAttribute('loading'), `${url} #${i}`).toBe('eager');
          expect(first.getAttribute('fetchpriority'), `${url} #${i}`).toBe('high');
        } else {
          expect(first.getAttribute('loading'), `${url} #${i}`).toBe('lazy');
        }
      });
      // Решта кадрів галерей — lazy.
      for (const img of doc.querySelectorAll('.product-card__frame:not(:first-child) img, .pgal__shot:not(:first-child) img')) expect(img.getAttribute('loading')).toBe('lazy');
    });
  }
});
