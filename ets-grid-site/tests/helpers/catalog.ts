// Обʼєкт сторінки каталогу для Playwright (SPEC-002, ревізія 5: плитки головного фільтра, «Ще N фільтрів»).
import { expect, type Locator, type Page } from '@playwright/test';

export class CatalogPage {
  constructor(readonly page: Page) {}

  async open(url: string) {
    await this.page.goto(url);
    // client:visible: острів оживає, коли каталог потрапляє в поле зору.
    await this.page.locator('.cf').scrollIntoViewIfNeeded();
    // Острів гідратований і прочитав URL, коли на корені зʼявився data-ready.
    await expect(this.page.locator('.cf[data-ready="true"]')).toBeAttached();
  }

  visibleCards(): Locator {
    return this.page.locator('.cf-results [data-product-card]:not([hidden])');
  }

  /** Slug видимих карток у візуальному порядку (CSS order). */
  async orderedSlugs(): Promise<string[]> {
    return this.page.$$eval('.cf-results [data-product-card]:not([hidden])', (els) =>
      els
        .map((el) => ({ slug: (el as HTMLElement).dataset.slug!, order: Number((el as HTMLElement).style.order || 0) }))
        .sort((a, b) => a.order - b.order)
        .map((x) => x.slug),
    );
  }

  /** Плитка головного фільтра (§3.9 А). */
  chip(label: string): Locator {
    return this.page.locator('.cf-primary .cf-tile', { has: this.page.locator('.cf-tile__label', { hasText: new RegExp(`^${label}$`) }) });
  }

  /** Фасет за заголовком — розкритий або всередині «Ще N фільтрів». */
  facet(facetLabel: string, scope = '.cf-sidebar'): Locator {
    return this.page.locator(`${scope} details.cf-facet:not(.cf-more)`, { has: this.page.locator('> summary', { hasText: facetLabel }) });
  }

  option(facetLabel: string, label: string, scope = '.cf-sidebar'): Locator {
    return this.facet(facetLabel, scope).locator('.cf-option', { has: this.page.locator('.cf-option__label', { hasText: new RegExp(`^${label}$`) }) });
  }

  /** Розкриває «Ще N фільтрів» і сам фасет, якщо вони згорнуті (§3.9 Б). */
  async reveal(facetLabel: string, scope = '.cf-sidebar') {
    const facet = this.facet(facetLabel, scope);
    const more = this.page.locator(`${scope} details.cf-more`);
    if ((await more.count()) && (await facet.evaluate((el) => Boolean(el.closest('.cf-more')))) && !(await more.evaluate((el: HTMLDetailsElement) => el.open))) {
      await more.locator('> summary').click();
    }
    if (!(await facet.evaluate((el: HTMLDetailsElement) => el.open))) await facet.locator('> summary').click();
    await expect(facet).toHaveAttribute('open', '');
  }

  /** Число «Знайдено: N» (текст для читача; розряди AnimateNumber — поруч, aria-hidden). */
  total(): Locator {
    return this.page.locator('.cf-total [data-total]');
  }
}
