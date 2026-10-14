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
  /** Гід покупця (SPEC-007 §3.1, ревізія 7 SPEC-001): у карті 03 адреси немає, ТЗ §6.9 вимагає шаблон статті. */
  guide: '/gid/',
  guideArticle: (slug: string) => `/gid/${slug}/`,
  contacts: '/kontakty/',
  /** Форма розрахунку; остаточну адресу задасть SPEC-009. */
  quote: '/kontakty/#rozrakhunok',
  /** Форма розрахунку з товаром (SPEC-001 ревізія 2): SPEC-009 читає ?product. */
  quoteFor: (slug: string) => `/kontakty/?product=${encodeURIComponent(slug)}#rozrakhunok`,
  /** Форма розрахунку з параметрами підбірника (SPEC-001 ревізія 3, SPEC-004 §3.3). */
  quoteWith: (params: Record<string, string | number | boolean | null | undefined>) => {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== null && v !== undefined && v !== '') query.set(k, String(v));
    return `/kontakty/?${query.toString()}#rozrakhunok`;
  },
  /** ЧПУ-сторінка фільтра (SPEC-002 §3.4). */
  preset: (levelSlug: string, categorySlug: string, presetSlug: string) => `/${levelSlug}/${categorySlug}/${presetSlug}/`,
} as const;
