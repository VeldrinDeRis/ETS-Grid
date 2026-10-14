/** @jsxImportSource preact */
// Кошик /koshyk/ (SPEC-005 §3.2, §4, §5).
import { useEffect, useRef, useState } from "preact/hooks";
import {
  add,
  QTY_MAX,
  QTY_MIN,
  remove,
  setQty,
  setTurnkey,
  totals,
} from "../../lib/cart";
import { list as recentList } from "../../lib/recent";
import { routes } from "../../lib/routes";
import type { LevelLink, ShopProduct } from "../../lib/shop-data";
import type { CartItem } from "../../lib/storage";
import { track } from "../../lib/track";
import {
  DemoBadge,
  LevelTiles,
  MiniCard,
  money,
  Placeholder,
  Thumb,
  useCart,
} from "./shared";

interface Props {
  products: ShopProduct[];
  levels: LevelLink[];
}

const ADAPTER = "cable-gbt-type2";
const canToggle = (p: ShopProduct) =>
  p.price_equipment !== null && p.price_turnkey_from !== null;

function QtyControl({
  item,
  product,
}: {
  item: CartItem;
  product: ShopProduct;
}) {
  const [draft, setDraft] = useState(String(item.qty));
  useEffect(() => setDraft(String(item.qty)), [item.qty]);
  const change = (n: number) => setQty(item.slug, item.turnkey, n);
  return (
    <div class="qty" role="group" aria-label={`Кількість: ${product.name}`}>
      <button
        type="button"
        class="qty__btn"
        aria-label={`Зменшити кількість: ${product.name}`}
        aria-disabled={item.qty <= QTY_MIN ? "true" : undefined}
        onClick={() => item.qty > QTY_MIN && change(item.qty - 1)}
      >
        −
      </button>
      <input
        class="qty__input num"
        type="number"
        inputMode="numeric"
        min={QTY_MIN}
        max={QTY_MAX}
        value={draft}
        aria-label={`Кількість, шт.: ${product.name}`}
        onInput={(e) => setDraft(e.currentTarget.value)}
        onChange={(e) => {
          const n = Number(e.currentTarget.value);
          change(
            Number.isFinite(n) && e.currentTarget.value !== "" ? n : item.qty,
          );
          setDraft(
            String(
              Math.min(QTY_MAX, Math.max(QTY_MIN, Math.round(n) || item.qty)),
            ),
          );
        }}
      />
      <button
        type="button"
        class="qty__btn"
        aria-label={`Збільшити кількість: ${product.name}`}
        aria-disabled={item.qty >= QTY_MAX ? "true" : undefined}
        onClick={() => item.qty < QTY_MAX && change(item.qty + 1)}
      >
        +
      </button>
    </div>
  );
}

function CartLine({
  item,
  product,
  onRemoved,
}: {
  item: CartItem;
  product: ShopProduct | undefined;
  onRemoved: () => void;
}) {
  const removeButton = (name: string) => (
    <button
      aria-label={`Видалити: ${name}`}
      type="button"
      class="shop-link"
      onClick={() => {
        remove(item.slug, item.turnkey);
        onRemoved();
      }}
    >
      Видалити
    </button>
  );
  if (!product || product.price_equipment === null) {
    return (
      <li class="cart-line cart-line--gone" data-cart-line={item.slug}>
        <p class="cart-line__gone">Товар більше недоступний</p>
        {removeButton(product?.name ?? item.slug)}
      </li>
    );
  }
  const unit =
    item.turnkey && product.price_turnkey_from !== null
      ? product.price_turnkey_from
      : product.price_equipment;
  const install = canToggle(product)
    ? product.price_turnkey_from! - product.price_equipment
    : null;
  return (
    <li
      class="cart-line"
      data-cart-line={item.slug}
      data-turnkey={String(item.turnkey)}
    >
      <Thumb product={product} />
      <div class="cart-line__main">
        <h3 class="cart-line__title">
          <a href={product.url}>{product.name}</a>
        </h3>
        <p class="cart-line__unit num">
          {money(unit)} за шт.{item.turnkey ? " з монтажем" : ""}
        </p>
        {install !== null && (
          <label class="shop-check">
            <input
              type="checkbox"
              checked={item.turnkey}
              onChange={(e) =>
                setTurnkey(item.slug, item.turnkey, e.currentTarget.checked)
              }
              data-turnkey-toggle
            />
            <span>
              З монтажем <span class="num">+{money(install)}</span>
            </span>
          </label>
        )}
      </div>
      <div class="cart-line__side">
        <QtyControl item={item} product={product} />
        <p class="cart-line__sum num" data-line-sum>
          {money(unit * item.qty)}
        </p>
        {removeButton(product.name)}
      </div>
    </li>
  );
}

function EmptyCart({ products, levels }: Props) {
  const recent = recentList(4)
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is ShopProduct => p !== undefined);
  return (
    <div class="shop-empty" data-cart-empty>
      <h2>Кошик порожній</h2>
      <p>Оберіть розділ — допоможемо підібрати обладнання.</p>
      <LevelTiles levels={levels} />
      {recent.length > 0 && (
        <section class="shop-block" aria-labelledby="cart-recent-title">
          <h2 id="cart-recent-title">Недавно переглянуті</h2>
          <div class="shop-minis">
            {recent.map((p) => (
              <MiniCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Extras({
  list,
  products,
}: {
  list: CartItem[];
  products: ShopProduct[];
}) {
  const inCart = new Set(list.map((i) => i.slug));
  const cartProducts = list
    .map((i) => products.find((p) => p.slug === i.slug))
    .filter((p): p is ShopProduct => p !== undefined);
  const related = [...new Set(cartProducts.flatMap((p) => p.related))]
    .filter((s) => !inCart.has(s))
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is ShopProduct => p !== undefined);
  const adapter = products.find((p) => p.slug === ADAPTER);
  const offerAdapter =
    adapter &&
    !inCart.has(ADAPTER) &&
    cartProducts.some((p) => p.level === 1 && p.connectors.includes("type2"));
  const addButton = (p: ShopProduct) =>
    p.sale_mode === "cart" ? (
      <button
        aria-label={`До кошика: ${p.name}`}
        type="button"
        class="shop-btn shop-btn--small"
        onClick={() => {
          add(p.slug, false);
          track("add_to_cart", {
            slug: p.slug,
            turnkey: false,
            source: "cart_extras",
          });
        }}
      >
        До кошика
      </button>
    ) : (
      <a
        class="shop-btn shop-btn--small"
        href={p.quoteUrl}
        aria-label={`Розрахувати: ${p.name}`}
      >
        Розрахувати
      </a>
    );
  return (
    <section
      class="shop-block"
      aria-labelledby="cart-extras-title"
      data-cart-extras
    >
      <h2 id="cart-extras-title">Додайте до замовлення</h2>
      <div class="shop-minis">
        {offerAdapter && (
          <MiniCard
            product={adapter}
            note="Для авто з китайським розʼємом GB/T"
            action={addButton(adapter)}
          />
        )}
        {related.map((p) => (
          <MiniCard key={p.slug} product={p} action={addButton(p)} />
        ))}
      </div>
      {related.length === 0 && (
        <p class="shop-note" data-extras-placeholder>
          <Placeholder label="[АКСЕСУАРИ]" /> Аксесуари до товарів кошика —
          список надасть замовник.
        </p>
      )}
    </section>
  );
}

export default function Cart({ products, levels }: Props) {
  const list = useCart();
  const heading = useRef<HTMLHeadingElement>(null);
  if (list === null) return <div class="shop" />;
  if (list.length === 0)
    return <EmptyCart products={products} levels={levels} />;

  const t = totals(list, products);
  const count = list.reduce((n, i) => n + i.qty, 0);
  return (
    <div class="shop cart" data-ready="true">
      <div class="cart__items">
        <h2 class="shop-sr" id="cart-items-title" tabIndex={-1} ref={heading}>
          Товари в кошику: {count}
        </h2>
        <ul role="list" class="cart__list" aria-labelledby="cart-items-title">
          {list.map((item) => (
            <CartLine
              key={`${item.slug}:${item.turnkey}`}
              item={item}
              product={products.find((p) => p.slug === item.slug)}
              onRemoved={() => heading.current?.focus()}
            />
          ))}
        </ul>
      </div>

      <aside class="shop-summary" aria-labelledby="cart-summary-title">
        <h2 id="cart-summary-title">Разом</h2>
        <dl class="shop-totals num" aria-live="polite" data-totals>
          <div>
            <dt>Обладнання</dt>
            <dd data-total-equipment>{money(t.equipment)}</dd>
          </div>
          <div>
            <dt>Монтаж</dt>
            <dd data-total-installation>
              {t.installation > 0 ? money(t.installation) : "—"}
            </dd>
          </div>
          <div class="shop-totals__total">
            <dt>До сплати</dt>
            <dd data-total>
              {money(t.total)} {t.demo && <DemoBadge />}
            </dd>
          </div>
        </dl>
        <div class="promo">
          <label for="promo-code">Промокод</label>
          <div class="promo__row">
            <input
              id="promo-code"
              type="text"
              disabled
              aria-describedby="promo-note"
              data-promo
            />
            <button type="button" class="shop-btn shop-btn--small" disabled>
              Застосувати
            </button>
          </div>
          <p id="promo-note" class="shop-note">
            Промокоди зʼявляться в бойовій версії.
          </p>
        </div>
        <a
          class="shop-btn shop-btn--primary"
          href={routes.checkout}
          data-checkout-link
        >
          Оформити замовлення
        </a>
        <p class="shop-note">
          Без реєстрації. Доставка Новою Поштою або з монтажем.
        </p>
      </aside>
      <Extras list={list} products={products} />
    </div>
  );
}
