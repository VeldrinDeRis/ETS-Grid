// Логіка картки товару (SPEC-003 §3.2–3.3, 03 §4).
import filtersJson from '../data/filters.json';
import { formatNumber, formatUnit, NBSP } from './format';
import type { Car, FiltersFile } from './filters/config';
import { plural } from './plural';
import type { Product } from './schema';

const config = filtersJson as unknown as FiltersFile;

/* ---------- ціни ---------- */

export function hasToggle(p: Product): boolean {
  return p.price_equipment !== null && p.price_turnkey_from !== null;
}

export function installPrice(p: Product): number | null {
  return hasToggle(p) ? p.price_turnkey_from! - p.price_equipment! : null;
}

/* ---------- сумісність з авто (§3.3) ---------- */

export interface Compatibility {
  status: 'fits' | 'adapter' | 'no';
  speedKw: number | null;
  adapter: string | null;
}

const connectorsOf = (p: Product): string[] => (Array.isArray(p.attrs.connectors) ? (p.attrs.connectors as string[]) : []);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const minKnown = (a: number | null, b: number | null) => (a === null || b === null ? null : Math.min(a, b));

export function carCompatibility(p: Product, car: Car, adapters: Product[]): Compatibility {
  const power = num(p.attrs.power_kw);
  const connectors = connectorsOf(p);
  const isDc = p.attrs.current === 'DC';
  const carConnector = isDc ? car.dc_connector : car.ac_connector;
  const carMax = isDc ? car.dc_max_kw : car.ac_max_kw;
  if (carConnector && connectors.includes(carConnector)) return { status: 'fits', speedKw: minKnown(power, carMax), adapter: null };
  if (!isDc && car.ac_connector) {
    const adapter = adapters.find((a) => {
      const ac = connectorsOf(a);
      return ac.includes(car.ac_connector!) && connectors.some((c) => ac.includes(c));
    });
    if (adapter) return { status: 'adapter', speedKw: minKnown(power, car.ac_max_kw), adapter: adapter.slug };
  }
  return { status: 'no', speedKw: null, adapter: null };
}

/* ---------- характеристики ---------- */

export interface Row {
  label: string;
  /** null — даних немає, показуємо «[ДАНІ]» (D-031). */
  value: string | null;
  /** Ключ attrs, якщо рядок з атрибута. */
  key?: string;
}

function labelsOf(level: keyof FiltersFile['levels'], key: string): Map<string, string> {
  const facet = key === 'type' ? config.levels[level].primary : config.levels[level].facets.find((f) => f.key === key);
  return new Map(Array.isArray(facet?.values) ? facet.values : []);
}

const ENUMS: Record<string, Map<string, string>> = {
  connectors: labelsOf('charging', 'connectors'),
  cable: labelsOf('charging', 'cable'),
  control: labelsOf('charging', 'control'),
  inverter_kind: labelsOf('solar', 'inverter_kind'),
  battery_voltage: new Map([
    ['low', 'Низьковольтна'],
    ['high', 'Високовольтна'],
  ]),
  voltage: labelsOf('battery', 'voltage'),
  bundle: new Map([
    ['ac', 'AC-зарядки'],
    ['dc', 'DC-зарядки'],
    ['battery', 'накопичувач'],
    ['canopy', 'лише навіс'],
  ]),
  material: labelsOf('carport', 'material'),
  roof: labelsOf('carport', 'roof'),
  purpose: new Map([
    ['home', 'Для дому'],
    ['business', 'Для бізнесу'],
  ]),
};
const CARPORT_TYPES = labelsOf('carport', 'type');

const UNITS: Record<string, string> = {
  power_kw: 'кВт',
  input_min_kw: 'кВт',
  pcs_kw: 'кВт',
  panel_w: 'Вт',
  capacity_kwh: 'кВт·год',
  max_expand_kwh: 'кВт·год',
  kwp: 'kWp',
  efficiency_pct: '%',
  weight_kg: 'кг',
};

export const ATTR_LABELS: Record<string, string> = {
  current: 'Тип струму',
  power_kw: 'Потужність',
  phases: 'Фази',
  input_min_kw: 'Вхід від мережі',
  connectors: 'Розʼєм',
  ports: 'Портів',
  cable: 'Кабель',
  control: 'Керування',
  ip: 'Захист',
  battery_kwh: 'Ємність накопичувача',
  panel_w: 'Потужність',
  technology: 'Технологія',
  efficiency_pct: 'ККД',
  size_mm: 'Розмір',
  weight_kg: 'Вага',
  inverter_kind: 'Тип',
  mppt: 'MPPT',
  battery_voltage: 'Сумісні батареї',
  purpose: 'Призначення',
  kwp: 'Потужність',
  with_battery: 'Батарея',
  capacity_kwh: 'Ємність',
  voltage: 'Напруга',
  chemistry: 'Хімія',
  cycles: 'Цикли',
  max_expand_kwh: 'Масштабування',
  pcs_kw: 'Потужність PCS',
  places: 'Машиномісць',
  bundle: 'Комплектація',
  material: 'Матеріал',
  roof: 'Покрівля',
};

/** Значення атрибута по-людськи; null — немає даних. Плейсхолдер «[…]» лишається видимим. */
export function formatAttr(key: string, value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' && /\[[^\]]+\]/.test(value)) return value;
  if (Array.isArray(value)) {
    const items = [...new Set(value.map((v) => ENUMS[key]?.get(String(v)) ?? String(v)))];
    return items.length ? items.join(key === 'connectors' ? ' · ' : ', ') : null;
  }
  if (typeof value === 'boolean') {
    if (key === 'with_battery') return value ? 'З батареєю' : 'Без батареї';
    return value ? 'Так' : 'Ні';
  }
  if (key === 'phases' && typeof value === 'number') return value === 1 ? '1 фаза' : `${value} ${plural(value, ['фаза', 'фази', 'фаз'])}`;
  if (key === 'max_expand_kwh' && typeof value === 'number') return `до ${formatNumber(value)}${NBSP}кВт·год`;
  if (key === 'size_mm') return `${value}${NBSP}мм`;
  if (typeof value === 'number') return UNITS[key] ? `${formatNumber(value)}${NBSP}${UNITS[key]}` : formatNumber(value);
  return ENUMS[key]?.get(String(value)) ?? String(value);
}

const attrRow = (p: Product, key: string, label = ATTR_LABELS[key]): Row => ({ label, value: formatAttr(key, p.attrs[key]), key });

/** 5–6 ключових характеристик за рівнем (03 §4). */
export function keyRows(p: Product): Row[] {
  switch (p.level) {
    case 1:
      return [
        attrRow(p, 'power_kw'),
        attrRow(p, 'connectors'),
        p.attrs.current === 'DC' ? attrRow(p, 'input_min_kw') : attrRow(p, 'phases'),
        attrRow(p, 'cable'),
        attrRow(p, 'ip'),
        attrRow(p, 'control'),
      ];
    case 2:
      if (p.type === 'panel')
        return [
          attrRow(p, 'panel_w'),
          attrRow(p, 'efficiency_pct'),
          attrRow(p, 'technology'),
          attrRow(p, 'size_mm'),
          attrRow(p, 'weight_kg'),
          { label: 'Гарантія потужності', value: null },
        ];
      if (p.type === 'inverter')
        return [
          attrRow(p, 'power_kw'),
          attrRow(p, 'phases'),
          attrRow(p, 'inverter_kind'),
          attrRow(p, 'mppt'),
          attrRow(p, 'battery_voltage'),
          { label: 'Wi-Fi', value: null },
        ];
      return [attrRow(p, 'kwp'), attrRow(p, 'purpose'), attrRow(p, 'with_battery'), { label: 'Гарантія', value: p.warranty }];
    case 3:
      return [
        attrRow(p, 'capacity_kwh'),
        attrRow(p, 'voltage', 'Напруга'),
        attrRow(p, 'chemistry'),
        attrRow(p, 'cycles'),
        attrRow(p, 'max_expand_kwh'),
        { label: 'Гарантія', value: p.warranty },
      ];
    case 4:
      return [
        attrRow(p, 'places'),
        attrRow(p, 'kwp'),
        { label: 'Конструкція', value: CARPORT_TYPES.get(p.type) ?? null },
        attrRow(p, 'bundle'),
        { label: 'Строки монтажу', value: null },
      ];
    default:
      return [];
  }
}

/** Повна таблиця: усі attrs, загальні поля, рядки 03 §4 без даних — без дублів підписів. */
export function fullRows(p: Product): Row[] {
  const rows: Row[] = Object.keys(p.attrs).map((key) => attrRow(p, key, ATTR_LABELS[key] ?? key));
  // Однакові підписи (потужність панелі й інвертора) не зустрічаються в одного товару; захист від дублів:
  const seen = new Set(rows.map((r) => r.label));
  const add = (row: Row) => {
    if (!seen.has(row.label)) {
      rows.push(row);
      seen.add(row.label);
    }
  };
  add({ label: 'Бренд', value: p.brand });
  add({ label: 'Країна', value: p.country });
  add({ label: 'Гарантія', value: p.warranty });
  for (const r of keyRows(p)) add(r);
  return rows;
}

/* ---------- перехресний блок (ТЗ §5) ---------- */

export function crossTitle(p: Product): string {
  if (p.level === 1 && p.attrs.current === 'DC') return 'Додайте накопичувач, якщо мережі не вистачає';
  if (p.level === 3) return 'Заряджайте від сонця';
  if (p.level === 4) return 'Додайте зарядні станції';
  return 'Разом працює краще';
}

export const formatKw = (n: number) => formatUnit(n, 'кВт');
