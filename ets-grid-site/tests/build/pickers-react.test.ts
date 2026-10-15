// SPEC-004 ревізія 2 (D-045): підбірники — React-острови (AC-21).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { page, pages, PROJECT } from '../helpers/dist';
import { isReactRenderer } from '../helpers/islands';

const PICKERS = ['PowerCheck', 'ChargingPicker', 'SolarPicker', 'BatteryPicker', 'CarportConfigurator'];

describe('SPEC-004/AC-21 підбірники на React', () => {
  test('у src/islands/pickers/ підбірників немає, у src/islands/react/pickers/ — усі 5 і LiveNumber', () => {
    expect(existsSync(join(PROJECT, 'src/islands/pickers'))).toBe(false);
    for (const name of [...PICKERS, 'LiveNumber', 'shared']) expect(existsSync(join(PROJECT, `src/islands/react/pickers/${name}.tsx`)), name).toBe(true);
  });

  test('на кожній сторінці з підбірником острів підбірника — React', () => {
    const withPicker = pages().filter((p) => p.html.includes('data-picker-kind'));
    expect(withPicker.length).toBeGreaterThanOrEqual(5);
    for (const p of withPicker) {
      const islands = [...p.document.querySelectorAll('[data-picker-kind] astro-island')];
      expect(islands.length, p.url).toBeGreaterThan(0);
      for (const island of islands) {
        expect(PICKERS.some((n) => (island.getAttribute('component-url') ?? '').includes(n)), p.url).toBe(true);
        expect(isReactRenderer(island.getAttribute('renderer-url')), p.url).toBe(true);
      }
    }
  });

  test('головна: «Чи вистачить потужності?» і міні-конфігуратор Carport — React', () => {
    const urls = [...page('/').document.querySelectorAll('[data-picker-kind] astro-island')].map((i) => i.getAttribute('component-url') ?? '');
    expect(urls.some((u) => u.includes('PowerCheck'))).toBe(true);
    expect(urls.some((u) => u.includes('CarportConfigurator'))).toBe(true);
  });
});
