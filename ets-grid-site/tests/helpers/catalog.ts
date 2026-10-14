// Обʼєкт сторінки каталогу для Playwright (SPEC-002).
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

  chip(label: string): Locator {
    return this.page.locator('.cf-primary .cf-chip', { has: this.page.locator('.cf-option__label', { hasText: new RegExp(`^${label}$`) }) });
  }

  option(facetLabel: string, label: string, scope = '.cf-sidebar'): Locator {
    return this.page
      .locator(`${scope} details.cf-facet`, { has: this.page.locator('summary', { hasText: facetLabel }) })
      .locator('.cf-option', { has: this.page.locator('.cf-option__label', { hasText: new RegExp(`^${label}$`) }) });
  }

  total(): Locator {
    return this.page.locator('.cf-total strong');
  }
}
