// Бейдж і 3 ключові характеристики картки в лістингу (SPEC-002 §3.5, 03 §4).
import filtersJson from '../../data/filters.json';
import { formatNumber, formatUnit, NBSP } from '../format';
import { plural } from '../plural';
import type { Product } from '../schema';
import type { FiltersFile } from './config';

const config = filtersJson as unknown as FiltersFile;
const PLACEHOLDER = /\[[^\]]+\]/;

function labelsOf(level: keyof FiltersFile['levels'], key: string): Map<string, string> {
  const facet = config.levels[level].facets.find((f) => f.key === key);
  return new Map(Array.isArray(facet?.values) ? facet.values : []);
}

const CONNECTORS = labelsOf('charging', 'connectors');
const INVERTER_KIND = labelsOf('solar', 'inverter_kind');
const VOLTAGE = new Map([
  ['low', 'Низьковольтна'],
  ['high', 'Високовольтна'],
]);
const BUNDLE = new Map([
  ['ac', 'AC-зарядки'],
  ['dc', 'DC-зарядки'],
  ['battery', 'накопичувач'],
]);
const PURPOSE = new Map([
  ['home', 'Для дому'],
  ['business', 'Для бізнесу'],
]);

const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);
const str = (v: unknown): string | null => (typeof v === 'string' && !PLACEHOLDER.test(v) ? v : null);
const phases = (n: unknown) => (n === 1 ? '1 фаза' : n === 3 ? '3 фази' : null);

export function cardBadge(p: Product, labels: FiltersFile['labels'] = config.labels): string | null {
  if (p.type === 'dc_battery') return labels.badges.dc_battery;
  const connectors = Array.isArray(p.attrs.connectors) ? (p.attrs.connectors as string[]) : [];
  if (connectors.some((c) => c.startsWith('gbt'))) return labels.badges.gbt;
  const first = p.scenarios[0];
  return first ? (labels.scenarios[first] ?? null) : null;
}

export function keyChars(p: Product): string[] {
  const a = p.attrs;
  let chars: (string | null)[] = [];
  switch (p.level) {
    case 1: {
      const power = num(a.power_kw);
      const connectors = Array.isArray(a.connectors) ? [...new Set(a.connectors as string[])] : [];
      const input = num(a.input_min_kw);
      chars = [
        power === null ? null : formatUnit(power, 'кВт'),
        connectors.length ? connectors.map((c) => CONNECTORS.get(c) ?? c).join(' · ') : null,
        a.current === 'DC' ? (input === null ? null : `вхід від ${formatUnit(input, 'кВт')}`) : phases(a.phases),
      ];
      break;
    }
    case 2: {
      if (p.type === 'panel') {
        const w = num(a.panel_w);
        const eff = num(a.efficiency_pct);
        chars = [w === null ? null : formatUnit(w, 'Вт'), eff === null ? null : `ККД ${formatNumber(eff)}${NBSP}%`, str(a.technology)];
      } else if (p.type === 'inverter') {
        const kw = num(a.power_kw);
        chars = [kw === null ? null : formatUnit(kw, 'кВт'), phases(a.phases), INVERTER_KIND.get(String(a.inverter_kind)) ?? null];
      } else if (p.type === 'kit') {
        const kwp = num(a.kwp);
        chars = [
          kwp === null ? null : formatUnit(kwp, 'kWp'),
          PURPOSE.get(String(a.purpose)) ?? null,
          a.with_battery === true ? 'З батареєю' : a.with_battery === false ? 'Без батареї' : null,
        ];
      }
      break;
    }
    case 3: {
      const kwh = num(a.capacity_kwh);
      chars = [kwh === null ? null : formatUnit(kwh, 'кВт·год'), VOLTAGE.get(String(a.voltage)) ?? null, str(a.chemistry)];
      break;
    }
    case 4: {
      const places = num(a.places);
      const kwp = num(a.kwp);
      const bundle = Array.isArray(a.bundle) ? (a.bundle as string[]).map((b) => BUNDLE.get(b)).filter(Boolean) : [];
      chars = [
        places === null ? null : `${places}${NBSP}${plural(places, ['місце', 'місця', 'місць'])}`,
        kwp === null ? null : formatUnit(kwp, 'kWp'),
        bundle.length ? bundle.join(', ') : 'Лише навіс',
      ];
      break;
    }
  }
  return chars.filter((c): c is string => c !== null && !PLACEHOLDER.test(c)).slice(0, 3);
}
