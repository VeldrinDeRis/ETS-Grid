// Zod-схема calc.json (SPEC-004 §3.1). Тільки для тестів і серверної перевірки:
// у клієнтський JS не імпортувати (D-066) — рантайм-типи беруть `import type` із цього модуля.
import { z } from 'astro/zod';

const coef = <T extends z.ZodType>(value: T) => z.object({ value, source: z.string().min(1) });

export const loadSchema = z.object({ id: z.string().regex(/^[a-z_]+$/), label: z.string().min(1), w: z.number().positive() });

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
