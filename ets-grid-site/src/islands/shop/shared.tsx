/** @jsxImportSource preact */
// Спільне для островів магазину (SPEC-005): підписка на кошик і порівняння, мініатюра, плитки рівнів.
import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { items } from "../../lib/cart";
import { COMPARE_CHANGE_EVENT, list as compareList } from "../../lib/compare";
import { formatPrice } from "../../lib/format";
import type { LevelLink, ShopProduct } from "../../lib/shop-data";
import { CART_CHANGE_EVENT, KEYS, type CartItem } from "../../lib/storage";
import "./shop.css";

/** Стан зі сховища; null — ще до гідрації (сервер не знає вмісту localStorage). */
function useStored<T>(readFn: () => T, event: string, key: string): T | null {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    const sync = () => setValue(readFn());
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === key) sync();
    };
    window.addEventListener(event, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(event, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return value;
}

export const useCart = (): CartItem[] | null =>
  useStored(items, CART_CHANGE_EVENT, KEYS.cart);
export const useCompare = (): string[] | null =>
  useStored(compareList, COMPARE_CHANGE_EVENT, KEYS.compare);

export const money = (n: number) => formatPrice(n) ?? "";

export function DemoBadge() {
  return <span class="shop-demo">демо-ціна</span>;
}

export function Placeholder({ label }: { label: string }) {
  return (
    <span class="shop-ph" title="Дані надасть замовник">
      {label}
    </span>
  );
}

export function Thumb({ product }: { product: ShopProduct }) {
  return (
    <div class="shop-thumb">
      {product.image ? (
        <img
          src={product.image.src}
          alt=""
          width="96"
          height="96"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span aria-hidden="true">{product.levelName}</span>
      )}
    </div>
  );
}

export function LevelTiles({ levels }: { levels: LevelLink[] }) {
  return (
    <ul role="list" class="shop-levels">
      {levels.map((l) => (
        <li key={l.id}>
          <a class="shop-level" href={l.url}>
            <span class="shop-level__name">{l.name}</span>
            <span class="shop-level__short">{l.short}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Мала картка: мініатюра, назва-посилання, ціна, дія (для «Недавно переглянуті» і «Додайте до замовлення»). */
export function MiniCard({
  product,
  note,
  action,
}: {
  product: ShopProduct;
  note?: string;
  action?: ComponentChildren;
}) {
  const price = product.price_equipment ?? product.price_turnkey_from;
  return (
    <article class="shop-mini">
      <Thumb product={product} />
      <div class="shop-mini__body">
        <h3 class="shop-mini__title">
          <a href={product.url}>{product.name}</a>
        </h3>
        {note && <p class="shop-mini__note">{note}</p>}
        <p class="shop-mini__price num">
          {price === null
            ? "Ціна за розрахунком"
            : product.price_equipment === null
              ? `під ключ від ${money(price)}`
              : money(price)}
          {price !== null && product.demo && <DemoBadge />}
        </p>
        {action}
      </div>
    </article>
  );
}
