// Типи calc.json і доступ до значень (SPEC-004 §3.1). Zod-схема — у ./schema.ts;
// звідси вона береться лише як тип, щоб zod не потрапляв у клієнтський JS (D-066).
import type { z } from 'astro/zod';
import calcJson from '../../data/calc.json';
import type { calcFileSchema, loadSchema } from './schema';

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
