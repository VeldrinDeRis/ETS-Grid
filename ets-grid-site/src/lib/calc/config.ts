// Схема calc.json і доступ до значень (SPEC-004 §3.1).
import { z } from 'astro/zod';
import calcJson from '../../data/calc.json';

const coef = <T extends z.ZodType>(value: T) => z.object({ value, source: z.string().min(1) });

const loadSchema = z.object({ id: z.string().regex(/^[a-z_]+$/), label: z.string().min(1), w: z.number().positive() });

export const calcFileSchema = z.object({
  _note: z.string().optional(),
  power: z.object({
    need_options_kw: coef(z.array(z.number().positive()).min(1)),
    grid_min_kw: coef(z.number().positive()),
    grid_max_kw: coef(z.number().positive()),
    ac_max_kw: coef(z.number().positive()),
    battery_buffer_h: coef(z.number().positive()),
    battery_round_kwh: coef(z.number().positive()),
  }),
  battery: z.object({
    loads: coef(z.array(loadSchema).min(1)),
    dod: coef(z.number().gt(0).lte(1)),
    inverter_eff: coef(z.number().gt(0).lte(1)),
    hours_min: coef(z.number().positive()),
    hours_max: coef(z.number().positive()),
    autonomy_reference_loads: coef(z.array(z.string()).min(1)),
  }),
  solar: z.object({
    yield_kwh_per_kwp_year: coef(z.number().positive()),
    panel_w: coef(z.number().positive()),
    area_m2_per_panel: coef(z.number().positive()),
    monthly_kwh_min: coef(z.number().positive()),
    monthly_kwh_max: coef(z.number().positive()),
    tariff_uah_per_kwh: coef(z.number().positive().nullable()),
  }),
  carport: z.object({
    places_min: coef(z.number().int().positive()),
    places_max: coef(z.number().int().positive()),
    places_step: coef(z.number().int().positive()),
    kwp_per_place: coef(z.number().positive()),
    panels_per_place: coef(z.number().positive()),
    places_per_port: coef(z.number().positive()),
    storage_kwh_per_place: coef(z.number().positive()),
    storage_round_kwh: coef(z.number().positive()),
    co2_t_per_place_year: coef(z.number().positive()),
  }),
});

export type CalcFile = z.infer<typeof calcFileSchema>;
export type Load = z.infer<typeof loadSchema>;

/** Плоскі значення без поля source — те, що потрібно формулам. */
type Values<T> = { [K in keyof T]: T[K] extends { value: infer V } ? V : never };
export interface Calc {
  power: Values<CalcFile['power']>;
  battery: Values<CalcFile['battery']>;
  solar: Values<CalcFile['solar']>;
  carport: Values<CalcFile['carport']>;
}

function flatten<T extends Record<string, { value: unknown }>>(group: T): Values<T> {
  return Object.fromEntries(Object.entries(group).map(([k, v]) => [k, v.value])) as Values<T>;
}

export function toCalc(file: CalcFile): Calc {
  return { power: flatten(file.power), battery: flatten(file.battery), solar: flatten(file.solar), carport: flatten(file.carport) };
}

export const calc: Calc = toCalc(calcJson as CalcFile);
