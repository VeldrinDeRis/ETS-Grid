// Аналітика (SPEC-001 §3.7). У мокапі — лише console.debug; у бойовому сайті тут буде GA4/GTM (ТЗ §10.4).

export type TrackEvent =
  | 'hero_cta_click'
  | 'level_tile_click'
  | 'filter_apply'
  | 'picker_complete'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'quote_submit'
  | 'phone_click'
  | 'messenger_click'
  | 'compare_add';

export function track(event: TrackEvent, params: Record<string, unknown> = {}): void {
  try {
    console.debug('[track]', event, params);
  } catch {
    // аналітика ніколи не ламає сторінку
  }
}
