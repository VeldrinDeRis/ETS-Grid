// Фото для макета (SPEC-010 §5, D-039). Файли — public/img/photos/{key}-{width}.{avif,webp}, генерує scripts/photos.mjs.
// Чужі фото — лише ілюстрації обладнання; в «Обʼєктах» їх немає ніколи (D-005).

export interface PhotoInfo {
  alt: string;
  widths: number[];
}

export const PHOTOS = {
  'hero-dc-night': { alt: 'Швидкі зарядні станції під деревʼяним навісом уночі, авто на зарядці', widths: [640, 1280] },
  'home-ac-wallbox': { alt: 'Настінна зарядна станція на цегляній стіні будинку', widths: [640, 1280] },
  'roof-solar': { alt: 'Сонячні панелі на скатному даху', widths: [640, 1280, 1920] },
  'bess-container': { alt: 'Накопичувач енергії в білому контейнері з кондиціонером', widths: [640, 1280, 1920] },
  'carport-charging': { alt: 'Навіс із сонячними панелями над паркінгом і зарядна стійка', widths: [640, 1280, 1920] },
  'carport-below': { alt: 'Сонячний навіс над паркінгом, вигляд знизу', widths: [640, 1280, 1920] },
} satisfies Record<string, PhotoInfo>;

export type PhotoKey = keyof typeof PHOTOS;

export const photoSrc = (key: PhotoKey, width: number, format: 'avif' | 'webp') => `/img/photos/${key}-${width}.${format}`;

export const srcset = (key: PhotoKey, format: 'avif' | 'webp') =>
  PHOTOS[key].widths.map((w) => `${photoSrc(key, w, format)} ${w}w`).join(', ');
