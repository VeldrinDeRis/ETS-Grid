// Недавно переглянуті. Власник — SPEC-005; SPEC-003 створює push() і list() за контрактом SPEC-005 §3.1.
import { KEYS, read, write } from './storage';

export const RECENT_LIMIT = 8;

function all(): string[] {
  const value = read<unknown>(KEYS.recent, []);
  return Array.isArray(value) ? value.filter((s): s is string => typeof s === 'string') : [];
}

/** Додає slug на початок, без дублів, не більше 8. */
export function push(slug: string): void {
  write(KEYS.recent, [slug, ...all().filter((s) => s !== slug)].slice(0, RECENT_LIMIT));
}

export function list(n: number = RECENT_LIMIT, exclude?: string): string[] {
  return all()
    .filter((s) => s !== exclude)
    .slice(0, n);
}
