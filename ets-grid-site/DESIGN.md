---
name: ETS GRID
description: Зарядні станції, сонце й батареї для бізнесу і дому — світле вікно в темному будинку під час блекауту.
colors:
  night-bg: "#0D1424"
  night-surface: "#16203A"
  night-ink: "#F4F6F8"
  night-ink-muted: "#A7B1C2"
  night-line: "#2A3650"
  accent: "#FFB547"
  on-accent: "#0D1424"
  day-bg: "#F4F6F8"
  day-surface: "#FFFFFF"
  day-ink: "#0D1424"
  day-ink-muted: "#4A5568"
  day-line: "#D9DEE5"
  status-ok-day: "#1B6E3E"
  status-wait-day: "#8A5300"
  placeholder-day: "#6B3FA0"
  status-ok-night: "#4FC98A"
  status-wait-night: "#F5C04E"
  placeholder-night: "#C4AEFF"
typography:
  display:
    fontFamily: "Geologica, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 1.6rem + 3.8vw, 4.4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geologica, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(2.07rem, 1.5rem + 2.4vw, 3.3rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline-sm:
    fontFamily: "Geologica, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(1.73rem, 1.4rem + 1.4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geologica, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(1.2rem, 1.1rem + 0.45vw, 1.45rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  numeral:
    fontFamily: "Geologica, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(4rem, 3rem + 6vw, 8rem)"
    fontWeight: 800
    lineHeight: 0.9
  body:
    fontFamily: "'Wix Madefor Text', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.55
  body-lg:
    fontFamily: "'Wix Madefor Text', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(1.2rem, 1.1rem + 0.45vw, 1.45rem)"
    fontWeight: 400
    lineHeight: 1.55
  price:
    fontFamily: "'Wix Madefor Text', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(1.2rem, 1.1rem + 0.45vw, 1.45rem)"
    fontWeight: 700
    lineHeight: 1.55
    fontFeature: "tnum"
  label:
    fontFamily: "'Wix Madefor Text', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(0.833rem, 0.8rem + 0.15vw, 0.9rem)"
    fontWeight: 400
    lineHeight: 1.4
  button:
    fontFamily: "'Wix Madefor Text', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  s: "6px"
  m: "10px"
  l: "18px"
  pill: "999px"
spacing:
  3xs: "0.25rem"
  2xs: "0.5rem"
  xs: "0.75rem"
  s: "1rem"
  m: "1.5rem"
  l: "2rem"
  xl: "3rem"
  2xl: "4rem"
  3xl: "6rem"
  section-y: "clamp(3.5rem, 2.2rem + 5.4vw, 7.5rem)"
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  container: "76rem"
  header-h: "4rem"
  tap: "2.75rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.m}"
    padding: "0 1.5rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "color-mix(in srgb, #FFB547 88%, #0D1424)"
    textColor: "{colors.on-accent}"
  button-primary-large:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.m}"
    padding: "0 2rem"
    height: "3.25rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.day-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.m}"
    padding: "0 1.5rem"
    height: "2.75rem"
  button-secondary-night:
    backgroundColor: "transparent"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.m}"
    padding: "0 2rem"
    height: "3.25rem"
  chip-filter:
    backgroundColor: "transparent"
    textColor: "{colors.day-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "2.75rem"
  chip-filter-selected:
    backgroundColor: "{colors.day-ink}"
    textColor: "{colors.day-bg}"
    rounded: "{rounded.pill}"
  spec-tag:
    textColor: "{colors.day-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.s}"
    padding: "0.1em 0.55em"
  input-text:
    backgroundColor: "{colors.day-surface}"
    textColor: "{colors.day-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.m}"
    padding: "0.5rem 0.75rem"
    height: "2.75rem"
  card-product:
    backgroundColor: "{colors.day-surface}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.l}"
    padding: "1.5rem"
  card-product-photo:
    backgroundColor: "{colors.day-bg}"
    textColor: "{colors.day-ink-muted}"
  level-tile-night:
    backgroundColor: "{colors.night-bg}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.m}"
    padding: "1rem 1.5rem"
  manifesto-plate:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.numeral}"
    rounded: "{rounded.l}"
    padding: "2rem"
  placeholder-day:
    textColor: "{colors.placeholder-day}"
    rounded: "{rounded.s}"
    padding: "0 0.35em"
  placeholder-night:
    textColor: "{colors.placeholder-night}"
    rounded: "{rounded.s}"
    padding: "0 0.35em"
  demo-badge:
    textColor: "{colors.placeholder-day}"
    typography: "{typography.label}"
    rounded: "{rounded.s}"
    padding: "0.1em 0.5em"
---

# Design System: ETS GRID

Записано по собранному коду 2026-10-14 (SPEC-010, решение D-039: основное направление — А «Теплий світ»). Источник правды — `src/styles/tokens.css`; имена токенов — контракт SPEC-001 §3.6, здесь они не переименовываются. Фронтматтер нормативен, проза объясняет, где и зачем.

**Карта разделов SPEC-010 §4:** Цвет → [Colors](#colors) · Шрифты → [Typography](#typography) · Иконки → [Components › Иконки](#иконки) · Фото → [Components › Фото](#фото) · Форма и ритм → [Layout](#layout), [Elevation & Depth](#elevation--depth), [Shapes](#shapes) · Яркие элементы → [Colors › Яркие элементы](#яркие-элементы) · Движение → [Overview › Движение](#движение-світло-вмикається).

## Overview

**Creative North Star: "Світле вікно"** — освещённое окно в тёмном доме во время отключения.

Сайт чередует ночные секции (тёмно-синяя ночь) и дневные (холодный светло-серый день), а единственный тёплый янтарный свет загорается только там, где есть энергия или действие: главная кнопка, линии энергии, индикаторы-«светодиоды», одна плашка-манифест. Энергосистема рисуется как мнемосхема — точки-лампы, соединённые линиями, по которым бежит импульс, — а не как декор. Тон — «спокойно, но с зарядом»: инженерная ясность, тёплые акценты, никакой неоновой «энергетики».

Плотность средняя: крупный первый экран на ночной поверхности, дальше — сетки карточек и ровный вертикальный ритм секций. Карточки — белые «окна» с мягкими углами и тенью вниз, как свет изнутри. Отказ от категорийного шаблона «стоковый герой + неон» подтверждён направлением и ТЗ §8.

**Key Characteristics:**
- Две поверхности одним атрибутом `data-surface="day|night"`; смысловые токены `--color-*` переключаются сами.
- Один тёплый акцент на весь сайт; остальное — нейтрали и функциональные статусы.
- Geologica для заголовков, Wix Madefor Text для текста, табличные цифры в ценах и характеристиках.
- Мягкие углы 6 / 10 / 18 px, мягкие тени вниз с подтоном ночного синего.
- Один линейный набор иконок, обводка 1,75, закруглённые концы.
- Видимые плейсхолдеры `[…]` — часть дизайна, не дефект (D-031).

### Альтернатива Б «Сигнал»

Запасной набор токенов, включается `data-palette="b"` на `<html>` (переключатель палитры, ключ хранится в `localStorage`). Имена токенов те же, меняются только значения. Шрифты Б (Fira Sans Extra Condensed 700/800 + Commissioner 400–700) подгружаются с Google Fonts только при выборе Б; для А они не грузятся никогда.

| Токен | Б · день | Б · ночь |
|---|---|---|
| `bg` | `#ECEBE4` | `#11110F` |
| `surface` | `#F8F7F2` | `#1D1D1A` |
| `ink` | `#11110F` | `#ECEBE4` |
| `ink-muted` | `#57554D` | `#A6A399` |
| `line` | `#D2D0C6` | `#34332E` |
| `accent` | `#FF4D00` | `#FF4D00` |
| `on-accent` / `focus` | `#11110F` / `#11110F` | `#11110F` / `#FF4D00` |
| `status-ok` / `status-wait` | `#1E6B3A` / `#8A4A00` | `#5CC98A` / `#F2A54E` |
| `placeholder` | `#6A3FB0` | `#C3A8FF` |

Форма Б: `--radius-s/m/l` = 0 / 2px / 3px, `--radius-pill` = 2px; `--shadow-1` = рамка `0 0 0 1px` цвета линии, `--shadow-2` = `0 10px 28px rgb(17 17 15 / 0.24)` + та же рамка; заголовки 800, трекинг 0, `--display-scale: 1.15`. Всё остальное в этом документе описывает А.

### Движение «світло вмикається»

Свет не «влетает», а загорается: меняются только `opacity` и `transform`, затухание экспоненциальное, без перелёта.

- **Токены:** `--dur-fast` 200 ms (смена цвета в кнопках и чипах), `--dur` 320 ms, `--dur-slow` 600 ms; `--ease-out` `cubic-bezier(0.22, 1, 0.36, 1)`, `--ease-spring` `cubic-bezier(0.16, 1, 0.3, 1)` (имя из контракта SPEC-001, значение — затухание без перелёта).
- **Окна дома в подборщике батареи:** окна загораются по `opacity` за 450 ms по кривой `[0.16, 1, 0.3, 1]` с шагом 60 ms — эталон грамматики.
- **Схема энергии:** один проход при появлении в кадре (`inView`, 40 %): лампы загораются по очереди (`opacity 0.25 → 1`, `scale 0.7 → 1`, 450 ms, шаг 320 ms), линия до следующей лампы заполняется (`scaleX`, на телефоне `scaleY`, 400 ms). Без циклов. В покое и без JS схема горит целиком (доводка D-040; бесконечный импульс 2,4 s убран).
- **Переходы между страницами:** `@view-transition { navigation: auto }` только при `prefers-reduced-motion: no-preference`.
- Анимация — ванильный `motion` (`animate`, `inView`).

**The Static Night Rule.** При `prefers-reduced-motion: reduce` все длительности — 0, импульсы не запускаются, окна сразу принимают конечное состояние. Ничего не мигает и не движется.

## Colors

Ночной сине-чёрный и холодный дневной серый, между ними — один тёплый янтарный свет.

### Primary
- **Янтарный свет окна** (`accent`): главная кнопка экрана, кнопки «Показати» и отправки формы, линии энергии и точки-лампы мнемосхемы, окна дома в подборщике, плашка-манифест, выделение текста, ползунки подборщиков. На ночной поверхности он же — цвет фокуса. Текст на нём — всегда `on-accent` (ночной синий), никогда белый.

### Neutral
- **Ночь блекаута** (`night-bg`): фон ночных секций — первый экран, «Чи вистачить потужності?», «Не тільки розетка», заявка, конфигуратор навеса, подбор на странице уровня, подвал. Совпадает с `day-ink`: ночь — это цвет текста дня.
- **Глубокая ночь** (`night-surface`): поля и подложки фото внутри ночных секций.
- **Свет из окна** (`night-ink`) и **Сумеречный серо-голубой** (`night-ink-muted`): текст и вторичный текст ночью.
- **Ночная проводка** (`night-line`): рамки плиток уровней и разделители ночью.
- **Дневной бетон** (`day-bg`): фон дневных секций и подложка фото товара на любой поверхности.
- **Белое окно** (`day-surface`): карточки, поля ввода, выпадающие подсказки.
- **Ночной синий текст** (`day-ink`) и **Графит** (`day-ink-muted`): текст и вторичный текст днём.
- **Дневная линия** (`day-line`): рамки тегов характеристик, разделители FAQ, нижняя граница шапки.

### Функциональные статусы
- **Зелёная лампа** (`status-ok-day` / `status-ok-night`): «в наявності», успешные проверки подборщика (левая полоса 4 px).
- **Жёлтая лампа ожидания** (`status-wait-day` / `status-wait-night`): «під замовлення», предупреждения подборщика, а также ошибки полей формы.
- **Фиолетовый плейсхолдер** (`placeholder-day` / `placeholder-night`): только для `[…]`-плейсхолдеров и метки «демо-ціна». Фиолетовый выбран, чтобы плейсхолдер никогда не спутать ни с акцентом, ни со статусом.

Смысловые токены `--color-bg`, `--color-surface`, `--color-ink`, `--color-ink-muted`, `--color-line`, `--color-accent`, `--color-on-accent`, `--color-focus`, `--color-status-ok`, `--color-status-wait`, `--color-placeholder` берут значения `--day-*` или `--night-*` по ближайшему `data-surface`. Фокус: днём — ночной синий, ночью — янтарь. Компоненты пишут только `--color-*`; прямые `--day-*` — лишь там, где поверхность намеренно фиксирована (подложка фото товара). Сырых hex в компонентах нет.

### Яркие элементы

Ярко бывает только в местах таблицы ТЗ §8.1, и все они в коде:
1. **Акцентная кнопка** — одна главная на экран (`Button` variant `primary`, CTA героя, CTA уровня, отправка заявки).
2. **Линии энергии** — мнемосхема «Не тільки розетка»: точка-лампа 20 px с ореолом 6 px (акцент 18 %), линия 2 px (акцент 30 %), бегущий блик.
3. **Крупные цифры** — шрифт `numeral` в плашке-манифесте.
4. **Плашка-манифест** — одна на страницу: янтарный блок с крупной цифрой и коротким тезисом (блок Solar Carport на главной).
5. **Индикаторы-«светодиоды»** — круг 0,6 em цвета статуса рядом с наличием товара.

Бегущая строка не собрана.

### Named Rules
**The One Lamp Rule.** На экране горит один янтарный свет действия. Акцент не бывает фоном секции, рамкой карточки, цветом заголовка или иконки; если хочется подсветить что-то ещё, это должен быть статус или ничего.

**The Night Is Ink Rule.** Ночь сайта и текст дня — один цвет. Новые тёмные оттенки не вводятся; глубина ночью — только `night-surface` и `night-line`.

**The Product Plate Rule.** Фото товара всегда лежит на дневном бетоне, даже внутри ночной секции: товар показывается при дневном свете.

## Typography

**Display Font:** Geologica (с системным стеком `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`)
**Body Font:** Wix Madefor Text (с тем же системным стеком)

**Character:** Geologica — инженерная, но тёплая гротесковая форма заголовков с плотным трекингом; Wix Madefor Text — спокойный текст с ровными табличными цифрами для цен и характеристик.

**Файлы.** Self-host, по одному сабсету на семейство (`public/fonts/geologica.woff2` — переменная насыщенность 400–800, `public/fonts/wix-madefor-text.woff2` — 400–700), украинская и базовая латиница, `font-display: swap`, оба файла предзагружаются — ровно 2 файла на первом экране. Лицензия SIL OFL 1.1 (`public/fonts/README.md`).

**Украинский апостроф.** В Wix Madefor Text нет гліфа ʼ (U+02BC). Отдельный `@font-face` с именем «Wix Madefor Text» и `unicode-range: U+02BC` берёт этот знак из уже загруженного файла Geologica — лишнего запроса нет. Новые шрифты проверяются на «ґ є і ї ʼ».

### Hierarchy
- **Display** (`display`): H1 первого экрана; ширина ≤ 16ch. На мобиле опускается до шага `headline`.
- **Headline** (`headline`): H1 остальных страниц.
- **Headline small** (`headline-sm`): H2 секций.
- **Title** (`title`): H3, заголовок карточки товара (с `line-height` 1.25), названия узлов мнемосхемы.
- **Numeral** (`numeral`): только крупная цифра плашки-манифеста.
- **Body** (`body`): основной текст, строка ≤ 68ch.
- **Body large** (`body-lg`): подзаголовок героя (≤ 46ch), лид-тексты, список финансирования.
- **Price** (`price`): основная цена; вторичная цена — `label` цветом `ink-muted`. «Ціна за запитом» — `body` 600.
- **Label** (`label`): подписи, теги характеристик, наличие, метки, плейсхолдеры.

Шкала — 7 шагов `--step--1 … --step-5` (≈ 1.2), все шаги — `clamp()`. Заголовки H1–H4: `--display-weight`, `--display-tracking`, `line-height` 1.12, `text-wrap: balance`; размеры умножаются на `--display-scale` (в А = 1). Кнопки и подписи полей — 600, CTA и названия плиток — 700.

### Named Rules
**The Tabular Figures Rule.** Цены, мощности, количества и характеристики набираются с `font-variant-numeric: tabular-nums` (класс `.num` или правило компонента). Цифры в колонке не пляшут.

**The Two Files Rule.** На первом экране — не больше двух файлов шрифтов; новое начертание или семейство требует нового решения в DECISIONS, а не ещё одного `@font-face`.

## Layout

- **Контейнер** `container` по центру с боковыми полями `gutter`; узкий вариант для текстовых страниц.
- **Ритм секций:** каждая секция — `section-y` сверху и снизу (≈ 56 px на мобиле → 120 px на десктопе, ТЗ §8.1). Первый экран плотнее: `2rem` сверху, `1.5rem` снизу.
- **Чередование поверхностей:** главная идёт день/ночь по смыслу блока, а не строгой «зеброй» — ночь достаётся первому экрану, проверке мощности, мнемосхеме, заявке и подвалу.
- **Первый экран (≥ 960 px):** сетка текст 1.3fr | фото 1fr, ниже на всю ширину — 4 плитки уровней и полоса доверия из плейсхолдеров с контактами. **< 960 px:** одна колонка текст → плитки (горизонтальная лента с `scroll-snap`, плитка 70 %) → доверие → фото 16:9; CTA растягиваются на всю ширину. Фото на мобиле не прячется (D-031).
- **Сетки карточек:** `auto-fill` с минимумом 15rem; мнемосхема — 5 колонок, на мобиле — вертикальная цепочка.
- **Брейкпоинты:** основной — 960 px (`max-width: 959.98px` / `min-width: 960px`); вспомогательные — 640 и 600 px.
- **Цель касания:** `tap` — минимальная высота кнопок, чипов, полей, пунктов подсказок и FAQ (крупные CTA и пункты FAQ — 3.25rem). Шапка высотой `header-h`, не липкая (прокручивается с контентом).

Шкала отступов `3xs … 3xl` — единственный источник интервалов; `gap` внутри карточек — `xs`, между карточками — `s`–`m`.

## Elevation & Depth

Гибрид: дневные «окна» (карточки, плитки категорий, итог корзины) приподняты мягкой тенью вниз с подтоном ночного синего; ночью глубина строится тоном (`night-surface`) и линиями (`night-line`). Плавающие слои (мегаменю каталога, выпадающие подсказки поиска) — тень второго уровня.

### Shadow Vocabulary
- **Свет из окна** (`--shadow-1`: `0 1px 2px rgb(13 20 36 / 0.06), 0 6px 20px rgb(13 20 36 / 0.07)`): карточки товара и категорий, плашка-бейдж на фото, карточки подборщика и корзины.
- **Над комнатой** (`--shadow-2`: `0 14px 40px rgb(13 20 36 / 0.2)`): мегаменю каталога, выпадающие подсказки поиска.
- **Статусная полоса** (`--shadow-1` + `inset 4px 0 0` цвета статуса): результат подборщика — зелёный «хватит», жёлтый «на грани».
- **Ореол лампы** (`0 0 0 6px` акцент 18 %): только точки-лампы мнемосхемы.
- **Линия шапки** (`inset 0 -1px 0` цвета `line`): нижняя граница шапки.

### Named Rules
**The Soft Downward Light Rule.** Тени только мягкие и вниз, с тоном ночного синего; без резких смещённых теней, без цветного свечения, кроме ореола ламп. Выбранное состояние показывается заливкой или внутренней рамкой (`inset 0 0 0 1px`), а не тенью.

## Shapes

Мягкие углы окна: `rounded.s` (6 px) — теги характеристик, плейсхолдеры, метка «демо-ціна», пункты подсказок; `rounded.m` (10 px) — кнопки, поля, плитки уровней, опции формы, кнопка сравнения; `rounded.l` (18 px) — карточки, фото героя и карточек, плашка-манифест, плашка «Обʼєкти»; `rounded.pill` — фильтр-чипы, бейджи на фото, переключатели. Рамки — 1 px (`line` или `ink-muted`) у пассивных элементов и 2 px `ink` у вторичных кнопок. Фото обрезаются по радиусу контейнера (`overflow: hidden`, `object-fit: cover`; товар — `contain`).

**The Dashed Means Missing Rule.** Пунктирная рамка цвета `placeholder` — исключительно знак «данные дадут позже» (`[ТЕЛЕФОН]`, `[N обʼєктів]`, плашка будущих объектов). Пунктир нигде не используется как декор.

## Components

### Buttons
- **Источник:** один — `src/styles/buttons.css` (`.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--l`); им пользуются `Button.astro`, острова и шаблоны. Свои копии кнопок не заводить.
- **Shape:** мягкие углы (`rounded.m`), высота `tap`, крупная — 3.25rem; рамка 2 px.
- **Primary:** янтарная заливка, ночной синий текст 700. Одна на экран.
- **Неактивная** (`aria-disabled="true"`): сплошная рамка 1 px `line`, текст `ink-muted`; рядом — пояснение (D-031).
- **Hover / Focus:** primary темнеет смешиванием 88 % акцента с 12 % `ink` (ночью — светлеет, т.к. `ink` светлый); переход цвета `--dur-fast` `--ease-out`. Фокус — обводка 3 px `--color-focus` со смещением 2 px.
- **Secondary:** прозрачная, рамка 2 px `currentColor`/`ink`, hover — подложка `ink` 8 %. На ночном первом экране — светлая рамка и текст.
- **Ghost:** без рамки, текст `ink`, hover — подчёркивание.

### Chips
- **Style:** фильтр-чипы — пилюля, рамка 1 px `ink-muted`, прозрачные или `surface`, текст 600.
- **State:** выбранный (`aria-pressed="true"`) — инверсия: заливка `ink`, текст `bg`. Теги характеристик в карточке — прямоугольник `rounded.s`, рамка `line`, `label`, табличные цифры.

### Cards / Containers
- **Corner Style:** `rounded.l`.
- **Background:** `surface` (белое окно); фото-зона товара — `day-bg`, 1:1 (компактная — 4:3).
- **Shadow Strategy:** `--shadow-1`, см. Elevation.
- **Border:** нет.
- **Internal Padding:** `m`; внутри — `gap` `xs`, действия прижаты к низу.
- **Плитка уровня (ночь):** рамка 1 px `line`, `rounded.m`, название 700 + «від [ЦІНА]» `label` `ink-muted`; hover — подчёркивание названия.

### Inputs / Fields
- **Style:** `surface`, рамка 1 px `ink-muted`, `rounded.m`, высота `tap`, подпись над полем 600, «необовʼязково» — `label` `ink-muted`.
- **Focus:** общая обводка 3 px `--color-focus`.
- **Error:** рамка и внутренняя рамка 1 px `status-wait`, текст ошибки `label` того же цвета.
- **Опции (радио/чекбокс-плашки):** рамка `ink-muted`, выбранная — рамка `ink` + `inset 0 0 0 1px`.
- **Радио и флажки — свои** (`base.css`): пустое кольцо 1,5 px `ink-muted` → кольцо `ink` с точкой 0,5 rem (у флажка — квадрат). Одинаковы днём и ночью; поверхность задаёт `color-scheme`, поэтому `select` и скролбары ночью тёмные.

### Navigation
- Шапка высотой `header-h` (не липкая), нижняя граница линией. Словесный знак «ETS GRID» — Geologica 800, трекинг 0.04em. Поиск — поле `rounded.m` с выпадающими подсказками (`--shadow-2`, пункты `rounded.s`). Мегаменю каталога — панель `surface` во всю ширину контейнера с `--shadow-2`. Подвал — ночная поверхность.

### Плейсхолдер и демо-метка
Видимый элемент дизайна (D-031, D-005): инлайн-метка `[…]` 0.92em, пунктир 1 px `currentColor`, `rounded.s`, цвет `placeholder`, `title="Дані надасть замовник"`, без переноса. «демо-ціна» — та же гамма со сплошной рамкой, `label`. Блоки, где данных нет, не прячутся, а показывают плейсхолдер на месте.

### Мнемосхема энергосистемы (signature)
Упорядоченный список узлов-ссылок (сонце → батарея → авто → дім…): точка-лампа акцента с ореолом, название `title` 700, пояснение `label` `ink-muted`; между узлами — линия 2 px акцента 30 % с бегущим бликом. На мобиле — вертикальная цепочка, линия идёт вниз. Линии декоративные (`aria-hidden`), смысл несут ссылки.

### Плашка-манифест
Янтарный блок `rounded.l`, отступ `l`: сверху `numeral`, снизу тезис `body-lg` 600. Одна на страницу, рядом — фото того же радиуса.

### Иконки
Один собственный линейный набор (`src/components/layout/Icon.astro`): сетка 24, `stroke-width` 1.75, `stroke-linecap/linejoin: round`, без заливки, цвет `currentColor`, размер по умолчанию 20 px. Группы: служебные (chevron-down, cart, menu, close, search, phone, compare), уровни (station, sun, battery, carport), характеристики (power, phases, ip, warranty, cable), услуги (delivery, install, project, service), разъёмы Type 2 / CCS2 / GB/T / CHAdeMO — свои схемы контактов в той же манере. Без подписи — `aria-hidden="true"`; с `label` — `role="img"` и `aria-label`. Новая иконка рисуется в этом же файле по тем же параметрам; сторонние наборы и эмодзи не подключаются.

### Фото
`Photo.astro`: `<picture>` AVIF + WebP, ширины 640/1280(/1920), явные `width`/`height`, `object-fit: cover`; на первом экране `eager` + `fetchpriority="high"`, остальные — `lazy`. Ключи и `alt` — `src/lib/photos.ts`; каждое фото — строкой в `public/img/CREDITS.md` с источником, лицензией и статусом «макет, замінити». Герой — реальная станция ночью, 4:3 (мобиле 16:9), `rounded.l`, подложка `surface`. Объекты — приглушённые и тёплые, без 3D и «человека с ноутбуком»; товар — на `day-bg`, 1:1 или 4:5, `contain`. В фото без читаемых логотипов, пока бренды каталога — плейсхолдеры.

**The Own Objects Only Rule.** В разделе «Обʼєкти» никогда не стоят чужие фото (D-005): до своих съёмок там пунктирная плашка-плейсхолдер.

## Do's and Don'ts

### Do:
- **Do** переключать день/ночь только атрибутом `data-surface` и писать в компонентах `--color-*`, а не hex или `--day-*`/`--night-*` (исключение — фиксированная подложка фото товара).
- **Do** держать одну янтарную кнопку на экран; остальные действия — secondary или ghost.
- **Do** набирать цены и характеристики с `tabular-nums`.
- **Do** показывать недостающие данные плейсхолдером `[…]` на месте (D-031).
- **Do** анимировать только `opacity` и `transform`, 300–600 ms с экспоненциальным затуханием, и отключать всё при `prefers-reduced-motion`.
- **Do** держать радиусы на шкале 6 / 10 / 18 px и пилюлю только для чипов, бейджей и переключателей.
- **Do** новые токены добавлять, старые имена SPEC-001 не переименовывать.

### Don't:
- **Don't** использовать лайм `#C8F03C`, шрифты Unbounded и JetBrains Mono, а также тройку Unbounded / Golos / JetBrains Mono.
- **Don't** заливать акцентом фоны секций, рамки карточек, заголовки или иконки (The One Lamp Rule).
- **Don't** использовать неон, размытое цветное свечение, фоновое видео, 3D на первом экране, скроллджекинг и параллакс на каждом блоке.
- **Don't** ставить стоковый «героический» кадр или «человека с ноутбуком»; герой — реальная станция.
- **Don't** использовать пунктир как декор — он означает только «данные дадут позже».
- **Don't** подключать второй набор иконок или эмодзи вместо иконок.
- **Don't** добавлять третий файл шрифта на первый экран или грузить шрифты Б для направления А.
- **Don't** ставить чужие фото в «Обʼєкти».

## Доводка SPEC-010 (D-040, D-041)

- **Dashed Means Missing, строго:** пунктир — только данные, которые надаст замовник (`[…]`, рамки фото, плашка объектов). Недоступный фильтр, неактивная кнопка, плитка «Підберемо систему», пустые состояния, «Товар більше недоступний» — сплошная тонкая рамка `line`.
- **Ритм секций:** две секции одной поверхности подряд — один отступ `section-y` (у второй нет верхнего). Первая секция внутренней страницы начинается в `space-l` под крошками.
- **Плита товара:** фото-зона вложена в белую карточку (отступ `xs`, `rounded.m`) — силуэт карточки читается на `#F4F6F8`. Пустая рамка — значок уровня и «Фото надасть замовник» обычным регистром.
- **Цена «під ключ від»:** подпись отдельной строкой (`label`, `ink-muted`), сумма — `nowrap`, «демо-ціна» в строке суммы.
- **Статус результата подборщика:** лампа 0,6 em цвета статуса без ореола и тонкая рамка цвета статуса. Ореол — только у ламп схемы энергии.
- **Иконки по местам:** значок уровня на плитках героя (`ink-muted`, не акцент) и в пустых рамках; значки характеристик в «Головне» карточки (мощность, разъём по первому разъёму, фазы, IP, кабель, керування, ёмкость, гарантия).
- **CSS встроен в HTML** (`inlineStylesheets: 'always'`): нет блокирующих запросов на первом экране.
- **Исключение из craft floor:** надзаголовок героя главной остаётся — его требует ТЗ §6.1 (D-041).
- **Ілюстративне фото (D-042):** пока нет предметных фото, карточка и галерея показывают похожее оборудование 1:1 с меткой «Ілюстративне фото» (ink-плашка `label` в левом нижнем углу). Где сток вводит в заблуждение (разъём не тот) — рамка «Фото надасть замовник».
