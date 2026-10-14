// Колекції каталогу (SPEC-001 §3.2). catalog.json зберігає структуру зразка з брифу;
// id береться зі slug у парсері. При переїзді в CMS змінюється тільки loader.
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { productSchema, systemSchema } from './lib/schema';

const CATALOG = 'src/data/catalog.json';

// Рівні беруться зі structure.json (lib/catalog.ts); збіг із catalog.levels перевіряє тест AC-07.
function section(name: 'products' | 'systems') {
  return (text: string) => {
    const data = JSON.parse(text) as Record<string, Record<string, unknown>[]>;
    return data[name].map((entry) => ({ ...entry, id: String(entry.slug) }));
  };
}

export const collections = {
  products: defineCollection({ loader: file(CATALOG, { parser: section('products') }), schema: productSchema }),
  systems: defineCollection({ loader: file(CATALOG, { parser: section('systems') }), schema: systemSchema }),
};
