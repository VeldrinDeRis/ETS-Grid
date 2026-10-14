// Поведінка форм заявок (SPEC-009 §3.3–3.5, §4).
import { buildLead, describePicker, formatPhone, normalizePhone, UTM_KEY, validateLead, type LeadContext, type LeadFields, type LeadKind } from '../lib/leads';
import { track } from '../lib/track';

const MIN_FILL_MS = 3000;
const PICKER_LEVEL: Record<string, string> = { power: 'charging', charging: 'charging', solar: 'solar', battery: 'battery', carport: 'carport' };

function sessionUtm(): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

function fieldsOf(form: HTMLFormElement): LeadFields {
  const data = new FormData(form);
  const str = (k: string) => (data.get(k) as string | null) ?? '';
  return {
    name: str('name'),
    phone: str('phone'),
    object_type: str('object_type'),
    interests: data.getAll('interests') as string[],
    messenger: str('messenger'),
    city: str('city'),
    comment: str('comment'),
  };
}

function checkInterest(form: HTMLFormElement, level: string | undefined) {
  if (!level) return;
  const box = form.querySelector<HTMLInputElement>(`input[name="interests"][value="${level}"]`);
  if (box && box.type === 'checkbox') box.checked = true;
}

function setup(form: HTMLFormElement) {
  const shownAt = Date.now();
  const kind = form.dataset.kind as LeadKind;
  const ctx = JSON.parse(form.querySelector('[data-lead-context]')?.textContent ?? '{}') as LeadContext & {
    products: Record<string, { name: string; level: string; price: string }>;
  };
  const params = new URLSearchParams(location.search);
  let product: string | null = null;
  let picker: Record<string, string> | null = null;

  // Товар (?product=) і параметри підбірника (?picker=) — тільки у формі розрахунку.
  if (kind === 'quote') {
    const slug = params.get('product');
    if (slug && ctx.products[slug]) {
      product = slug;
      const p = ctx.products[slug];
      form.querySelector<HTMLElement>('[data-lead-product-text]')!.textContent = `${p.name} · ${p.price}`;
      form.querySelector<HTMLElement>('[data-lead-product]')!.hidden = false;
      checkInterest(form, p.level);
    }
    if (params.get('picker')) {
      const raw = Object.fromEntries([...params].filter(([k]) => !k.startsWith('utm_') && k !== 'product' && k !== 'interest'));
      const text = describePicker(raw, ctx);
      if (text) {
        picker = raw;
        form.querySelector<HTMLElement>('[data-lead-picker-text]')!.textContent = text;
        form.querySelector<HTMLElement>('[data-lead-picker]')!.hidden = false;
        checkInterest(form, PICKER_LEVEL[raw.picker]);
      }
    }
    checkInterest(form, params.get('interest') ?? undefined);
  }

  form.querySelector('[data-lead-picker-remove]')?.addEventListener('click', () => {
    picker = null;
    form.querySelector<HTMLElement>('[data-lead-picker]')!.hidden = true;
    form.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  });

  const touched = new Set<string>();
  const showErrors = (onlyTouched: boolean) => {
    const errors = validateLead(fieldsOf(form));
    for (const el of form.querySelectorAll<HTMLElement>('[data-error-for]')) {
      const name = el.dataset.errorFor as keyof LeadFields;
      const message = !onlyTouched || touched.has(name) ? (errors[name] ?? '') : '';
      el.textContent = message;
      const input = form.querySelector<HTMLElement>(`[name="${name}"]`);
      if (input) {
        if (message) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
    }
    return errors;
  };

  const phone = form.querySelector<HTMLInputElement>('input[name="phone"]');
  phone?.addEventListener('blur', () => {
    const normalized = normalizePhone(phone.value);
    if (normalized) phone.value = formatPhone(normalized);
  });

  form.addEventListener('focusout', (e) => {
    const name = (e.target as HTMLInputElement).name;
    if (name) {
      touched.add(name);
      showErrors(true);
    }
  });
  form.addEventListener('input', (e) => {
    const name = (e.target as HTMLInputElement).name;
    if (name && touched.has(name)) showErrors(true);
  });

  const summary = form.querySelector<HTMLElement>('[data-lead-summary]')!;
  const summaryList = form.querySelector<HTMLElement>('[data-lead-summary-list]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-lead-submit]')!;
  let sent = false;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (sent) return;
    const errors = showErrors(false);
    const entries = Object.entries(errors);
    if (entries.length) {
      summaryList.replaceChildren(
        ...entries.map(([name, message]) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          const input = form.querySelector<HTMLElement>(`[name="${name}"]`);
          a.href = `#${input?.id ?? ''}`;
          a.textContent = message!;
          a.addEventListener('click', (ev) => {
            ev.preventDefault();
            input?.focus();
          });
          li.append(a);
          return li;
        }),
      );
      summary.hidden = false;
      summary.focus();
      return;
    }
    summary.hidden = true;

    // Антиспам: заповнена пастка або надто швидке надсилання — тихо відкидаємо.
    const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]');
    if ((honeypot && honeypot.value) || Date.now() - shownAt < MIN_FILL_MS) return;

    sent = true;
    submit.disabled = true;
    submit.textContent = 'Надсилаємо…';
    const lead = buildLead({
      kind,
      fields: fieldsOf(form),
      product,
      picker,
      sourceUrl: location.pathname,
      utm: sessionUtm(),
    });
    setTimeout(() => {
      console.info('[lead]', JSON.stringify(lead)); // TODO: integration — CRM (ТЗ §10.2)
      track('quote_submit', { kind, has_picker: Boolean(picker), has_product: Boolean(product) });
      location.assign(`/dyakuyemo/?type=lead&id=${encodeURIComponent(lead.id)}`);
    }, 400);
  });
}

for (const form of document.querySelectorAll<HTMLFormElement>('[data-lead-form]')) setup(form);
