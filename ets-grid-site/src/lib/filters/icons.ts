// Іконки значень головного фільтра «Тип» (SPEC-002 §3.9 А, ревізія 5; ТЗ §9.1 п. 1 «візуальні чипи з іконкою»).
// Рівень → токен type → імʼя іконки з src/lib/icons.ts. filters.json не чіпаємо — він копія 03 §2.
import type { IconName } from '../icons';

export const TYPE_ICON = {
  charging: {
    wall_ac: 'wall-charger',
    pedestal_ac: 'pedestal',
    dc: 'dc-fast',
    split_dc: 'split-dc',
    portable: 'portable',
    dc_battery: 'charger-battery',
    cable: 'cable',
  },
  solar: {
    panel: 'panel',
    inverter: 'inverter',
    mounting: 'mounting',
    kit: 'kit',
  },
  battery: {
    home_wall: 'battery-wall',
    home_rack: 'battery-rack',
    commercial: 'battery-cabinet',
    industrial: 'container',
    portable: 'powerbank',
  },
  carport: {
    single: 'carport-single',
    double: 'carport-double',
    y: 'carport-y',
    row: 'carport-row',
  },
} as const satisfies Record<string, Record<string, IconName>>;

export type TypeIconLevel = keyof typeof TYPE_ICON;

/** Імʼя іконки для значення головного фільтра; `null`, якщо рівень або токен невідомі. */
export function typeIcon(level: string, token: string): IconName | null {
  const map = (TYPE_ICON as Record<string, Record<string, IconName>>)[level];
  return map?.[token] ?? null;
}
