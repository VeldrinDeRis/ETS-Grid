// SEO і розмітка (SPEC-008): шаблони title/description, JSON-LD, службові сторінки.
// Правило D-031/D-005: у JSON-LD немає плейсхолдерів — невідомі поля просто не виводяться.
import { isPlaceholder, type Product } from './schema';
import { routes } from './routes';

export const SITE_NAME = 'ETS GRID';
export const TITLE_MAX = 60;
export const DESC_MIN = 120;
export const DESC_MAX = 160;

/** Службові сторінки: noindex, follow; не потрапляють у sitemap (SPEC-008 §3.3). */
export const NOINDEX_PATHS = [routes.cart, routes.checkout, routes.thanks, routes.compare, routes.search] as const;

export const isNoindexPath = (pathname: string) => NOINDEX_PATHS.some((p) => pathname === p) || pathname.startsWith('/404');

/** Обрізка за межею слова, щоб довжина ≤ max (з «…», якщо різали). */
export function cutAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  // Слово закінчилося рівно на межі — нічого не відрізаємо.
  if (clean[max - 1] === ' ') return `${slice.replace(/[s,.:;—–-]+$/, '')}…`;
  const space = slice.lastIndexOf(' ');
  return `${(space > max * 0.5 ? slice.slice(0, space) : slice).replace(/[\s,.:;—–-]+$/, '')}…`;
}

/** title ≤ 60: «{основа} · ETS GRID»; основа ріжеться за словом. На головній суфікс « — ETS GRID». */
export function fitTitle(base: string, home = false): string {
  const suffix = home ? ` — ${SITE_NAME}` : ` · ${SITE_NAME}`;
  if (base.includes(SITE_NAME)) return cutAtWord(base, TITLE_MAX);
  return `${cutAtWord(base, TITLE_MAX - suffix.length)}${suffix}`;
}

/** Доповнення короткого опису: загальні факти з ТЗ §1, без цифр (D-005). */
const DESC_TAILS = [
  ' Київ і вся Україна.',
  ' Консультація інженера і перевірка вводу.',
  ' Гарантія і сервіс від ETS GRID.',
  ' Ціни з монтажем, доставка по Україні.',
];

/** description 120–160: короткий доповнюється, довгий ріжеться за словом. */
export function fitDescription(text: string): string {
  let out = text.replace(/\s+/g, ' ').trim();
  if (out && !/[.!?…]$/.test(out)) out += '.';
  for (const tail of DESC_TAILS) {
    if (out.length >= DESC_MIN) break;
    if (!out.includes(tail.trim())) out += tail;
  }
  return out.length > DESC_MAX ? cutAtWord(out, DESC_MAX) : out;
}

/* ---------- шаблони за типом сторінки (§3.1) ---------- */

/** «Сонячні панелі та СЕС» → «сонячні панелі та СЕС»: абревіатури лишаються. */
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const fits = (base: string) => base.length <= TITLE_MAX - ` · ${SITE_NAME}`.length;

export const seoTitle = {
  level: (name: string) => `${name} під ключ — ціни, монтаж`,
  /** Повний шаблон, а якщо задовгий — без рівня, щоб не різати на півслові. */
  listing: (category: string, level: string) => {
    const full = `${category}: ${lowerFirst(level)} — ціни`;
    return fits(full) ? full : `${category} — ціни`;
  },
  product: (name: string, price: string | null) => (price ? `${name} — ціна ${price}` : name),
};

/* ---------- JSON-LD (§3.2) ---------- */

type Json = Record<string, unknown>;
const ctx = { '@context': 'https://schema.org' };
const abs = (site: URL | string, path: string) => new URL(path, site).href;
const known = (v: string | null | undefined): v is string => typeof v === 'string' && v.trim() !== '' && !isPlaceholder(v);

export interface Contacts {
  phone: string;
  email: string;
  address: string;
}

export function organization(site: URL | string, c: Contacts): Json {
  return {
    ...ctx,
    '@type': 'Organization',
    name: SITE_NAME,
    url: abs(site, routes.home),
    areaServed: 'UA',
    ...(known(c.phone) ? { telephone: c.phone } : {}),
    ...(known(c.email) ? { email: c.email } : {}),
  };
}

export function localBusiness(site: URL | string, c: Contacts): Json {
  return {
    ...organization(site, c),
    '@type': 'LocalBusiness',
    ...(known(c.address) ? { address: c.address } : {}),
  };
}

export function breadcrumbList(site: URL | string, trail: { label: string; href?: string }[], currentPath: string): Json {
  return {
    ...ctx,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: abs(site, c.href ?? currentPath),
    })),
  };
}

const AVAILABILITY: Record<Product['stock'], string> = {
  in_stock: 'https://schema.org/InStock',
  preorder: 'https://schema.org/PreOrder',
};

export function productLd(site: URL | string, p: Product, image: string | null): Json {
  const offer: Json = {
    '@type': 'Offer',
    url: abs(site, routes.product(p.slug)),
    priceCurrency: 'UAH',
    availability: AVAILABILITY[p.stock],
  };
  if (p.price_equipment !== null) offer.price = p.price_equipment;
  else if (p.price_turnkey_from !== null) {
    offer.priceSpecification = { '@type': 'PriceSpecification', minPrice: p.price_turnkey_from, priceCurrency: 'UAH' };
  }
  return {
    ...ctx,
    '@type': 'Product',
    name: p.name,
    url: abs(site, routes.product(p.slug)),
    ...(known(p.brand) ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    ...(image ? { image: abs(site, image) } : {}),
    offers: offer,
  };
}

export function faqPage(items: { q: string; a: string }[]): Json | null {
  if (items.length === 0) return null;
  return {
    ...ctx,
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}

export function itemList(site: URL | string, products: { slug: string; name: string }[]): Json {
  return {
    ...ctx,
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(site, routes.product(p.slug)), name: p.name })),
  };
}

export function article(site: URL | string, headline: string, path: string, description: string): Json {
  return { ...ctx, '@type': 'Article', headline, description, url: abs(site, path), publisher: { '@type': 'Organization', name: SITE_NAME } };
}

/** Видаляє null із масиву розмітки. */
export const ld = (...items: (Json | null | undefined)[]): Json[] => items.filter((x): x is Json => Boolean(x));
