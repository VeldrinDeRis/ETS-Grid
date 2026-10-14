// Порівняння. Власник модуля — SPEC-005; SPEC-002 створює toggle() і has().
import { KEYS, read, write } from './storage';

export const COMPARE_LIMIT = 4;

function list(): string[] {
  const value = read<unknown>(KEYS.compare, []);
  return Array.isArray(value) ? value.filter((s): s is string => typeof s === 'string') : [];
}

export function has(slug: string): boolean {
  return list().includes(slug);
}

export type ToggleResult = { ok: true; active: boolean } | { ok: false; active: false; reason: 'limit' };

export function toggle(slug: string): ToggleResult {
  const current = list();
  if (current.includes(slug)) {
    write(
      KEYS.compare,
      current.filter((s) => s !== slug),
    );
    return { ok: true, active: false };
  }
  if (current.length >= COMPARE_LIMIT) return { ok: false, active: false, reason: 'limit' };
  write(KEYS.compare, [...current, slug]);
  return { ok: true, active: true };
}
