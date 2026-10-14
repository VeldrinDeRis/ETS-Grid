// Дані й логіка головної (SPEC-006 §4).
import { z } from 'astro/zod';
import homeJson from '../data/home-content.json';
import { formatPrice } from './format';
import type { Product, System } from './schema';

const variant = z.object({
  id: z.string().regex(/^[a-z]$/),
  overline: z.string().min(1),
  h1: z.string().min(1).refine((s) => s.trim().split(/\s+/).length <= 8, 'H1 — не більше 8 слів (ТЗ §6.1)'),
  subtitle: z.string().min(1),
  primary_cta: z.string().min(1),
  secondary_cta: z.string().min(1),
  anchor_product: z.string().min(1),
  anchor_label: z.string().min(1),
});

export const homeContentSchema = z
  .object({
    _note: z.string().optional(),
    hero: z.object({ active: z.string(), variants: z.array(variant).min(1) }),
    trust: z.array(z.string().min(1)).min(3).max(4),
    tabs: z.array(z.object({ segment: z.enum(['business', 'home', 'highway']), label: z.string().min(1), fallback_href: z.string().min(1) })).length(3),
    hits: z.array(z.string()).min(6).max(8),
    // Вузол схеми (акт II, D-055): число — з характеристики товару (`attr`) або кількість складових системи; ціна — за правилом Price.
    flow: z
      .array(
        z
          .object({
            label: z.string().min(1),
            text: z.string().min(1),
            href: z.string().startsWith('/'),
            product: z.string().min(1).optional(),
            system: z.string().min(1).optional(),
            figure: z.object({ attr: z.string().min(1).optional(), unit: z.string().min(1), digits: z.number().int().min(0).max(2) }),
          })
          .refine((n) => (n.product ? 1 : 0) + (n.system ? 1 : 0) === 1, 'вузол схеми: рівно одне з product / system')
          .refine((n) => !n.product || n.figure.attr, 'вузол із товаром потребує figure.attr'),
      )
      .length(5),
    steps: z.array(z.object({ title: z.string().min(1), term: z.string().min(1) })).length(5),
    faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(4).max(6),
    financing: z.object({ title: z.string(), items: z.array(z.string()).min(1), checked: z.string(), cta: z.string() }),
    final_form: z.object({ title: z.string().min(1) }),
  })
  .refine((h) => h.hero.variants.some((v) => v.id === h.hero.active), 'hero.active має бути одним із варіантів');

export type HomeContent = z.infer<typeof homeContentSchema>;
export type FlowNode = HomeContent['flow'][number];

export interface FlowFigure {
  value: number;
  unit: string;
  digits: number;
}

/** Число вузла схеми: характеристика товару або кількість складових системи. Немає даних — null, вузол без числа (D-031: не вигадуємо). */
export function flowFigure(node: FlowNode, products: Product[], systems: System[]): FlowFigure | null {
  const { unit, digits } = node.figure;
  if (node.product) {
    const raw = products.find((p) => p.slug === node.product)?.attrs[node.figure.attr!];
    const value = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(value) ? { value, unit, digits } : null;
  }
  const system = systems.find((s) => s.slug === node.system);
  return system ? { value: system.items.length, unit, digits } : null;
}
export type HeroVariant = HomeContent['hero']['variants'][number];

export const home = homeJson as HomeContent;

export function activeVariant(content: HomeContent = home): HeroVariant {
  return content.hero.variants.find((v) => v.id === content.hero.active) ?? content.hero.variants[0];
}

export interface SystemPrice {
  text: string;
  demo: boolean;
  total: number | null;
}

/** Ціна готової системи: сума цін складу (під ключ або обладнання), якщо ціна є в усіх; інакше — «за розрахунком» (D-030 п. 5). */
export function systemPrice(system: System, products: Product[]): SystemPrice {
  const items = system.items.map((slug) => products.find((p) => p.slug === slug));
  const prices = items.map((p) => (p ? (p.price_turnkey_from ?? p.price_equipment) : null));
  if (items.length === 0 || prices.some((x) => x === null)) return { text: 'Ціна за розрахунком', demo: false, total: null };
  const total = (prices as number[]).reduce((a, b) => a + b, 0);
  return { text: `від ${formatPrice(total)} під ключ`, demo: items.some((p) => p!.demo), total };
}

/** «від … ₴» плитки рівня: мінімальна ціна без адаптерів; немає цін — «Ціна за розрахунком». */
export function levelFromPrice(levelProducts: Product[]): string {
  const prices = levelProducts
    .filter((p) => p.type !== 'cable')
    .map((p) => p.price_equipment ?? p.price_turnkey_from)
    .filter((x): x is number => x !== null);
  return prices.length ? `від ${formatPrice(Math.min(...prices))}` : 'Ціна за розрахунком';
}
