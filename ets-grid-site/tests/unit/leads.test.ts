import { describe, expect, test } from 'vitest';
import { buildLead, describePicker, formatPhone, leadId, normalizePhone, readUtm, validateLead, type LeadContext } from '../../src/lib/leads';

const NBSP = ' ';

const ctx: LeadContext = {
  products: {
    'ets-dc-60': { name: 'ETS DC-60 Duo', level: 'charging' },
    'ets-battery-home-10': { name: 'Домашня батарея 10 кВт·год LFP', level: 'battery' },
    'ets-home-7': { name: 'ETS Home 7', level: 'charging' },
  },
  cars: { 'vw-id4-crozz-cn': 'Volkswagen ID.4 Crozz 84.8 kWh (CN)' },
  loads: { light_internet: 'Світло й інтернет', fridge: 'Холодильник', boiler_pump: 'Котел і насос' },
  connectors: { type2: 'Type 2', ccs2: 'CCS2' },
};

describe('SPEC-009/AC-01 телефон', () => {
  test.each([
    ['0671234567', '+380671234567'],
    ['067 123 45 67', '+380671234567'],
    ['380671234567', '+380671234567'],
    ['+38 (067) 123-45-67', '+380671234567'],
    ['+380671234567', '+380671234567'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  test.each(['12345', '+3806712', '', 'телефон', '+480671234567', '06712345678'])('%j → null', (input) => {
    expect(normalizePhone(input)).toBeNull();
  });

  test('formatPhone', () => {
    expect(formatPhone('+380671234567')).toBe('+380 67 123 45 67');
  });
});

describe('SPEC-009/AC-02 перевірка полів', () => {
  test('порожня форма — одна помилка: телефон', () => {
    expect(validateLead({ phone: '' })).toEqual({ phone: 'Вкажіть номер телефону' });
  });

  test('неправильний телефон', () => {
    expect(validateLead({ phone: '123' })).toEqual({ phone: 'Вкажіть номер у форматі +380 XX XXX XX XX' });
  });

  test('довжина імені й коментаря', () => {
    const errors = validateLead({ phone: '0671234567', name: 'а'.repeat(81), comment: 'б'.repeat(1001) });
    expect(Object.keys(errors).sort()).toEqual(['comment', 'name']);
  });

  test('коректна форма — без помилок', () => {
    expect(validateLead({ phone: '0671234567', name: 'Олена' })).toEqual({});
  });
});

describe('SPEC-009/AC-03 зведення підбірника', () => {
  test('power: дефіцит і накопичувач', () => {
    expect(
      describePicker({ picker: 'power', need_kw: '60', grid_kw: '50', outcome: 'dc_deficit', station: 'ets-dc-60', battery_kwh: '10' }, ctx),
    ).toBe(`Потрібна зарядка 60${NBSP}кВт, ввід 50${NBSP}кВт → не вистачає, накопичувач ≈ 10${NBSP}кВт·год. Станція: ETS DC-60 Duo`);
  });

  test('power: вистачає', () => {
    expect(describePicker({ picker: 'power', need_kw: '22', grid_kw: '30', outcome: 'ok' }, ctx)).toBe(
      `Потрібна зарядка 22${NBSP}кВт, ввід 30${NBSP}кВт → мережі вистачає`,
    );
  });

  test('charging: авто, фази, ввід, рекомендації', () => {
    expect(
      describePicker({ picker: 'charging', where: 'home', car: 'vw-id4-crozz-cn', phases: '3', grid_kw: '15', result: 'ets-home-7' }, ctx),
    ).toBe(`Де: дім; авто: Volkswagen ID.4 Crozz 84.8 kWh (CN); 3 фази; ввід 15${NBSP}кВт; підходять: ETS Home 7`);
  });

  test('battery: приклад зі специфікації', () => {
    expect(
      describePicker({ picker: 'battery', loads: 'light_internet,fridge', hours: '12', has_solar: 'false', kwh: '4.2', product: 'ets-battery-home-10' }, ctx),
    ).toBe(`Що працює: світло й інтернет, холодильник; 12 год без мережі; потрібно ≈ 4,2${NBSP}кВт·год; Домашня батарея 10 кВт·год LFP`);
  });

  test('solar', () => {
    expect(describePicker({ picker: 'solar', purpose: 'home', monthly_kwh: '400', mount: 'roof', kwp: '4.2', panels: '8' }, ctx)).toBe(
      `Дім; споживання 400${NBSP}кВт·год на місяць; дах; СЕС ≈ 4,2${NBSP}kWp, 8 панелей`,
    );
  });

  test('carport', () => {
    expect(
      describePicker({ picker: 'carport', places: '20', chargers: 'true', storage: 'true', kwp: '66', ports: '10', storage_kwh: '100' }, ctx),
    ).toBe(`20 машиномісць; із зарядками; з накопичувачем; ≈ 66${NBSP}kWp, 10 портів, 100${NBSP}кВт·год`);
  });

  test('невідомий підбірник або без параметрів — null', () => {
    expect(describePicker({ picker: 'xyz' }, ctx)).toBeNull();
    expect(describePicker({}, ctx)).toBeNull();
  });
});

describe('SPEC-009 номер, UTM і заявка', () => {
  test('leadId: L-ГГГГММДД-XXXX', () => {
    expect(leadId(new Date('2026-10-14T10:00:00Z'), () => 0.5)).toMatch(/^L-20261014-[A-Z0-9]{4}$/);
  });

  test('readUtm бере лише utm_*', () => {
    expect(readUtm('?utm_source=google&utm_campaign=ev&x=1')).toEqual({ utm_source: 'google', utm_campaign: 'ev' });
    expect(readUtm('?x=1')).toBeNull();
  });

  test('buildLead: контракт §3.4, телефон нормалізовано', () => {
    const lead = buildLead({
      kind: 'quote',
      fields: { name: ' Олена ', phone: '067 123 45 67', object_type: 'business', interests: ['charging'], messenger: 'telegram', city: '', comment: '' },
      product: 'ets-dc-60',
      picker: { picker: 'power', need_kw: '60' },
      sourceUrl: '/zaryadni-stantsii/',
      utm: { utm_source: 'google' },
      now: new Date('2026-10-14T10:00:00Z'),
      random: () => 0.1,
    });
    expect(lead).toMatchObject({
      type: 'lead',
      kind: 'quote',
      name: 'Олена',
      phone: '+380671234567',
      object_type: 'business',
      interests: ['charging'],
      messenger: 'telegram',
      city: null,
      comment: null,
      product: 'ets-dc-60',
      picker: { picker: 'power', need_kw: '60' },
      source_url: '/zaryadni-stantsii/',
      utm: { utm_source: 'google' },
      created_at: '2026-10-14T10:00:00.000Z',
    });
    expect(lead.id).toMatch(/^L-20261014-/);
  });
});
