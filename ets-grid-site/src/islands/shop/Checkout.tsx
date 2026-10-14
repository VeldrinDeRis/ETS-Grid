/** @jsxImportSource preact */
// Оформлення /oformlennya/ (SPEC-005 §3.3–3.5): одна сторінка, 3 кроки, гостьове замовлення.
import { useEffect, useRef, useState } from "preact/hooks";
import { clear, totals } from "../../lib/cart";
import { formatPhone, normalizePhone, UTM_KEY } from "../../lib/leads";
import {
  buildOrder,
  LAST_ORDER_KEY,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutFields,
} from "../../lib/order";
import { routes } from "../../lib/routes";
import type { ShopProduct } from "../../lib/shop-data";
import { track } from "../../lib/track";
import { DemoBadge, money, Placeholder, useCart } from "./shared";

interface Props {
  products: ShopProduct[];
}

const DELIVERY = [
  { value: "np_branch", label: "Нова Пошта — відділення" },
  { value: "np_locker", label: "Нова Пошта — поштомат" },
  { value: "np_courier", label: "Курʼєр Нової Пошти" },
  { value: "install", label: "Доставка + монтаж" },
  { value: "pickup", label: "Самовивіз" },
] as const;

const PAYMENT = [
  { value: "card", label: "Онлайн-картою" },
  { value: "parts_mono", label: "Частинами — Monobank" },
  { value: "parts_privat", label: "Частинами — ПриватБанк" },
  { value: "cod", label: "Накладений платіж" },
  { value: "invoice", label: "Рахунок для юрособи" },
] as const;

const FIELD_ORDER: (keyof CheckoutFields)[] = [
  "name",
  "phone",
  "email",
  "city",
  "branch",
  "address",
  "company",
  "edrpou",
];

function sessionUtm(): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

function Field(props: {
  name: keyof CheckoutFields;
  label: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: "tel" | "email" | "numeric" | "text";
  fields: CheckoutFields;
  errors: CheckoutErrors;
  onValue: (name: keyof CheckoutFields, value: string) => void;
  onBlur?: (name: keyof CheckoutFields) => void;
}) {
  const {
    name,
    label,
    required,
    type = "text",
    autoComplete,
    inputMode,
    fields,
    errors,
    onValue,
    onBlur,
  } = props;
  const id = `co-${name}`;
  const error = errors[name];
  return (
    <div class="co-field">
      <label for={id}>
        {label}{" "}
        {required ? (
          <span class="co-req">(обовʼязково)</span>
        ) : (
          <span class="co-req">(необовʼязково)</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={fields[name] ?? ""}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onInput={(e) => onValue(name, e.currentTarget.value)}
        onBlur={() => onBlur?.(name)}
      />
      {error && (
        <p class="co-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function Radios(props: {
  name: "delivery" | "payment";
  options: readonly { value: string; label: string }[];
  value: string;
  onValue: (v: string) => void;
}) {
  return (
    <div class="co-options">
      {props.options.map((o) => (
        <label class="co-option" key={o.value}>
          <input
            type="radio"
            name={props.name}
            value={o.value}
            checked={props.value === o.value}
            onChange={() => props.onValue(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export default function Checkout({ products }: Props) {
  const list = useCart();
  const [fields, setFields] = useState<CheckoutFields>({
    delivery: "np_branch",
    payment: "card",
  });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const started = useRef(false);
  const summary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (started.current || !list || list.length === 0 || sending) return;
    started.current = true;
    track("begin_checkout", {
      value: totals(list, products).total,
      items: list.length,
    });
  }, [list]);

  if (list === null) return <div class="shop" />;
  if (list.length === 0 && !sending) {
    return (
      <div class="shop-empty" data-checkout-empty>
        <h2>Кошик порожній</h2>
        <p>Оформлювати поки нічого.</p>
        <p>
          <a class="shop-btn" href={routes.cart}>
            Повернутися до кошика
          </a>
        </p>
      </div>
    );
  }

  const t = totals(list, products);
  const recheck = (next: CheckoutFields) => {
    if (submitted) setErrors(validateCheckout(next));
  };
  const onValue = (name: keyof CheckoutFields, value: string) => {
    const next = { ...fields, [name]: value };
    setFields(next);
    recheck(next);
  };
  const onPhoneBlur = () => {
    const normalized = normalizePhone(fields.phone ?? "");
    if (normalized) onValue("phone", formatPhone(normalized));
  };
  const common = { fields, errors, onValue };
  const d = fields.delivery;

  const submit = (e: Event) => {
    e.preventDefault();
    if (sending) return;
    const found = validateCheckout(fields);
    setSubmitted(true);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    setSending(true);
    const order = buildOrder({
      fields,
      items: list,
      products,
      sourceUrl: location.pathname,
      utm: sessionUtm(),
    });
    console.info("[order]", JSON.stringify(order));
    track("purchase", {
      id: order.id,
      value: order.totals.total,
      items: order.items.length,
      payment: order.payment.method,
    });
    try {
      sessionStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify({
          id: order.id,
          delivery: order.delivery.method,
          payment: order.payment.method,
        }),
      );
    } catch {
      // «Дякуємо» покаже загальні кроки
    }
    clear();
    location.assign(
      `${routes.thanks}?type=order&id=${encodeURIComponent(order.id)}`,
    );
  };

  const errorList = FIELD_ORDER.filter((k) => errors[k]);
  return (
    <div class="shop checkout" data-ready="true">
      <form class="co-form" noValidate onSubmit={submit} data-checkout-form>
        <div
          class="co-summary"
          role="alert"
          tabIndex={-1}
          ref={summary}
          hidden={errorList.length === 0}
          data-checkout-errors
        >
          <p>Перевірте, будь ласка:</p>
          <ul>
            {errorList.map((k) => (
              <li key={k}>
                <a
                  href={`#co-${k}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    document.getElementById(`co-${k}`)?.focus();
                  }}
                >
                  {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <fieldset class="co-step">
          <legend>
            <span class="co-step__n">1</span> Контакти
          </legend>
          <Field
            {...common}
            name="name"
            label="Імʼя"
            required
            autoComplete="name"
          />
          <Field
            {...common}
            name="phone"
            label="Телефон"
            required
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            onBlur={onPhoneBlur}
          />
          <Field
            {...common}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
          />
        </fieldset>

        <fieldset class="co-step">
          <legend>
            <span class="co-step__n">2</span> Доставка
          </legend>
          <Radios
            name="delivery"
            options={DELIVERY}
            value={d ?? ""}
            onValue={(v) => onValue("delivery", v)}
          />
          {d !== "pickup" && (
            <Field
              {...common}
              name="city"
              label="Місто"
              required
              autoComplete="address-level2"
            />
          )}
          {(d === "np_branch" || d === "np_locker") && (
            <Field
              {...common}
              name="branch"
              label={d === "np_locker" ? "Номер поштомата" : "Номер відділення"}
              required
              inputMode="numeric"
            />
          )}
          {(d === "np_courier" || d === "install") && (
            <Field
              {...common}
              name="address"
              label="Адреса"
              required
              autoComplete="street-address"
            />
          )}
          {d === "pickup" && (
            <p class="co-note">
              Самовивіз зі складу: <Placeholder label="[АДРЕСА]" />
            </p>
          )}
          {d === "install" && (
            <p class="co-note">
              Менеджер узгодить дату монтажу після підтвердження замовлення.
            </p>
          )}
          <p class="co-note co-note--todo">
            Пошук відділень і вартість доставки Новою Поштою — у бойовій версії
            (TODO: integration).
          </p>
        </fieldset>

        <fieldset class="co-step">
          <legend>
            <span class="co-step__n">3</span> Оплата
          </legend>
          <Radios
            name="payment"
            options={PAYMENT}
            value={fields.payment ?? ""}
            onValue={(v) => onValue("payment", v)}
          />
          {fields.payment === "invoice" && (
            <>
              <Field
                {...common}
                name="company"
                label="Назва компанії"
                required
                autoComplete="organization"
              />
              <Field
                {...common}
                name="edrpou"
                label="ЄДРПОУ"
                required
                inputMode="numeric"
              />
            </>
          )}
          <p class="co-note co-note--todo">
            Платіжний провайдер підключимо в бойовій версії (TODO: integration).
            Даних картки тут не вводять.
          </p>
        </fieldset>

        <button
          type="submit"
          class="shop-btn shop-btn--primary"
          disabled={sending}
          data-checkout-submit
        >
          {sending ? "Оформлюємо…" : "Підтвердити замовлення"}
        </button>
        <p class="shop-note">Демо: замовлення нікуди не надсилається.</p>
      </form>

      <aside class="shop-summary" aria-labelledby="co-order-title">
        <h2 id="co-order-title">Ваше замовлення</h2>
        <ul role="list" class="co-items">
          {list.map((i) => {
            const p = products.find((x) => x.slug === i.slug);
            if (!p || p.price_equipment === null) return null;
            const unit =
              i.turnkey && p.price_turnkey_from !== null
                ? p.price_turnkey_from
                : p.price_equipment;
            return (
              <li key={`${i.slug}:${i.turnkey}`}>
                <span>
                  {p.name}
                  {i.turnkey ? ", з монтажем" : ""} × {i.qty}
                </span>
                <span class="num">{money(unit * i.qty)}</span>
              </li>
            );
          })}
        </ul>
        <dl class="shop-totals num">
          <div>
            <dt>Обладнання</dt>
            <dd>{money(t.equipment)}</dd>
          </div>
          <div>
            <dt>Монтаж</dt>
            <dd>{t.installation > 0 ? money(t.installation) : "—"}</dd>
          </div>
          <div class="shop-totals__total">
            <dt>До сплати</dt>
            <dd data-total>
              {money(t.total)} {t.demo && <DemoBadge />}
            </dd>
          </div>
        </dl>
        <a class="shop-link" href={routes.cart}>
          Змінити кошик
        </a>
      </aside>
    </div>
  );
}
