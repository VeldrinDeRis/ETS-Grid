// Порівняння (SPEC-005 §3.1): до 4 товарів, ключ etsgrid:compare:v1, подія etsgrid:compare-change.
import { KEYS, read, write } from './storage';

export const COMPARE_LIMIT = 4;
export const COMPARE_CHANGE_EVENT = 'etsgrid:compare-change';

export function list(): string[] {
  const value = read<unknown>(KEYS.compare, []);
  return Array.isArray(value) ? value.filter((s): s is string => typeof s === 'string') : [];
}

function save(next: string[]): void {
  write(KEYS.compare, next);
  window.dispatchEvent(new Event(COMPARE_CHANGE_EVENT));
}

export function has(slug: string): boolean {
  return list().includes(slug);
}

export type ToggleResult = { ok: true; active: boolean } | { ok: false; active: false; reason: 'limit' };

export function toggle(slug: string): ToggleResult {
  const current = list();
  if (current.includes(slug)) {
    save(current.filter((s) => s !== slug));
    return { ok: true, active: false };
  }
  if (current.length >= COMPARE_LIMIT) return { ok: false, active: false, reason: 'limit' };
  save([...current, slug]);
  return { ok: true, active: true };
}

export function remove(slug: string): void {
  save(list().filter((s) => s !== slug));
}

export function clear(): void {
  save([]);
}
