// Тексти сторінок рівнів (SPEC-002 §3.4): цінність, «Як обрати», FAQ. Структура сумісна з CMS.
import { z } from 'astro/zod';

const levelText = z.object({
  value: z.string().min(1),
  how_to_choose: z.array(z.string().min(1)).min(5).max(7),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(3),
  cross: z.array(z.object({ level: z.enum(['charging', 'solar', 'battery', 'carport']), text: z.string().min(1) })).min(1),
});

export const levelContentSchema = z.object({
  charging: levelText,
  solar: levelText,
  battery: levelText,
});

export type LevelContent = z.infer<typeof levelContentSchema>;
export type LevelText = z.infer<typeof levelText>;
