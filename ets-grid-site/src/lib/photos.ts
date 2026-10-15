// Фото для макета (SPEC-010 §5, D-039, D-042). Файли — public/img/photos/{key}-{width}.{avif,webp}, генерує scripts/photos.mjs.
// Чужі фото — ілюстрації обладнання (D-042) і індикативні галереї «Обʼєктів» з міткою (D-058, D-061); за обʼєкти ETS GRID їх не видаємо (D-005).

import frames from '../data/product-frames.json';

export interface PhotoInfo {
  alt: string;
  widths: number[];
  /** Ширина / висота кадру. */
  ratio: number;
}

const HERO = { widths: [640, 1280, 1920], ratio: 4 / 3 };
const PRODUCT = { widths: [480, 960], ratio: 1 };
// Галереї обʼєктів 16:9 (D-061): індикативні кадри з міткою, по 10 на обʼєкт.
const CASE = { widths: [640, 1280], ratio: 16 / 9 };

const STATIC_PHOTOS = {
  // Паркінг із навісом — серія Kindel Media, Pexels.
  'case-parking-1': { alt: 'Сонячні навіси над паркінгом, вигляд збоку (ілюстрація)', ...CASE },
  'case-parking-2': { alt: 'Паркінг із сонячними навісами з висоти (ілюстрація)', ...CASE },
  'case-parking-3': { alt: 'Ряди сонячних навісів над паркінгом біля дороги (ілюстрація)', ...CASE },
  'case-parking-4': { alt: 'Паркінг із зарядною станцією, вигляд згори (ілюстрація)', ...CASE },
  'case-parking-5': { alt: 'Авто під сонячними навісами (ілюстрація)', ...CASE },
  'case-parking-6': { alt: 'Під сонячним навісом паркінгу (ілюстрація)', ...CASE },
  'case-parking-7': { alt: 'Електромобілі заряджаються під сонячним навісом (ілюстрація)', ...CASE },
  'case-parking-8': { alt: 'Білий електромобіль на зарядці під сонячною панеллю (ілюстрація)', ...CASE },
  'case-parking-9': { alt: 'Зарядна станція на сонячній енергії на паркінгу (ілюстрація)', ...CASE },
  'case-parking-10': { alt: 'Авто на зарядці під сонячним навісом у місті (ілюстрація)', ...CASE },
  // Дім із СЕС і батареєю.
  'case-home-1': { alt: 'Сонячні панелі на дахах таунхаусів (ілюстрація)', ...CASE },
  'case-home-2': { alt: 'Будинок із сонячними панелями на даху (ілюстрація)', ...CASE },
  'case-home-3': { alt: 'Будинки з червоною черепицею і сонячними панелями (ілюстрація)', ...CASE },
  'case-home-4': { alt: 'Сонячні панелі на черепичному даху проти неба (ілюстрація)', ...CASE },
  'case-home-5': { alt: 'Сонячні панелі на даху зблизька (ілюстрація)', ...CASE },
  'case-home-6': { alt: 'Монтажник встановлює панель на даху (ілюстрація)', ...CASE },
  'case-home-7': { alt: 'Монтажник несе сонячну панель на дах (ілюстрація)', ...CASE },
  'case-home-8': { alt: 'Електрик підключає домашню батарею (ілюстрація)', ...CASE },
  'case-home-9': { alt: 'Домашня батарея з інвертором на стіні (ілюстрація)', ...CASE },
  'case-home-10': { alt: 'Електрик прокладає кабелі в домашній системі (ілюстрація)', ...CASE },
  // Бізнес-обʼєкт: дах складу з СЕС, інвертор, швидкі зарядки.
  'case-biz-1': { alt: 'Сонячні панелі на даху складу, вигляд з висоти (ілюстрація)', ...CASE },
  'case-biz-2': { alt: 'Дахи промислових будівель із сонячними панелями (ілюстрація)', ...CASE },
  'case-biz-3': { alt: 'Промислова будівля з СЕС на даху (ілюстрація)', ...CASE },
  'case-biz-4': { alt: 'Індустріальний парк із сонячними дахами (ілюстрація)', ...CASE },
  'case-biz-5': { alt: 'Ряди складів із сонячними панелями (ілюстрація)', ...CASE },
  'case-biz-6': { alt: 'Сонячні панелі на плоскому даху офісної будівлі (ілюстрація)', ...CASE },
  'case-biz-7': { alt: 'Інвертор на фасаді будівлі (ілюстрація)', ...CASE },
  'case-biz-8': { alt: 'Швидка зарядна станція зблизька (ілюстрація)', ...CASE },
  'case-biz-9': { alt: 'Ряд швидких зарядних станцій (ілюстрація)', ...CASE },
  'case-biz-10': { alt: 'Швидкі зарядні станції на відкритому майданчику (ілюстрація)', ...CASE },
  'hero-dc-night': { alt: 'Швидкі зарядні станції під деревʼяним навісом уночі, авто на зарядці', ...HERO, widths: [640, 1280] },
  'home-ac-wallbox': { alt: 'Настінна зарядна станція на цегляній стіні будинку', ...HERO, widths: [640, 1280] },
  'roof-solar': { alt: 'Сонячні панелі на скатному даху', ...HERO },
  'bess-container': { alt: 'Накопичувач енергії в білому контейнері з кондиціонером', ...HERO },
  'carport-charging': { alt: 'Навіс із сонячними панелями над паркінгом і зарядна стійка', ...HERO },
  'carport-below': { alt: 'Сонячний навіс над паркінгом, вигляд знизу', ...HERO },
  // Ілюстрації товарів 1:1 (D-042): схоже обладнання, не сам товар.
  'p-ac-wallbox': { alt: 'Настінна AC-станція на стіні (ілюстрація)', ...PRODUCT },
  'p-ac-duo': { alt: 'Зарядна станція з двома кабелями (ілюстрація)', ...PRODUCT },
  'p-dc-charging': { alt: 'Авто на швидкій зарядці (ілюстрація)', ...PRODUCT },
  'p-panel': { alt: 'Сонячна панель на черепичному даху (ілюстрація)', ...PRODUCT },
  'p-inverter': { alt: 'Інвертор і батареї на стіні технічного приміщення (ілюстрація)', ...PRODUCT },
  'p-solar-kit': { alt: 'Сонячні панелі на даху будинку (ілюстрація)', ...PRODUCT },
  'p-home-battery': { alt: 'Домашня батарея на стіні (ілюстрація)', ...PRODUCT, widths: [480, 960] },
  'p-bess': { alt: 'Контейнерний накопичувач енергії (ілюстрація)', ...PRODUCT },
  'p-carport': { alt: 'Сонячний навіс над машиномісцем із зарядною стійкою (ілюстрація)', ...PRODUCT },
  'p-carport-below': { alt: 'Сонячний навіс над паркінгом (ілюстрація)', ...PRODUCT },
} satisfies Record<string, PhotoInfo>;

/** Кадри міні-галерей карток (SPEC-002 §3.10, D-065): pf-{набір}-{n} — нові кадри Pexels, p-case-* — 1:1-версії кадрів «Обʼєкти». */
export type FrameSet = keyof typeof frames.sets;
export type FrameKey = `pf-${string}` | `p-case-${string}`;
const FRAME_PHOTOS: Record<string, PhotoInfo> = {};
for (const [set, s] of Object.entries(frames.sets)) {
  s.frames.forEach((f, i) => {
    FRAME_PHOTOS[`pf-${set}-${i + 1}`] = { alt: f.alt, ...PRODUCT };
  });
  for (const key of s.reuse) FRAME_PHOTOS[`p-${key}`] = { alt: (STATIC_PHOTOS as Record<string, PhotoInfo>)[key].alt, ...PRODUCT };
}

export const PHOTOS = { ...STATIC_PHOTOS, ...FRAME_PHOTOS } as typeof STATIC_PHOTOS & Record<FrameKey, PhotoInfo>;

export type PhotoKey = keyof typeof STATIC_PHOTOS | FrameKey;

/** Набір → ключі кадрів у порядку конфігу (без першого кадру-ілюстрації товару). */
export const FRAME_SETS = Object.fromEntries(
  Object.entries(frames.sets).map(([set, s]) => [set, [...s.frames.map((_, i) => `pf-${set}-${i + 1}`), ...s.reuse.map((k) => `p-${k}`)]]),
) as Record<FrameSet, PhotoKey[]>;

/** Товар → набір кадрів. */
export const PRODUCT_FRAME_SET = frames.products as Record<string, FrameSet>;

/** Кадри міні-галереї картки: ілюстрація товару першою, далі набір без повтору, рівно 5 (чиста функція, AC-41). */
export function productFrames(slug: string): PhotoKey[] {
  const first = PRODUCT_ILLUSTRATION[slug];
  const set = PRODUCT_FRAME_SET[slug] ? FRAME_SETS[PRODUCT_FRAME_SET[slug]] : [];
  const list = first ? [first, ...set.filter((k) => k !== first)] : [...set];
  return list.slice(0, 5);
}

export const photoSrc = (key: PhotoKey, width: number, format: 'avif' | 'webp') => `/img/photos/${key}-${width}.${format}`;

export const srcset = (key: PhotoKey, format: 'avif' | 'webp') =>
  PHOTOS[key].widths.map((w) => `${photoSrc(key, w, format)} ${w}w`).join(', ');

/**
 * Ілюстрації товарів до фото від замовника (D-042). Лише там, де стоковий кадр не суперечить товару:
 * портативна зарядка й адаптер Type 2 → GB/T — без ілюстрацій (на стоках інший розʼєм).
 */
/** Вогники зарядки на фото героя (D-056): частки кадру `hero-dc-night` (x, y від 0 до 1), індикатори на зарядних стійках.
 *  При заміні фото — задати заново; екранне положення рахує src/scripts/home.ts під object-fit: cover. */
export const HERO_LEDS: { x: number; y: number }[] = [
  { x: 0.3, y: 0.645 },
  { x: 0.42, y: 0.645 },
  { x: 0.675, y: 0.6 },
  { x: 0.875, y: 0.585 },
];

export const PRODUCT_ILLUSTRATION: Record<string, PhotoKey> = {
  'ets-home-7': 'p-ac-wallbox',
  'ets-home-22': 'p-ac-wallbox',
  'ets-home-11-gbt': 'p-ac-wallbox',
  'ets-duo-22-ocpp': 'p-ac-duo',
  'ets-dc-60': 'p-dc-charging',
  'ets-dc-120': 'p-dc-charging',
  'ets-dc-240-split': 'p-dc-charging',
  'ets-dc-120-battery': 'p-dc-charging',
  'panel-550-topcon': 'p-panel',
  'inverter-hybrid-10': 'p-inverter',
  'ets-solar-home-5': 'p-solar-kit',
  'ets-battery-home-10': 'p-home-battery',
  'ets-bess-100': 'p-bess',
  'ets-bess-215': 'p-bess',
  'carport-private-2': 'p-carport',
  'carport-commercial-8': 'p-carport-below',
  'carport-hub-20': 'p-carport-below',
};

export const ILLUSTRATION_LABEL = 'Ілюстративне фото';
