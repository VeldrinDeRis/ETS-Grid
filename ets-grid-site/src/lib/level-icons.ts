// Значок рівня (DESIGN.md → Іконки): один набір Icon.astro.
import type { IconName } from '../components/layout/Icon.astro';
import type { LevelKey } from './schema';

export const LEVEL_ICON: Record<LevelKey, IconName> = {
  charging: 'station',
  solar: 'sun',
  battery: 'battery',
  carport: 'carport',
};
