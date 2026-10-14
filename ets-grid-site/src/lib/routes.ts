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
} as const;
