import { describe, expect, test } from 'vitest';
import {
  autonomyHours,
  batteryHours,
  batteryPicker,
  carportConfig,
  chargingPicker,
  clamp,
  loadWatts,
  powerCheck,
  solarSize,
  type Calc,
} from '../../src/lib/calc';
import { calc as realCalc } from '../../src/lib/calc/config';
import { byLevel, cars, products, slugs } from '../fixtures/catalog';

// Коефіцієнти — як у 03 §3 (фіксуємо в тесті, щоб правка calc.json не ламала формули непомітно).
const calc: Calc = {
  power: { need_options_kw: [7, 11, 22, 60, 120, 160, 240], grid_min_kw: 3, grid_max_kw: 300, ac_max_kw: 22, battery_buffer_h: 0.5, battery_round_kwh: 10 },
  battery: {
    loads: realCalc.battery.loads,
    dod: 0.9,
    inverter_eff: 0.95,
    hours_min: 1,
    hours_max: 48,
    autonomy_reference_loads: ['light_internet', 'fridge'],
  },
  solar: { yield_kwh_per_kwp_year: 1150, panel_w: 550, area_m2_per_panel: 2.6, monthly_kwh_min: 50, monthly_kwh_max: 20000, tariff_uah_per_kwh: null },
  carport: {
    places_min: 2,
    places_max: 100,
    places_step: 2,
    kwp_per_place: 3.3,
    panels_per_place: 6,
    places_per_port: 2,
    storage_kwh_per_place: 5,
    storage_round_kwh: 25,
    co2_t_per_place_year: 2.95,
  },
};

const stations = byLevel(1);
const batteries = byLevel(3);
const kits = byLevel(2).filter((p) => p.type === 'kit');
const carports = byLevel(4);

describe('SPEC-004/AC-01 powerCheck', () => {
  test('60 кВт, ввід 50 → DC-60, дефіцит 15, накопичувач 10 кВт·год, альтернатива DC-120 Battery', () => {
    const r = powerCheck({ needKw: 60, gridKw: 50 }, stations, calc);
    expect(r.station?.slug).toBe('ets-dc-60');
    expect(r.current).toBe('DC');
    expect(r.deficit).toBe(15);
    expect(r.outcome).toBe('dc_deficit');
    expect(r.batteryKwh).toBe(10);
    expect(r.batteryStation?.slug).toBe('ets-dc-120-battery');
  });

  test('60 кВт, ввід 80 → вистачає, запас 15', () => {
    const r = powerCheck({ needKw: 60, gridKw: 80 }, stations, calc);
    expect(r.outcome).toBe('ok');
    expect(r.reserveKw).toBe(15);
  });

  test('120 кВт, ввід 100 → DC-120 (не Battery), дефіцит 30, накопичувач 20', () => {
    const r = powerCheck({ needKw: 120, gridKw: 100 }, stations, calc);
    expect(r.station?.slug).toBe('ets-dc-120');
    expect(r.deficit).toBe(30);
    expect(r.batteryKwh).toBe(20);
    expect(r.batteryStation?.slug).toBe('ets-dc-120-battery');
  });

  test('240 кВт, ввід 300 → Split, запас 45; 160 кВт → теж Split', () => {
    expect(powerCheck({ needKw: 240, gridKw: 300 }, stations, calc)).toMatchObject({ outcome: 'ok', reserveKw: 45 });
    expect(powerCheck({ needKw: 160, gridKw: 300 }, stations, calc).station?.slug).toBe('ets-dc-240-split');
  });

  test('22 кВт, ввід 15 → Home 22 (вхід 22, а не Duo з 44), AC-дефіцит 7, менша AC — 11 кВт', () => {
    const r = powerCheck({ needKw: 22, gridKw: 15 }, stations, calc);
    expect(r.station?.slug).toBe('ets-home-22');
    expect(r.current).toBe('AC');
    expect(r.deficit).toBe(7);
    expect(r.outcome).toBe('ac_deficit');
    expect(r.smallerKw).toBe(11);
  });

  test('7 кВт, ввід 3 → Home 7 (7,4 кВт), дефіцит 4,4, меншої AC немає', () => {
    const r = powerCheck({ needKw: 7, gridKw: 3 }, stations, calc);
    expect(r.station?.slug).toBe('ets-home-7');
    expect(r.deficit).toBeCloseTo(4.4, 5);
    expect(r.outcome).toBe('ac_deficit');
    expect(r.smallerKw).toBeNull();
  });

  test('портативні, адаптери й станції з накопичувачем не є базовим вибором', () => {
    for (const need of calc.power.need_options_kw) {
      const r = powerCheck({ needKw: need, gridKw: 300 }, stations, calc);
      expect(['portable', 'cable', 'dc_battery']).not.toContain(r.station?.type);
    }
  });
});

describe('SPEC-004/AC-02 chargingPicker', () => {
  test('дім · Type 2 · 1 фаза · ввід 8 → Home 7, Portable 7', () => {
    const r = chargingPicker({ where: 'home', connector: 'type2', carId: null, phases: 1, gridKw: 8 }, stations, cars, calc);
    expect(slugs(r.fits)).toEqual(['ets-home-7', 'ets-portable-7']);
  });

  test('траса · CCS2 · 3 фази · ввід 50 → DC-120 Battery; не вистачає DC-60, накопичувач 10', () => {
    const r = chargingPicker({ where: 'highway', connector: 'ccs2', carId: null, phases: 3, gridKw: 50 }, stations, cars, calc);
    expect(slugs(r.fits)).toEqual(['ets-dc-120-battery']);
    expect(r.needsMore?.station.slug).toBe('ets-dc-60');
    expect(r.needsMore?.check.batteryKwh).toBe(10);
  });

  test('авто замість розʼєму: китайська версія → GB/T', () => {
    const r = chargingPicker({ where: 'home', connector: null, carId: 'cn-gbt', phases: 3, gridKw: 22 }, stations, cars, calc);
    expect(slugs(r.fits)).toEqual(['ets-home-11-gbt']);
  });

  test('не більше 3 рекомендацій, адаптери не рекомендуються', () => {
    const r = chargingPicker({ where: 'home', connector: null, carId: null, phases: 3, gridKw: 300 }, stations, cars, calc);
    expect(r.fits.length).toBeLessThanOrEqual(3);
    expect(r.fits.every((p) => p.type !== 'cable')).toBe(true);
  });
});

describe('SPEC-004/AC-03 батареї', () => {
  test('loadWatts: світло+інтернет і холодильник = 300 Вт', () => {
    expect(loadWatts(['light_internet', 'fridge'], calc)).toBe(300);
    expect(loadWatts(['light_internet', 'fridge', 'boiler_pump'], calc)).toBe(550);
  });

  test('batteryHours 300 Вт, 10,24 кВт·год ≈ 29 год', () => {
    expect(Math.round(batteryHours(300, 10.24, calc))).toBe(29);
  });

  test('batteryPicker 550 Вт × 24 год → 15,44 кВт·год, 2 модулі домашньої, ≈ 32 год', () => {
    const r = batteryPicker({ loads: ['light_internet', 'fridge', 'boiler_pump'], hours: 24, hasSolar: false }, batteries, calc);
    expect(r.neededKwh).toBeCloseTo(15.44, 2);
    expect(r.product?.slug).toBe('ets-battery-home-10');
    expect(r.modules).toBe(2);
    expect(r.totalKwh).toBeCloseTo(20.48, 2);
    expect(Math.round(r.hoursWithIt!)).toBe(32);
  });

  test('без навантаження — результату немає', () => {
    const r = batteryPicker({ loads: [], hours: 12, hasSolar: false }, batteries, calc);
    expect(r.loadW).toBe(0);
    expect(r.product).toBeNull();
  });

  test('потреба більша за масштабування домашньої → комерційна батарея', () => {
    const r = batteryPicker({ loads: ['ev'], hours: 10, hasSolar: false }, batteries, calc);
    // 7000 Вт × 10 год / 855 ≈ 81,9 кВт·год > 40 → BESS 100
    expect(r.product?.slug).toBe('ets-bess-100');
    expect(r.modules).toBe(1);
  });
});

describe('SPEC-004/AC-04 solarSize', () => {
  test('400 кВт·год/міс → 4,2 kWp, 8 панелей, 20,8 м², ≈ 154 000 ₴ (демо)', () => {
    const r = solarSize({ monthlyKwh: 400, purpose: 'home', mount: 'roof' }, kits, calc);
    expect(r.kwp).toBe(4.2);
    expect(r.panels).toBe(8);
    expect(r.areaM2).toBeCloseTo(20.8, 5);
    expect(r.priceFrom).toBe(154000);
    expect(r.priceDemo).toBe(true);
  });

  test('без комплектів з ціною — ціни немає', () => {
    expect(solarSize({ monthlyKwh: 400, purpose: 'home', mount: 'roof' }, [], calc).priceFrom).toBeNull();
  });
});

describe('SPEC-004/AC-05 carportConfig', () => {
  test('20 місць, зарядки, накопичувач → 66 kWp, 120 панелей, 10 портів, 100 кВт·год, 59 т', () => {
    expect(carportConfig({ places: 20, chargers: true, storage: true }, carports, calc)).toMatchObject({
      kwp: 66,
      panels: 120,
      evPorts: 10,
      storageKwh: 100,
      co2TYear: 59,
    });
  });

  test('8 місць без зарядок і накопичувача → 26 kWp, 48 панелей, 0, 0, 24 т; найближча конфігурація — на 8 місць', () => {
    const r = carportConfig({ places: 8, chargers: false, storage: false }, carports, calc);
    expect(r).toMatchObject({ kwp: 26, panels: 48, evPorts: 0, storageKwh: 0, co2TYear: 24 });
    expect(r.nearest?.slug).toBe('carport-commercial-8');
  });
});

describe('SPEC-004/AC-06 час автономії', () => {
  test('домашня 10,24 кВт·год ≈ 29 год; BESS — понад 48; не батарея — null', () => {
    expect(Math.round(autonomyHours(products.find((p) => p.slug === 'ets-battery-home-10')!, calc)!)).toBe(29);
    expect(autonomyHours(products.find((p) => p.slug === 'ets-bess-100')!, calc)!).toBeGreaterThan(48);
    expect(autonomyHours(products.find((p) => p.slug === 'ets-home-7')!, calc)).toBeNull();
  });
});

describe('SPEC-004/AC-07 межі', () => {
  test('clamp', () => {
    expect(clamp(1, 3, 300)).toBe(3);
    expect(clamp(400, 3, 300)).toBe(300);
    expect(clamp(Number.NaN, 3, 300)).toBe(3);
  });

  test('крайні значення без NaN', () => {
    const values = [
      ...[3, 300].map((g) => powerCheck({ needKw: 240, gridKw: g }, stations, calc).deficit),
      ...[2, 100].flatMap((n) => Object.values(carportConfig({ places: n, chargers: true, storage: true }, carports, calc)).filter((v) => typeof v === 'number')),
      batteryPicker({ loads: ['light_internet'], hours: 48, hasSolar: true }, batteries, calc).neededKwh,
      solarSize({ monthlyKwh: 50, purpose: 'business', mount: 'ground' }, kits, calc).kwp,
      solarSize({ monthlyKwh: 20000, purpose: 'business', mount: 'ground' }, kits, calc).panels,
    ];
    expect(values.every((v) => Number.isFinite(v))).toBe(true);
  });
});
