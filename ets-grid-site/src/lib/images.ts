// Фото товару: лише якщо файл справді є в public/ (SPEC-002 §3.5, Q-6).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Product } from './schema';

const PUBLIC = join(process.cwd(), 'public');

export function productImage(p: Product): { src: string; alt: string } | null {
  const image = p.images[0];
  if (!image) return null;
  const rel = image.src.replace(/^\/+/, '');
  return existsSync(join(PUBLIC, rel)) ? { src: `/${rel}`, alt: image.alt } : null;
}
