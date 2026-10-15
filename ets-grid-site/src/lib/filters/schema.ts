// Zod-схеми конфігу фільтрів src/data/filters.json і cars.json (SPEC-002 §3.1).
// Тільки для тестів і серверної перевірки: у клієнтський JS не імпортувати (D-066) —
// рантайм-типи беруть `import type` із цього модуля (./config.ts).
import { z } from 'astro/zod';

const enumValues = z.array(z.tuple([z.string(), z.string()]));
const range = z.union([
  z.tuple([z.number(), z.number().nullable()]),
  z.tuple([z.number(), z.number().nullable(), z.string()]),
]);

export const facetSchema = z.object({
  key: z.string().regex(/^[a-z_]+$/),
  label: z.string().min(1),
  ui: z.enum(['visual-chips', 'chips', 'toggle', 'checkbox', 'checkbox-icons', 'checkbox-search', 'ranges', 'range-slider', 'search-select']),
  field: z.string().min(1),
  values: z.union([enumValues, z.literal('auto')]).optional(),
  ranges: z.array(range).optional(),
  unit: z.string().optional(),
});

export const levelFiltersSchema = z.object({
  primary: facetSchema,
  facets: z.array(facetSchema),
});

export const presetSchema = z.object({
  level: z.enum(['charging', 'solar', 'battery', 'carport']),
  category: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  filters: z.record(z.string(), z.array(z.string()).min(1)),
  h1: z.string().min(1),
  description: z.string().min(1),
});

export const filtersFileSchema = z.object({
  _note: z.string().optional(),
  labels: z.object({
    scenarios: z.record(z.string(), z.string()),
    badges: z.object({ dc_battery: z.string(), gbt: z.string() }),
  }),
  levels: z.object({
    charging: levelFiltersSchema,
    solar: levelFiltersSchema,
    battery: levelFiltersSchema,
    carport: levelFiltersSchema,
  }),
  presets: z.array(presetSchema),
});

export const carSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  brand: z.string().min(1),
  model: z.string().min(1),
  market: z.enum(['EU', 'CN', 'US']),
  ac_connector: z.enum(['type2', 'gbt_ac']).nullable(),
  dc_connector: z.enum(['ccs2', 'gbt_dc', 'chademo']).nullable(),
  ac_max_kw: z.number().positive().nullable(),
  dc_max_kw: z.number().positive().nullable(),
  source: z.url({ protocol: /^https$/ }),
});
