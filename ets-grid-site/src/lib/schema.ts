// Схеми даних (SPEC-001 §3.2, ТЗ §9.6). Спільні для колекцій Astro і тестів.
import { z } from 'astro/zod';

/** Значення, яке ще надасть замовник: «[ЄМНІСТЬ]», «[БРЕНД]». */
export const placeholder = z.string().regex(/^\[.+\]$/, 'плейсхолдер має вигляд [ТЕКСТ]');

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: латиниця, цифри, дефіс');

export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  credit: z.string().min(1),
});

export const productSchema = z.object({
  slug,
  level: z.number().int().min(1).max(4),
  category: slug,
  type: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  country: z.string().min(1),
  attrs: z.record(z.string(), z.unknown()),
  scenarios: z.array(z.string()),
  sale_mode: z.enum(['cart', 'quote']),
  price_equipment: z.number().positive().nullable(),
  price_turnkey_from: z.number().positive().nullable(),
  demo: z.boolean(),
  stock: z.enum(['in_stock', 'preorder']),
  delivery_days: z.number().int().positive(),
  warranty: z.string().min(1),
  images: z.array(imageSchema),
  cross_level: z.array(slug),
  docs: z.array(z.object({ title: z.string(), href: z.string() })).default([]),
  related: z.array(slug).default([]),
});

export const systemSchema = z.object({
  slug,
  name: z.string().min(1),
  segment: z.string().min(1),
  items: z.array(slug).min(1),
  result: z.string().min(1),
});

export const levelKey = z.enum(['charging', 'solar', 'battery', 'carport']);

export const catalogLevelSchema = z.object({
  id: z.number().int().min(1).max(4),
  key: levelKey,
  slug,
  name: z.string().min(1),
});

export const catalogFileSchema = z.object({
  _note: z.string().optional(),
  levels: z.array(catalogLevelSchema).length(4),
  products: z.array(productSchema),
  systems: z.array(systemSchema),
});

const pageLink = z.object({ slug, name: z.string().min(1) });

export const structureSchema = z.object({
  levels: z
    .array(
      catalogLevelSchema.extend({
        short: z.string().min(1),
        featured: slug.nullable(),
        picker_href: z.string().startsWith('/'),
      }),
    )
    .length(4),
  categories: z.array(
    z.object({
      level: levelKey,
      slug,
      name: z.string().min(1),
      hint: z.string().nullable(),
    }),
  ),
  services: z.array(pageLink).length(4),
  documents: z.array(pageLink).min(1),
  contacts: z.object({
    phone: z.string().min(1),
    email: z.string().min(1),
    address: z.string().min(1),
    telegram: z.string().min(1),
    viber: z.string().min(1),
    requisites: z.string().min(1),
  }),
  region: z.string().min(1),
});

export type Product = z.infer<typeof productSchema>;
export type System = z.infer<typeof systemSchema>;
export type Structure = z.infer<typeof structureSchema>;
export type StructureLevel = Structure['levels'][number];
export type Category = Structure['categories'][number];
export type LevelKey = z.infer<typeof levelKey>;

export function isPlaceholder(value: unknown): boolean {
  return typeof value === 'string' && /^\[.+\]$/.test(value);
}
