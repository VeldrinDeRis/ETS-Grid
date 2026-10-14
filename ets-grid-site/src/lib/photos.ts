// Фото для макета (SPEC-010 §5, D-039, D-042). Файли — public/img/photos/{key}-{width}.{avif,webp}, генерує scripts/photos.mjs.
// Чужі фото — лише ілюстрації обладнання; в «Обʼєктах» їх немає ніколи (D-005).

export interface PhotoInfo {
  alt: string;
  widths: number[];
  /** Ширина / висота кадру. */
  ratio: number;
}

const HERO = { widths: [640, 1280, 1920], ratio: 4 / 3 };
const PRODUCT = { widths: [480, 960], ratio: 1 };

export const PHOTOS = {
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

export type PhotoKey = keyof typeof PHOTOS;

export const photoSrc = (key: PhotoKey, width: number, format: 'avif' | 'webp') => `/img/photos/${key}-${width}.${format}`;

export const srcset = (key: PhotoKey, format: 'avif' | 'webp') =>
  PHOTOS[key].widths.map((w) => `${photoSrc(key, w, format)} ${w}w`).join(', ');

/**
 * Ілюстрації товарів до фото від замовника (D-042). Лише там, де стоковий кадр не суперечить товару:
 * портативна зарядка й адаптер Type 2 → GB/T — без ілюстрацій (на стоках інший розʼєм).
 */
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
