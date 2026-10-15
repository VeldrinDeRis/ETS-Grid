// SPEC-002 ревізія 5 (D-063): плитки головного фільтра, фасети за змістом, плашка без даних (AC-35); острів на React (AC-38).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { page, pages, PROJECT } from '../helpers/dist';
import { isReactRenderer } from '../helpers/islands';

const LISTINGS = ['/batarei/', '/batarei/dlya-domu/', '/zaryadni-stantsii/', '/zaryadni-stantsii/dlya-domu/', '/zaryadni-stantsii/dlya-domu/gbt/', '/sonyachni-paneli/paneli/'];
const text = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

describe('SPEC-002/AC-35 плитки, «Ще N фільтрів», плашка в HTML', () => {
  for (const url of LISTINGS) {
    test(url, () => {
      const doc = page(url).document;
      const tiles = [...doc.querySelectorAll('.cf-primary .cf-tile')];
      expect(tiles.length).toBeGreaterThan(0);
      for (const tile of tiles) {
        expect(tile.getAttribute('data-type-tile'), url).toBeTruthy();
        expect(tile.querySelector('svg.icon[data-icon] path[d]'), `${url}: іконка плитки`).not.toBeNull();
        expect(text(tile.querySelector('.cf-tile__label')?.textContent)).not.toBe('');
      }
      const side = doc.querySelector('.cf-sidebar')!;
      expect(side).not.toBeNull();
      const open = [...side.querySelectorAll(':scope > details.cf-facet:not(.cf-more)')];
      expect(open.length, `${url}: розкритих ≤ 4`).toBeLessThanOrEqual(4);
      for (const d of open) expect(d.hasAttribute('open'), `${url}: ${d.querySelector('summary')?.textContent}`).toBe(true);
      const more = side.querySelector(':scope > details.cf-more');
      if (more) {
        const folded = more.querySelectorAll('.cf-more__body > details.cf-facet');
        expect(more.hasAttribute('open')).toBe(false);
        expect(text(more.querySelector(':scope > summary')?.textContent)).toMatch(new RegExp(`^Ще ${folded.length} фільтр`));
        for (const d of folded) expect(d.hasAttribute('open')).toBe(false);
      }
      const plates = side.querySelectorAll('.cf-missing-plate');
      expect(plates.length).toBeLessThanOrEqual(1);
      if (plates[0]) {
        const keys = plates[0].getAttribute('data-missing-facets')!.split(',');
        expect(plates[0].getAttribute('aria-disabled')).toBe('true');
        expect(plates[0].querySelectorAll('[data-missing-facet]').length).toBe(keys.length);
        expect(text(plates[0].textContent)).toMatch(new RegExp(`^Ще ${keys.length} фільтр`));
      }
      expect(side.querySelectorAll('[data-missing-facet]').length).toBe(plates[0] ? plates[0].getAttribute('data-missing-facets')!.split(',').length : 0);
    });
  }

  test('/batarei/: приклад §3.9 Б — розкриті ємність, напруга, автономія, сценарій; «Ще 4 фільтри»; плашка з 3 фасетів', () => {
    const side = page('/batarei/').document.querySelector('.cf-sidebar')!;
    expect([...side.querySelectorAll(':scope > details.cf-facet:not(.cf-more) > summary')].map((s) => s.id)).toEqual([
      'side-capacity_kwh',
      'side-voltage',
      'side-autonomy_h',
      'side-scenarios',
    ]);
    expect(text(side.querySelector('.cf-more > summary')?.textContent)).toBe('Ще 4 фільтри');
    expect(side.querySelector('.cf-missing-plate')?.getAttribute('data-missing-facets')).toBe('inverters,brand,warranty');
  });
});

describe('SPEC-002/AC-38 острів фільтрів — React у src/islands/react/catalog/', () => {
  test('стара папка src/islands/catalog/ прибрана, нова існує', () => {
    expect(existsSync(join(PROJECT, 'src/islands/catalog'))).toBe(false);
    expect(existsSync(join(PROJECT, 'src/islands/react/catalog/CatalogFilters.tsx'))).toBe(true);
  });

  test('на кожній сторінці каталогу острів CatalogFilters — React', () => {
    const withIsland = pages().filter((p) => p.html.includes('CatalogFilters'));
    expect(withIsland.length).toBeGreaterThanOrEqual(15);
    for (const p of withIsland) {
      const island = [...p.document.querySelectorAll('astro-island')].find((i) => (i.getAttribute('component-url') ?? '').includes('CatalogFilters'))!;
      expect(island, p.url).toBeDefined();
      expect(isReactRenderer(island.getAttribute('renderer-url')), p.url).toBe(true);
    }
  });
});
