// Дані контентних сторінок (SPEC-007 §3.2): схема, плейсхолдери, навігатор фінансування.
import { z } from 'astro/zod';
import contentJson from '../data/content-pages.json';

/** Текст без цифр поза плейсхолдерами […]: числа й умови надає замовник (D-005). */
export const text = z
  .string()
  .min(1)
  .refine((s) => !/\d/.test(s.replace(/\[[^\]]*\]/g, '')), 'числа — лише в плейсхолдерах […]');

const section = z.object({
  title: text,
  text: text.optional(),
  items: z.array(text).optional(),
  levels: z.boolean().optional(),
});

const service = z.object({
  short: text,
  lead: text,
  sections: z.array(section).min(1),
  packages: z.array(z.object({ name: text, scope: text, price: text })).optional(),
});

const tags = <T extends [string, ...string[]]>(values: T) => z.array(z.enum(values)).min(1);
const WHO = ['home', 'business'] as const;
const WHAT = ['solar', 'battery', 'charging', 'carport'] as const;
const SUM = ['small', 'large'] as const;

export const contentPagesSchema = z.object({
  _note: z.string().optional(),
  systems: z.object({ lead: text, timeline: text, financing_note: text }),
  services: z.object({
    lead: text,
    pages: z.object({ dostavka: service, montazh: service, 'proekt-tekhumovy': service, servis: service }),
  }),
  financing: z.object({
    lead: text,
    checked: text,
    questions: z
      .array(z.object({ key: z.enum(['who', 'what', 'sum']), legend: text, options: z.array(z.tuple([z.string(), text])).min(2) }))
      .length(3),
    programs: z
      .array(z.object({ id: z.string(), title: text, text: text, who: tags([...WHO]), what: tags([...WHAT]), sum: tags([...SUM]) }))
      .min(3),
    none: text,
    cta: text,
  }),
  cases: z.object({
    plate: text,
    template_note: text,
    template: z.object({ photo: text, type: text, city: text, equipment: text, result: text }),
  }),
  about: z.object({ lead: text, sections: z.array(section).min(4) }),
  contacts: z.object({ lead: text, schedule: text, map: text }),
  documents: z.object({ note: text, body: text, edition: text }),
  guide: z.object({
    title: text,
    lead: text,
    articles: z.array(z.object({ slug: z.string(), title: text, level: z.enum(['charging', 'solar', 'battery']), picker: text })).min(1),
  }),
});

export type ContentPages = z.infer<typeof contentPagesSchema>;
export type FinancingProgram = ContentPages['financing']['programs'][number];

export const content = contentJson as ContentPages;

/** Розбиває текст на шматки: плейсхолдери «[…]» окремо — їх малює Placeholder. */
export function chunks(s: string): { text: string; placeholder: boolean }[] {
  return s
    .split(/(\[[^\]]+\])/)
    .filter(Boolean)
    .map((t) => ({ text: t, placeholder: /^\[[^\]]+\]$/.test(t) }));
}

export { matchPrograms, type FinancingAnswers } from './financing';
