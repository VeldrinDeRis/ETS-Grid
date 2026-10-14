import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import catalog from '../../src/data/catalog.json';
import structure from '../../src/data/structure.json';
import { routes } from '../../src/lib/routes';
import { DIST, assertBuilt, page, resolveHref } from '../helpers/dist';

assertBuilt();

const levelSlug = new Map(structure.levels.map((l) => [l.key, l.slug]));

const expected: string[] = [
  routes.home,
  ...structure.levels.map((l) => routes.level(l.slug)),
  ...structure.categories.map((c) => routes.category(levelSlug.get(c.level)!, c.slug)),
  ...catalog.products.map((p) => routes.product(p.slug)),
  routes.systems,
  ...catalog.systems.map((s) => routes.system(s.slug)),
  routes.services,
  ...structure.services.map((s) => routes.service(s.slug)),
  ...structure.documents.map((d) => routes.document(d.slug)),
  routes.financing,
  routes.cases,
  routes.cart,
  routes.checkout,
  routes.thanks,
  routes.compare,
  routes.search,
  routes.about,
  routes.contacts,
  // SPEC-007 §9, ревізія 7 SPEC-001: гід покупця
  routes.guide,
  routes.guideArticle('yak-obraty-zaryadnu-stantsiyu'),
];

describe('SPEC-001/AC-02 усі адреси карти URL зібрані', () => {
  test('кількість: 4 рівні, 15 лістингів, 19 товарів, 4 системи', () => {
    expect(structure.levels).toHaveLength(4);
    expect(structure.categories).toHaveLength(15);
    expect(catalog.products).toHaveLength(19);
    expect(catalog.systems).toHaveLength(4);
  });

  test.each(expected)('%s', (url) => {
    expect(resolveHref(url), `немає ${url}`).not.toBeNull();
  });

  test('404.html', () => {
    expect(existsSync(join(DIST, '404.html'))).toBe(true);
  });

  test('сторінки /obiekty/{slug}/ не створюються до реальних кейсів', () => {
    expect(page(routes.cases).html).toContain('Тут будуть реальні обʼєкти ETS GRID');
  });
});
