// Оформлення замовлення (SPEC-005 §3.3, §3.5): перевірка полів, номер, контракт замовлення для CRM.
import { totals, type PricedProduct } from './cart';
import { normalizePhone, validateLead } from './leads';
import type { CartItem } from './storage';

export type DeliveryMethod = 'np_branch' | 'np_locker' | 'np_courier' | 'install' | 'pickup';
export type PaymentMethod = 'card' | 'parts_mono' | 'parts_privat' | 'cod' | 'invoice';

export interface CheckoutFields {
  name?: string;
  phone?: string;
  email?: string;
  delivery?: DeliveryMethod | string;
  city?: string;
  branch?: string;
  address?: string;
  payment?: PaymentMethod | string;
  company?: string;
  edrpou?: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutFields, string>>;

const blank = (v?: string) => (v ?? '').trim() === '';

export function validateCheckout(f: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (blank(f.name)) errors.name = 'Вкажіть імʼя';
  const phone = validateLead({ phone: f.phone }).phone;
  if (phone) errors.phone = phone;
  if (!blank(f.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email!.trim())) errors.email = 'Перевірте адресу пошти';
  const d = f.delivery;
  if ((d === 'np_branch' || d === 'np_locker' || d === 'np_courier' || d === 'install') && blank(f.city)) errors.city = 'Вкажіть місто';
  if ((d === 'np_branch' || d === 'np_locker') && blank(f.branch)) errors.branch = 'Вкажіть номер відділення';
  if ((d === 'np_courier' || d === 'install') && blank(f.address)) errors.address = 'Вкажіть адресу';
  if (f.payment === 'invoice') {
    if (blank(f.company)) errors.company = 'Вкажіть назву компанії';
    if (!/^\d{8}$/.test((f.edrpou ?? '').trim())) errors.edrpou = 'ЄДРПОУ — 8 цифр';
  }
  return errors;
}

/** sessionStorage: номер, способи доставки й оплати для «Дякуємо» — без персональних даних (SPEC-005 §3.4). */
export const LAST_ORDER_KEY = 'etsgrid:last-order';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function orderId(now: Date = new Date(), random: () => number = Math.random): string {
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `ETS-${ymd}-${Array.from({ length: 4 }, () => ALPHABET[Math.floor(random() * ALPHABET.length)]).join('')}`;
}

const clean = (v?: string) => (blank(v) ? null : v!.trim());

export function buildOrder(input: {
  fields: CheckoutFields;
  items: CartItem[];
  products: PricedProduct[];
  sourceUrl: string;
  utm: Record<string, string> | null;
  now?: Date;
  random?: () => number;
}) {
  const now = input.now ?? new Date();
  const f = input.fields;
  const t = totals(input.items, input.products);
  return {
    type: 'order' as const,
    id: orderId(now, input.random),
    created_at: now.toISOString(),
    customer: { name: clean(f.name), phone: normalizePhone(f.phone ?? '') ?? '', email: clean(f.email) },
    delivery: { method: f.delivery ?? null, city: clean(f.city), branch: clean(f.branch), address: clean(f.address) },
    payment: { method: f.payment ?? null, company: clean(f.company), edrpou: clean(f.edrpou) },
    items: input.items
      .map((i) => {
        const p = input.products.find((x) => x.slug === i.slug);
        return p
          ? { slug: i.slug, qty: i.qty, turnkey: i.turnkey, price_equipment: p.price_equipment, price_turnkey_from: p.price_turnkey_from, demo: p.demo }
          : null;
      })
      .filter((x) => x !== null),
    totals: { equipment: t.equipment, installation: t.installation, total: t.total },
    source_url: input.sourceUrl,
    utm: input.utm,
  };
}
