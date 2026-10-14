import { describe, expect, test } from 'vitest';
import contentJson from '../../src/data/content-pages.json';
import { chunks, matchPrograms } from '../../src/lib/content';
import { describePicker } from '../../src/lib/leads';

const programs = contentJson.financing.programs;
const ids = (answers: Record<string, string>) => matchPrograms(programs, answers).map((p) => p.id);

describe('SPEC-007/AC-06 навігатор фінансування (логіка)', () => {
  test('без відповідей — усі програми', () => {
    expect(ids({})).toEqual(['credit', 'compensation', 'grants', 'parts']);
  });

  test('приватна особа + СЕС — кредит, компенсація, частинами', () => {
    expect(ids({ who: 'home', what: 'solar' })).toEqual(['credit', 'compensation', 'parts']);
  });

  test('бізнес + Carport + велика сума — гранти', () => {
    expect(ids({ who: 'business', what: 'carport', sum: 'large' })).toEqual(['grants']);
  });

  test('приватна особа + Carport — нічого', () => {
    expect(ids({ who: 'home', what: 'carport' })).toEqual([]);
  });
});

describe('SPEC-007 плейсхолдери в тексті', () => {
  test('chunks розділяє текст і […]', () => {
    expect(chunks('Київ — [N] днів')).toEqual([
      { text: 'Київ — ', placeholder: false },
      { text: '[N]', placeholder: true },
      { text: ' днів', placeholder: false },
    ]);
  });
});

describe('SPEC-007/AC-03 CTA системи → форма з параметрами', () => {
  test('describePicker: picker=system', () => {
    const ctx = { products: {}, cars: {}, loads: {}, connectors: {}, systems: { 'dim-plus-avto': 'Дім + авто' } };
    expect(describePicker({ picker: 'system', system: 'dim-plus-avto' }, ctx)).toBe('Готова система: Дім + авто');
    expect(describePicker({ picker: 'system' }, ctx)).toBeNull();
  });
});
