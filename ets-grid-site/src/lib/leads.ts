// Заявки (SPEC-009 §3): телефон, перевірка, зведення підбірника, контракт заявки для CRM.
import { formatNumber, formatUnit } from './format';
import { plural } from './plural';

/* ---------- телефон ---------- */

/** Будь-який запис українського мобільного/міського → '+380XXXXXXXXX' або null. */
export function normalizePhone(input: string): string | null {
  const digits = (input ?? '').replace(/\D/g, '');
  let national: string | null = null;
  if (digits.length === 12 && digits.startsWith('380')) national = digits.slice(3);
  else if (digits.length === 11 && digits.startsWith('80')) national = digits.slice(2);
  else if (digits.length === 10 && digits.startsWith('0')) national = digits.slice(1);
  return national && /^\d{9}$/.test(national) ? `+380${national}` : null;
}

export function formatPhone(normalized: string): string {
  const m = /^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(normalized);
  return m ? `+380 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : normalized;
}

/* ---------- перевірка ---------- */

export interface LeadFields {
  name?: string;
  phone?: string;
  object_type?: string;
  interests?: string[];
  messenger?: string;
  city?: string;
  comment?: string;
}

export type LeadErrors = Partial<Record<keyof LeadFields, string>>;

export const LIMITS = { name: 80, city: 80, comment: 1000 } as const;

export function validateLead(f: LeadFields): LeadErrors {
  const errors: LeadErrors = {};
  const phone = (f.phone ?? '').trim();
  if (!phone) errors.phone = 'Вкажіть номер телефону';
  else if (!normalizePhone(phone)) errors.phone = 'Вкажіть номер у форматі +380 XX XXX XX XX';
  if ((f.name ?? '').trim().length > LIMITS.name) errors.name = `Не більше ${LIMITS.name} символів`;
  if ((f.city ?? '').trim().length > LIMITS.city) errors.city = `Не більше ${LIMITS.city} символів`;
  if ((f.comment ?? '').trim().length > LIMITS.comment) errors.comment = `Не більше ${LIMITS.comment} символів`;
  return errors;
}

/* ---------- зведення підбірника (SPEC-009 §3.3) ---------- */

export interface LeadContext {
  products: Record<string, { name: string; level: string }>;
  cars: Record<string, string>;
  loads: Record<string, string>;
  connectors: Record<string, string>;
  /** Назви готових систем (SPEC-007: CTA «Розрахувати систему»). */
  systems?: Record<string, string>;
}

const WHERE: Record<string, string> = { home: 'дім', business: 'бізнес / паркінг', highway: 'траса / АЗС' };
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const n = (v: string | undefined) => (v === undefined || v === '' ? null : Number(v));

export function describePicker(params: Record<string, string>, ctx: LeadContext): string | null {
  const p = params;
  const name = (slug?: string) => (slug ? (ctx.products[slug]?.name ?? slug) : null);
  switch (p.picker) {
    case 'power': {
      const need = n(p.need_kw);
      const grid = n(p.grid_kw);
      if (need === null || grid === null) return null;
      const outcome =
        p.outcome === 'ok'
          ? 'мережі вистачає'
          : p.outcome === 'dc_deficit'
            ? `не вистачає, накопичувач ≈ ${formatUnit(Number(p.battery_kwh), 'кВт·год')}`
            : p.outcome === 'ac_deficit'
              ? 'не вистачає: менша потужність із балансуванням або техумови'
              : 'рішення індивідуально';
      const station = name(p.station);
      return `Потрібна зарядка ${formatUnit(need, 'кВт')}, ввід ${formatUnit(grid, 'кВт')} → ${outcome}${station ? `. Станція: ${station}` : ''}`;
    }
    case 'charging': {
      const parts = [`Де: ${WHERE[p.where] ?? p.where}`];
      if (p.car) parts.push(`авто: ${ctx.cars[p.car] ?? p.car}`);
      else if (p.connector) parts.push(`розʼєм: ${ctx.connectors[p.connector] ?? p.connector}`);
      if (p.phases) parts.push(p.phases === '1' ? '1 фаза' : `${p.phases} фази`);
      if (p.grid_kw) parts.push(`ввід ${formatUnit(Number(p.grid_kw), 'кВт')}`);
      const fits = (p.result ?? '').split(',').filter(Boolean).map((s) => name(s)!);
      parts.push(fits.length ? `підходять: ${fits.join(', ')}` : 'готової моделі немає');
      if (p.battery_kwh) parts.push(`накопичувач ≈ ${formatUnit(Number(p.battery_kwh), 'кВт·год')}`);
      return parts.join('; ');
    }
    case 'battery': {
      const loads = (p.loads ?? '').split(',').filter(Boolean).map((id) => lower(ctx.loads[id] ?? id));
      if (loads.length === 0) return null;
      const hours = Number(p.hours);
      const parts = [`Що працює: ${loads.join(', ')}`, `${formatNumber(hours)} год без мережі`];
      if (p.has_solar === 'true') parts.push('є сонячні панелі');
      if (p.kwh) parts.push(`потрібно ≈ ${formatUnit(Number(p.kwh), 'кВт·год')}`);
      const product = name(p.product);
      if (product) parts.push(Number(p.modules) > 1 ? `${p.modules} модулі: ${product}` : product);
      return parts.join('; ');
    }
    case 'solar': {
      const monthly = n(p.monthly_kwh);
      if (monthly === null) return null;
      const panels = Number(p.panels);
      return [
        p.purpose === 'business' ? 'Бізнес' : 'Дім',
        `споживання ${formatUnit(monthly, 'кВт·год')} на місяць`,
        p.mount === 'ground' ? 'земля' : 'дах',
        `СЕС ≈ ${formatUnit(Number(p.kwp), 'kWp')}, ${panels} ${plural(panels, ['панель', 'панелі', 'панелей'])}`,
      ].join('; ');
    }
    case 'carport': {
      const places = n(p.places);
      if (places === null) return null;
      const ports = Number(p.ports);
      return [
        `${places} ${plural(places, ['машиномісце', 'машиномісця', 'машиномісць'])}`,
        p.chargers === 'true' ? 'із зарядками' : 'без зарядок',
        p.storage === 'true' ? 'з накопичувачем' : 'без накопичувача',
        `≈ ${formatUnit(Number(p.kwp), 'kWp')}, ${ports} ${plural(ports, ['порт', 'порти', 'портів'])}, ${formatUnit(Number(p.storage_kwh), 'кВт·год')}`,
      ].join('; ');
    }
    case 'system': {
      if (!p.system) return null;
      return `Готова система: ${ctx.systems?.[p.system] ?? p.system}`;
    }
    default:
      return null;
  }
}

/* ---------- UTM, номер і заявка (SPEC-009 §3.3–3.4) ---------- */

export const UTM_KEY = 'etsgrid:utm';
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export function readUtm(search: string): Record<string, string> | null {
  const params = new URLSearchParams(search);
  const utm = Object.fromEntries(UTM_FIELDS.filter((k) => params.get(k)).map((k) => [k, params.get(k)!]));
  return Object.keys(utm).length ? utm : null;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function leadId(now: Date = new Date(), random: () => number = Math.random): string {
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const tail = Array.from({ length: 4 }, () => ALPHABET[Math.floor(random() * ALPHABET.length)]).join('');
  return `L-${ymd}-${tail}`;
}

export type LeadKind = 'quote' | 'final' | 'level' | 'carport';

export interface Lead {
  type: 'lead';
  kind: LeadKind;
  id: string;
  created_at: string;
  name: string | null;
  phone: string;
  object_type: string | null;
  interests: string[];
  messenger: string | null;
  city: string | null;
  comment: string | null;
  product: string | null;
  picker: Record<string, string> | null;
  source_url: string;
  utm: Record<string, string> | null;
}

const clean = (v: string | undefined) => {
  const t = (v ?? '').trim();
  return t === '' ? null : t;
};

export function buildLead(input: {
  kind: LeadKind;
  fields: LeadFields;
  product: string | null;
  picker: Record<string, string> | null;
  sourceUrl: string;
  utm: Record<string, string> | null;
  now?: Date;
  random?: () => number;
}): Lead {
  const now = input.now ?? new Date();
  return {
    type: 'lead',
    kind: input.kind,
    id: leadId(now, input.random),
    created_at: now.toISOString(),
    name: clean(input.fields.name),
    phone: normalizePhone(input.fields.phone ?? '') ?? '',
    object_type: clean(input.fields.object_type),
    interests: input.fields.interests ?? [],
    messenger: clean(input.fields.messenger),
    city: clean(input.fields.city),
    comment: clean(input.fields.comment),
    product: input.product,
    picker: input.picker,
    source_url: input.sourceUrl,
    utm: input.utm,
  };
}
