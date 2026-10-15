/** @jsxImportSource preact */
// Спільне для островів магазину (SPEC-005): підписка на кошик і порівняння, мініатюра, плитки рівнів.
import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { items } from "../../lib/cart";
import { COMPARE_CHANGE_EVENT, list as compareList } from "../../lib/compare";
import { formatPrice } from "../../lib/format";
import type { LevelTile, ShopProduct, ThumbData } from "../../lib/shop-data";
import { CART_CHANGE_EVENT, KEYS, type CartItem } from "../../lib/storage";
import "../../styles/shop-ui.css";
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

/** Мініатюра товару — одна на весь магазин (SPEC-005 §3.8, AC-13): кадр 1:1 і підпис «Ілюстративне фото» під ним.
 *  Розмітку повторює src/scripts/product.ts для «Недавно переглянуті» (класи .pthumb — src/styles/shop-ui.css). */
export function ProductThumb({ thumb }: { thumb: ThumbData | null }) {
  return (
    <figure class="pthumb" data-product-thumb>
      <span class="pthumb__frame">
        {thumb ? (
          <picture>
            {thumb.avif && <source type="image/avif" srcset={thumb.avif} sizes="96px" />}
            <img
              src={thumb.src}
              srcset={thumb.webp}
              sizes={thumb.webp ? "96px" : undefined}
              alt=""
              width="96"
              height="96"
              loading="lazy"
              decoding="async"
            />
          </picture>
        ) : (
          <span class="placeholder" title="Дані надасть замовник">[ФОТО]</span>
        )}
      </span>
      {thumb?.illustrative && <figcaption class="pthumb__note">Ілюстративне фото</figcaption>}
    </figure>
  );
}

export const Thumb = ({ product }: { product: ShopProduct }) => <ProductThumb thumb={product.thumb} />;

/** Плитки рівнів у граматиці героя (SPEC-005 §3.8, AC-14): іконка, назва, «від … ₴», вогник ::after. */
export function LevelTiles({ levels }: { levels: LevelTile[] }) {
  return (
    <ul role="list" class="shop-tiles">
      {levels.map((l) => (
        <li key={l.id}>
          <a class="shop-tile" href={l.url} data-shop-tile>
            <svg
              class="icon"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d={l.icon} />
            </svg>
            <span class="shop-tile__name">{l.name}</span>
            <span class="shop-tile__price num">{l.from}</span>
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
