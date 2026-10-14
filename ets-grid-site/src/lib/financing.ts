// Навігатор фінансування (SPEC-007 §3.1): чиста логіка без залежностей — її бере і сторінка, і скрипт.

export interface ProgramTags {
  id: string;
  who: string[];
  what: string[];
  sum: string[];
}

export type FinancingAnswers = Partial<Record<'who' | 'what' | 'sum', string>>;

/** Програми, що підходять під відповіді; питання без відповіді не фільтрує. */
export function matchPrograms<T extends ProgramTags>(programs: T[], answers: FinancingAnswers): T[] {
  return programs.filter(
    (p) =>
      (!answers.who || p.who.includes(answers.who)) &&
      (!answers.what || p.what.includes(answers.what)) &&
      (!answers.sum || p.sum.includes(answers.sum)),
  );
}
