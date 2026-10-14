// Єдине джерело адрес сайту (SPEC-001 §3.1). Адреси в розмітці вручну не пишемо.

export const routes = {
  home: '/',
  level: (levelSlug: string) => `/${levelSlug}/`,
  category: (levelSlug: string, categorySlug: string) => `/${levelSlug}/${categorySlug}/`,
  product: (slug: string) => `/product/${slug}/`,
  systems: '/systems/',
  system: (slug: string) => `/systems/${slug}/`,
  services: '/posluhy/',
  service: (slug: string) => `/posluhy/${slug}/`,
  document: (slug: string) => `/${slug}/`,
  financing: '/finansuvannya/',
  cases: '/obiekty/',
  cart: '/koshyk/',
  checkout: '/oformlennya/',
  thanks: '/dyakuyemo/',
  compare: '/porivnyannya/',
  search: '/poshuk/',
  about: '/pro-kompaniyu/',
  contacts: '/kontakty/',
  /** Форма розрахунку; остаточну адресу задасть SPEC-009. */
  quote: '/kontakty/#rozrakhunok',
  /** Форма розрахунку з товаром (SPEC-001 ревізія 2): SPEC-009 читає ?product. */
  quoteFor: (slug: string) => `/kontakty/?product=${encodeURIComponent(slug)}#rozrakhunok`,
  /** ЧПУ-сторінка фільтра (SPEC-002 §3.4). */
  preset: (levelSlug: string, categorySlug: string, presetSlug: string) => `/${levelSlug}/${categorySlug}/${presetSlug}/`,
} as const;
