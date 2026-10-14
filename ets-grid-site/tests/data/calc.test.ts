import { describe, expect, test } from 'vitest';
import calcJson from '../../src/data/calc.json';
import { calcFileSchema } from '../../src/lib/calc';

describe('SPEC-004/AC-08 calc.json', () => {
  test('проходить схему', () => {
    const r = calcFileSchema.safeParse(calcJson);
    expect(r.success, r.success ? '' : JSON.stringify(r.error.issues, null, 2)).toBe(true);
  });

  test('у кожного коефіцієнта є джерело', () => {
    const missing: string[] = [];
    for (const [group, values] of Object.entries(calcJson)) {
      if (group.startsWith('_')) continue;
      for (const [key, coef] of Object.entries(values as Record<string, { source?: string }>)) {
        if (!coef.source || coef.source.trim() === '') missing.push(`${group}.${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('опорні навантаження автономії існують серед споживачів і дають 300 Вт (D-029)', () => {
    const loads = calcJson.battery.loads.value;
    const ids = calcJson.battery.autonomy_reference_loads.value;
    expect(ids.every((id) => loads.some((l) => l.id === id))).toBe(true);
    expect(loads.filter((l) => ids.includes(l.id)).reduce((s, l) => s + l.w, 0)).toBe(300);
  });

  test('тариф не вигаданий: null до відповіді на Q-9', () => {
    expect(calcJson.solar.tariff_uah_per_kwh.value).toBeNull();
  });
});
