/** @jsxImportSource preact */
// Порівняння /porivnyannya/ (SPEC-005 §3.6): до 4 товарів, «Тільки відмінності», групи рядків за рівнями.
import { useRef, useState } from "preact/hooks";
import { add } from "../../lib/cart";
import { COMPARE_LIMIT, remove } from "../../lib/compare";
import type { LevelTile, ShopProduct } from "../../lib/shop-data";
import { track } from "../../lib/track";
import {
  DemoBadge,
  LevelTiles,
  money,
  Placeholder,
  Thumb,
  useCompare,
} from "./shared";

interface Props {
  products: ShopProduct[];
  levels: LevelTile[];
}

interface Line {
  label: string;
  /** null — даних немає ([ДАНІ]); undefined — товар іншого рівня («—»). */
  cells: (string | null | undefined)[];
}

const MISSING = "[ДАНІ]";

function priceText(p: ShopProduct): string {
  if (p.price_equipment !== null) return money(p.price_equipment);
  if (p.price_turnkey_from !== null)
    return `під ключ від ${money(p.price_turnkey_from)}`;
  return "Ціна за розрахунком";
}

/** Рядки характеристик, згруповані за рівнями товарів у порівнянні. */
function groups(
  selected: ShopProduct[],
): { level: number; name: string; lines: Line[] }[] {
  const levels = [...new Set(selected.map((p) => p.level))].sort();
  return levels.map((level) => {
    const own = selected.filter((p) => p.level === level);
    const labels = [
      ...new Set(own.flatMap((p) => (p.rows ?? []).map((r) => r.label))),
    ];
    return {
      level,
      name: own[0].levelName,
      lines: labels.map((label) => ({
        label,
        cells: selected.map((p) =>
          p.level !== level
            ? undefined
            : ((p.rows ?? []).find((r) => r.label === label)?.value ?? null),
        ),
      })),
    };
  });
}

/** Рядок однаковий, якщо у всіх товарів цього рівня однакове значення (дані відсутні теж рахуються). */
const isSame = (line: Line) =>
  new Set(line.cells.filter((c) => c !== undefined).map((c) => c ?? MISSING))
    .size <= 1;

function Cell({ value }: { value: string | null | undefined }) {
  if (value === undefined) return <td class="cmp-dash">—</td>;
  if (value === null) {
    return (
      <td>
        <Placeholder label={MISSING} />
      </td>
    );
  }
  return <td>{value}</td>;
}

export default function Compare({ products, levels }: Props) {
  const slugs = useCompare();
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [status, setStatus] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  if (slugs === null) return <div class="shop" />;

  const selected = slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is ShopProduct => p !== undefined);
  if (selected.length === 0) {
    return (
      <div class="shop-empty" data-compare-empty>
        <h2>Порівнювати поки нічого</h2>
        <p>
          Додайте товари кнопкою «Порівняти» в каталозі — до {COMPARE_LIMIT}{" "}
          товарів.
        </p>
        <LevelTiles levels={levels} />
      </div>
    );
  }

  const canDiff = selected.length > 1;
  const hide = (line: Line) => onlyDiff && canDiff && isSame(line);
  const grouped = groups(selected);
  const hiddenCount = grouped.reduce(
    (n, g) => n + g.lines.filter(hide).length,
    0,
  );

  return (
    <div class="shop compare" data-ready="true">
      <div class="cmp-bar">
        <h2 class="cmp-bar__title" tabIndex={-1} ref={title}>
          Товарів у порівнянні: {selected.length} з {COMPARE_LIMIT}
        </h2>
        {canDiff && (
          <button
            type="button"
            class="shop-btn shop-btn--small"
            aria-pressed={onlyDiff ? "true" : "false"}
            onClick={() => setOnlyDiff(!onlyDiff)}
            data-only-diff
          >
            Тільки відмінності
          </button>
        )}
        <p class="shop-sr" role="status">
          {status}
        </p>
      </div>
      {onlyDiff && canDiff && (
        <p class="shop-note" data-hidden-rows>
          Сховано однакових рядків: {hiddenCount}
        </p>
      )}

      <div
        class="cmp-scroll"
        role="region"
        aria-labelledby="cmp-caption"
        tabIndex={0}
      >
        <table class="cmp">
          <caption id="cmp-caption" class="shop-sr">
            Порівняння товарів
          </caption>
          <thead>
            <tr>
              <td class="cmp-corner" />
              {selected.map((p) => (
                <th scope="col" key={p.slug} data-compare-col={p.slug}>
                  <Thumb product={p} />
                  <a class="cmp-name" href={p.url}>
                    {p.name}
                  </a>
                  <button
                    aria-label={`Прибрати: ${p.name}`}
                    type="button"
                    class="shop-link"
                    onClick={() => {
                      remove(p.slug);
                      setStatus(`${p.name} прибрано з порівняння`);
                      title.current?.focus();
                    }}
                  >
                    Прибрати
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Ціна</th>
              {selected.map((p) => (
                <td key={p.slug} class="num">
                  {priceText(p)}{" "}
                  {p.demo &&
                    (p.price_equipment ?? p.price_turnkey_from) !== null && (
                      <DemoBadge />
                    )}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Наявність</th>
              {selected.map((p) => (
                <td key={p.slug}>
                  {p.stock === "in_stock"
                    ? "В наявності"
                    : `Під замовлення · ${p.delivery_days} дн.`}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Купити</th>
              {selected.map((p) => (
                <td key={p.slug}>
                  {p.sale_mode === "cart" ? (
                    <button
                      aria-label={`До кошика: ${p.name}`}
                      type="button"
                      class="shop-btn shop-btn--small"
                      onClick={() => {
                        add(p.slug, false);
                        track("add_to_cart", {
                          slug: p.slug,
                          turnkey: false,
                          source: "compare",
                        });
                        setStatus(`${p.name} додано до кошика`);
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
                  )}
                </td>
              ))}
            </tr>
          </tbody>
          {grouped.map((g) => (
            <tbody key={g.level} data-level-group={g.level}>
              {grouped.length > 1 && (
                <tr class="cmp-group">
                  <th scope="rowgroup" colSpan={selected.length + 1}>
                    {g.name}
                  </th>
                </tr>
              )}
              {g.lines.map((line) =>
                hide(line) ? null : (
                  <tr key={line.label} data-row={line.label}>
                    <th scope="row">{line.label}</th>
                    {line.cells.map((c, i) => (
                      <Cell key={selected[i].slug} value={c} />
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
