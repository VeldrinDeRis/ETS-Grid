// Запити до каталогу (SPEC-001 §3.2). Модулі не читають JSON напряму.
import { getCollection, getEntry } from 'astro:content';
import structureJson from '../data/structure.json';
import type { Category, LevelKey, Product, Structure, StructureLevel, System } from './schema';

export const structure = structureJson as Structure;

export function getLevels(): StructureLevel[] {
  return structure.levels;
}

export function getLevel(key: LevelKey): StructureLevel {
  const level = structure.levels.find((l) => l.key === key);
  if (!level) throw new Error(`Немає рівня ${key}`);
  return level;
}

export function getLevelById(id: number): StructureLevel {
  const level = structure.levels.find((l) => l.id === id);
  if (!level) throw new Error(`Немає рівня з id ${id}`);
  return level;
}

export function getCategories(levelKey?: LevelKey): Category[] {
  return levelKey ? structure.categories.filter((c) => c.level === levelKey) : structure.categories;
}

export function getCategory(levelKey: LevelKey, slug: string): Category | undefined {
  return structure.categories.find((c) => c.level === levelKey && c.slug === slug);
}

export async function getProductsBy(filter: { level?: LevelKey; category?: string } = {}): Promise<Product[]> {
  const levelId = filter.level ? getLevel(filter.level).id : undefined;
  const entries = await getCollection(
    'products',
    ({ data }) =>
      (levelId === undefined || data.level === levelId) &&
      (filter.category === undefined || data.category === filter.category),
  );
  return entries.map((e) => e.data);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getEntry('products', slug))?.data;
}

export async function getSystems(): Promise<System[]> {
  return (await getCollection('systems')).map((e) => e.data);
}

export async function getSystem(slug: string): Promise<System | undefined> {
  return (await getEntry('systems', slug))?.data;
}
