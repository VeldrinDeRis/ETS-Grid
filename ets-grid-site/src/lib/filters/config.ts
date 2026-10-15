// Типи конфігу фільтрів src/data/filters.json і cars.json (SPEC-002 §3.1).
// Zod-схеми — у ./schema.ts; звідси вони беруться лише як типи, щоб zod не потрапляв у клієнтський JS (D-066).
import type { z } from 'astro/zod';
import type { carSchema, facetSchema, filtersFileSchema, levelFiltersSchema, presetSchema } from './schema';

export type FacetConfig = z.infer<typeof facetSchema>;
export type LevelFilterConfig = z.infer<typeof levelFiltersSchema>;
export type FilterPreset = z.infer<typeof presetSchema>;
export type FiltersFile = z.infer<typeof filtersFileSchema>;
export type Car = z.infer<typeof carSchema>;
