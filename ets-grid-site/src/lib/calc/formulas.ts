// Формули підбірників (SPEC-004 §3.2, 03 §3). Чисті функції: коефіцієнти — з calc.json.
import type { Car } from '../filters/config';
import type { Product } from '../schema';
import type { Calc } from './config';

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const connectorsOf = (p: Product): string[] => (Array.isArray(p.attrs.connectors) ? (p.attrs.connectors as string[]) : []);

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/* ---------- «Чи вистачить потужності?» (03 §3.1) ---------- */

export type PowerOutcome = 'ok' | 'ac_deficit' | 'dc_deficit' | 'none';

export interface PowerCheckResult {
  needKw: number;
  gridKw: number;
  current: 'AC' | 'DC';
  station: Product | null;
  deficit: number;
  outcome: PowerOutcome;
  reserveKw?: number;
  smallerKw?: number | null;
  batteryKwh?: number;
  batteryStation?: Product | null;
}

const BASE_EXCLUDED = new Set(['dc_battery', 'portable', 'cable']);

function inputOf(p: Product): number {
  return num(p.attrs.input_min_kw) ?? num(p.attrs.power_kw) ?? Number.POSITIVE_INFINITY;
}

export function powerCheck(input: { needKw: number; gridKw: number }, stations: Product[], calc: Calc): PowerCheckResult {
  const { needKw, gridKw } = input;
  const current: 'AC' | 'DC' = needKw <= calc.power.ac_max_kw ? 'AC' : 'DC';
  const base = stations
    .filter((p) => p.level === 1 && !BASE_EXCLUDED.has(p.type) && p.attrs.current === current)
    .filter((p) => (num(p.attrs.power_kw) ?? 0) >= needKw)
    .sort((a, b) => (num(a.attrs.power_kw) ?? 0) - (num(b.attrs.power_kw) ?? 0) || inputOf(a) - inputOf(b));
  const station = base[0] ?? null;
  if (!station) return { needKw, gridKw, current, station: null, deficit: 0, outcome: 'none' };

  const deficit = Math.max(0, inputOf(station) - gridKw);
  if (deficit === 0) return { needKw, gridKw, current, station, deficit, outcome: 'ok', reserveKw: gridKw - inputOf(station) };

  if (current === 'AC') {
    const fitting = stations
      .filter((p) => p.level === 1 && !BASE_EXCLUDED.has(p.type) && p.attrs.current === 'AC' && inputOf(p) <= gridKw)
      .map((p) => num(p.attrs.power_kw) ?? 0);
    return { needKw, gridKw, current, station, deficit, outcome: 'ac_deficit', smallerKw: fitting.length ? Math.max(...fitting) : null };
  }

  const { battery_buffer_h: buffer, battery_round_kwh: round } = calc.power;
  const batteryKwh = Math.ceil((deficit * buffer) / round) * round;
  const batteryStation =
    stations
      .filter((p) => p.type === 'dc_battery' && (num(p.attrs.power_kw) ?? 0) >= needKw && inputOf(p) <= gridKw)
      .sort((a, b) => inputOf(a) - inputOf(b))[0] ?? null;
  return { needKw, gridKw, current, station, deficit, outcome: 'dc_deficit', batteryKwh, batteryStation };
}

/* ---------- Підбірник зарядок (ТЗ §7) ---------- */

export type Where = 'home' | 'business' | 'highway';
const SCENARIOS: Record<Where, string[]> = {
  home: ['home'],
  business: ['business', 'fleet'],
  highway: ['highway', 'fleet'],
};

export interface ChargingPickerResult {
  candidates: Product[];
  fits: Product[];
  needsMore: { station: Product; check: PowerCheckResult } | null;
}

export function chargingPicker(
  input: { where: Where; connector: string | null; carId: string | null; phases: 1 | 3; gridKw: number },
  stations: Product[],
  cars: Car[],
  calc: Calc,
): ChargingPickerResult {
  const car = input.carId ? cars.find((c) => c.id === input.carId) : undefined;
  const wanted = car ? [car.ac_connector, car.dc_connector].filter((c): c is NonNullable<typeof c> => c !== null) : input.connector ? [input.connector] : [];

  const candidates = stations
    .filter((p) => p.level === 1 && p.type !== 'cable')
    .filter((p) => p.scenarios.some((s) => SCENARIOS[input.where].includes(s)))
    .filter((p) => wanted.length === 0 || connectorsOf(p).some((c) => wanted.includes(c)))
    .filter((p) => input.phases === 3 || p.attrs.phases === 1)
    .sort((a, b) => (num(b.attrs.power_kw) ?? 0) - (num(a.attrs.power_kw) ?? 0));

  const fits = candidates.filter((p) => inputOf(p) <= input.gridKw).slice(0, 3);
  const missing = candidates
    .filter((p) => inputOf(p) > input.gridKw && p.type !== 'dc_battery')
    .sort((a, b) => inputOf(a) - inputOf(b))[0];
  const needsMore = missing
    ? { station: missing, check: powerCheck({ needKw: num(missing.attrs.power_kw) ?? 0, gridKw: input.gridKw }, stations, calc) }
    : null;
  return { candidates, fits, needsMore };
}

/* ---------- Батареї (03 §3.2) ---------- */

export function loadWatts(ids: string[], calc: Calc): number {
  return calc.battery.loads.filter((l) => ids.includes(l.id)).reduce((sum, l) => sum + l.w, 0);
}

const usable = (calc: Calc) => 1000 * calc.battery.dod * calc.battery.inverter_eff;

export function batteryHours(loadW: number, capacityKwh: number, calc: Calc): number {
  return loadW > 0 ? (capacityKwh * usable(calc)) / loadW : 0;
}

export interface BatteryPickerResult {
  loadW: number;
  neededKwh: number;
  product: Product | null;
  modules: number;
  totalKwh: number;
  hoursWithIt: number | null;
  hasSolar: boolean;
}

export function batteryPicker(
  input: { loads: string[]; hours: number; hasSolar: boolean },
  batteries: Product[],
  calc: Calc,
): BatteryPickerResult {
  const loadW = loadWatts(input.loads, calc);
  const empty = { loadW, neededKwh: 0, product: null, modules: 0, totalKwh: 0, hoursWithIt: null, hasSolar: input.hasSolar };
  if (loadW === 0) return empty;
  const neededKwh = (loadW * input.hours) / usable(calc);
  const sorted = batteries
    .filter((p) => p.level === 3 && num(p.attrs.capacity_kwh) !== null)
    .sort((a, b) => num(a.attrs.capacity_kwh)! - num(b.attrs.capacity_kwh)!);
  for (const p of sorted) {
    const cap = num(p.attrs.capacity_kwh)!;
    const expand = num(p.attrs.max_expand_kwh) ?? cap;
    if (cap >= neededKwh || expand >= neededKwh) {
      const modules = cap >= neededKwh ? 1 : Math.ceil(neededKwh / cap);
      const totalKwh = modules * cap;
      return { loadW, neededKwh, product: p, modules, totalKwh, hoursWithIt: batteryHours(loadW, totalKwh, calc), hasSolar: input.hasSolar };
    }
  }
  return { ...empty, neededKwh };
}

/** Час автономії на «базових потребах» для фасету (SPEC-004 §3.5). */
export function autonomyHours(p: Product, calc: Calc): number | null {
  const cap = num(p.attrs.capacity_kwh);
  if (p.level !== 3 || cap === null) return null;
  return batteryHours(loadWatts(calc.battery.autonomy_reference_loads, calc), cap, calc);
}

/* ---------- СЕС (03 §3.3) ---------- */

export interface SolarResult {
  kwpRaw: number;
  kwp: number;
  panels: number;
  areaM2: number;
  priceFrom: number | null;
  priceDemo: boolean;
}

export function solarSize(
  input: { monthlyKwh: number; purpose: 'home' | 'business'; mount: 'roof' | 'ground' },
  kits: Product[],
  calc: Calc,
): SolarResult {
  const kwpRaw = (input.monthlyKwh * 12) / calc.solar.yield_kwh_per_kwp_year;
  const panels = Math.ceil((kwpRaw * 1000) / calc.solar.panel_w);
  const perKwp = kits
    .map((k) => {
      const kwp = num(k.attrs.kwp);
      return k.price_turnkey_from !== null && kwp ? { rate: k.price_turnkey_from / kwp, demo: k.demo } : null;
    })
    .filter((x): x is { rate: number; demo: boolean } => x !== null)
    .sort((a, b) => a.rate - b.rate)[0];
  return {
    kwpRaw,
    kwp: Math.round(kwpRaw * 10) / 10,
    panels,
    areaM2: Math.round(panels * calc.solar.area_m2_per_panel * 10) / 10,
    priceFrom: perKwp ? Math.round((kwpRaw * perKwp.rate) / 1000) * 1000 : null,
    priceDemo: perKwp?.demo ?? false,
  };
}

/* ---------- Solar Carport (03 §3.4) ---------- */

export interface CarportResult {
  places: number;
  kwp: number;
  panels: number;
  evPorts: number;
  storageKwh: number;
  co2TYear: number;
  nearest: Product | null;
}

export function carportConfig(input: { places: number; chargers: boolean; storage: boolean }, carports: Product[], calc: Calc): CarportResult {
  const c = calc.carport;
  const places = clamp(Math.round(input.places / c.places_step) * c.places_step, c.places_min, c.places_max);
  const nearest =
    [...carports]
      .filter((p) => num(p.attrs.places) !== null)
      .sort((a, b) => Math.abs(num(a.attrs.places)! - places) - Math.abs(num(b.attrs.places)! - places))[0] ?? null;
  return {
    places,
    kwp: Math.round(places * c.kwp_per_place),
    panels: places * c.panels_per_place,
    evPorts: input.chargers ? Math.ceil(places / c.places_per_port) : 0,
    storageKwh: input.storage ? Math.ceil((places * c.storage_kwh_per_place) / c.storage_round_kwh) * c.storage_round_kwh : 0,
    co2TYear: Math.round(places * c.co2_t_per_place_year),
    nearest,
  };
}
