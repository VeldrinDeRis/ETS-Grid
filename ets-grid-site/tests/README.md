# Библиотека тестов

Правила: D-023, структура: D-024. Каждый критерий приёмки `SPEC-0NN/AC-NN` из [specs/](../../specs/) становится тестом с этим номером в названии.

## Категории

| Папка | Чем | Что проверяет | Блокирует |
|---|---|---|---|
| `unit/` | Vitest | формулы подборщиков и Carport, логика фильтров, корзина, форматирование цен и единиц | каждый коммит |
| `data/` | Vitest + Zod | каталог по схеме, целостность ссылок, у каждого листинга есть выдача или «підберемо» | каждый коммит |
| `build/` | Vitest, разбор HTML из `dist/` | все адреса карты URL собраны; товары, цены, FAQ в HTML без JS; title, description, canonical, JSON-LD; нет битых внутренних ссылок; бюджет JS ≤ 100/150 КБ gz; ≤ 2 файлов шрифтов на первом экране; нет `#C8F03C` и Unbounded; украинская типографика | слияние в `main` |
| `functional/` | Playwright, 375 и 1440 | фильтры и URL, «з монтажем», корзина, оформление, подборщики | слияние в `main` |
| `a11y/` | Playwright + axe-core | шаблоны в палитрах А и Б, клавиатура, шторка (фокус, Esc), reduced-motion | слияние в `main` |
| `visual/` | Playwright, скриншоты | шаблоны × 375/1440 × палитра, компоненты в состояниях; эталоны в `__snapshots__/` | отчёт; после утверждения дизайна — слияние |
| `fixtures/` | — | тестовые данные отдельно от `src/data/catalog.json` | — |
| `helpers/` | — | экраны, переключатель палитры, объекты страниц | — |

Lighthouse — через MCP Chrome DevTools, отчёты и скриншоты для заказчика — в `../qa/`. Это отчёты, не тесты.

## Команды
Сайт для `build/`, `functional/`, `a11y/`, `visual/` должен быть собран (`npm run build`); `test:all` собирает сам. Playwright поднимает `scripts/serve.mjs` на порту 4792. Браузер: `npx playwright install chromium` (один раз).

| Команда | Что гоняет |
|---|---|
| `npm test` | unit + data |
| `npm run test:build` · `test:functional` · `test:a11y` · `test:visual` | одна категория |
| `npm run test:smoke` | метка `@smoke`: главная → подборщик → карточка → корзина → дякуємо |
| `npm run test:all` | всё, перед слиянием в `main` |

## Правила
1. В названии теста — `SPEC-0NN/AC-NN`; `--grep SPEC-0NN` гоняет модуль.
2. Тест логики пишется до кода, тест интерфейса — вместе с кодом, до статуса «Готово».
3. Баг → сначала воспроизводящий тест, потом исправление.
4. Тесты модуля — в своих файлах (`functional/catalog.spec.ts`), общее — в `helpers/`.
5. Визуальные эталоны меняются только осознанно, отдельным коммитом `visual baseline SPEC-0NN`. Сняты на Windows; при CI под Linux — переснять.

## Покрытие критериев

| Критерий | Категория | Файл | Статус |
|---|---|---|---|
| SPEC-001/AC-01 сборка и типы | build | `npm run build` (`astro check`) | ✅ |
| SPEC-001/AC-02 все адреса | build | `build/routes.test.ts` | ✅ |
| SPEC-001/AC-03 каркас страницы | build | `build/layout.test.ts` | ✅ |
| SPEC-001/AC-04 хлебные крошки | build | `build/layout.test.ts` | ✅ |
| SPEC-001/AC-05 уровни в шапке | build | `build/layout.test.ts` | ✅ |
| SPEC-001/AC-06 битые ссылки | build | `build/links.test.ts` | ✅ |
| SPEC-001/AC-07 целостность данных | data | `data/catalog.test.ts` | ✅ |
| SPEC-001/AC-08 форматирование | unit | `unit/format.test.ts` | ✅ |
| SPEC-001/AC-09 показ цены | unit, build | `unit/price.test.ts`, `build/price.test.ts` | ✅ |
| SPEC-001/AC-10 хранилище | unit | `unit/storage.test.ts` | ✅ |
| SPEC-001/AC-11 контраст токенов | unit | `unit/contrast.test.ts` | ✅ |
| SPEC-001/AC-12 палитра, запреты | build | `build/css.test.ts` | ✅ |
| SPEC-001/AC-13 переключатель палитры | functional | `functional/foundation.spec.ts` | ✅ |
| SPEC-001/AC-14 мега-меню с клавиатуры | functional | `functional/foundation.spec.ts` | ✅ |
| SPEC-001/AC-15 мобильная шапка, 320 px | functional | `functional/foundation.spec.ts` | ✅ |
| SPEC-001/AC-16 без JS | functional | `functional/foundation.spec.ts` | ✅ |
| SPEC-001/AC-17 счётчик корзины | unit, functional | `unit/storage.test.ts`, `functional/foundation.spec.ts` | ✅ |
| SPEC-001/AC-18 axe-core | a11y | `a11y/foundation.spec.ts` | ✅ |
| SPEC-001/AC-19 reduced-motion | a11y | `a11y/foundation.spec.ts` | ✅ |
| SPEC-001/AC-20 бюджеты JS и шрифтов | build | `build/budget.test.ts` | ✅ |
| SPEC-001/AC-21 serve.mjs | build | `build/serve.test.ts` | ✅ |
| SPEC-001/AC-22 zip для заказчика | build + вручную | `build/release.test.ts` | ✅ автотест; ⏳ двойной клик по `start.cmd` |
| SPEC-001/AC-23 команды | вручную | — | ✅ |
| `@smoke` главная → уровень → листинг → товар → кошик | functional | `functional/foundation.spec.ts` | ✅ |
| SPEC-002/AC-01 состояние в URL | unit | `unit/filters.test.ts` | ✅ |
| SPEC-002/AC-02 applyFilters | unit | `unit/filters.test.ts` | ✅ |
| SPEC-002/AC-03 facetCounts | unit | `unit/filters.test.ts` | ✅ |
| SPEC-002/AC-04 visibleFacets | unit | `unit/filters.test.ts` | ✅ |
| SPEC-002/AC-05 сортировка | unit | `unit/filters.test.ts` | ✅ |
| SPEC-002/AC-06 nearestProducts | unit | `unit/filters.test.ts` | ✅ |
| SPEC-002/AC-07 plural | unit | `unit/plural.test.ts` | ✅ |
| SPEC-002/AC-08 скорость 500 SKU | unit | `unit/filters-perf.test.ts` | ✅ |
| SPEC-002/AC-09 cart.add, compare.toggle | unit | `unit/cart-compare.test.ts` | ✅ |
| SPEC-002/AC-10 filters.json | data | `data/catalog-filters.test.ts` | ✅ |
| SPEC-002/AC-11 ЧПУ непустые | data | `data/catalog-filters.test.ts` | ✅ |
| SPEC-002/AC-12 cars.json с источниками | data | `data/catalog-filters.test.ts` | ✅ |
| SPEC-002/AC-13 тексты уровней | data + вручную | `data/catalog-filters.test.ts` | ✅ |
| SPEC-002/AC-14 товары и цены без JS | build | `build/catalog.test.ts` | ✅ |
| SPEC-002/AC-15 страница уровня | build | `build/catalog.test.ts` | ✅ |
| SPEC-002/AC-16 карточка | unit, build | `unit/card.test.ts`, `build/catalog.test.ts` | ✅ |
| SPEC-002/AC-17 пустая категория | build | `build/catalog.test.ts` | ✅ |
| SPEC-002/AC-18 JS ≤ 150 КБ | build | `build/budget.test.ts` | ✅ |
| SPEC-002/AC-19 выбор значения | functional | `functional/catalog.spec.ts` | ✅ |
| SPEC-002/AC-20 снятие фильтров | functional | `functional/catalog.spec.ts` | ✅ |
| SPEC-002/AC-21 состояние из URL | functional | `functional/catalog.spec.ts` | ✅ |
| SPEC-002/AC-22 сортировка | functional | `functional/catalog.spec.ts` | ✅ |
| SPEC-002/AC-23 перебор главного фильтра | functional | `functional/catalog.spec.ts` | ✅ |
| SPEC-002/AC-24 шторка | functional | `functional/catalog.spec.ts` | ✅ |
| SPEC-002/AC-25 корзина и сравнение | functional | `functional/catalog.spec.ts` | ✅ |
| SPEC-002/AC-26 события аналитики | functional | `functional/catalog.spec.ts` | ✅ |
| SPEC-002/AC-27 axe-core | a11y | `a11y/catalog.spec.ts` | ✅ |
| SPEC-002/AC-28 клавиатура | a11y | `a11y/catalog.spec.ts` | ✅ |
| SPEC-004/AC-01 powerCheck | unit | `unit/calc.test.ts` | ✅ |
| SPEC-004/AC-02 chargingPicker | unit | `unit/calc.test.ts` | ✅ |
| SPEC-004/AC-03 батареи | unit | `unit/calc.test.ts` | ✅ |
| SPEC-004/AC-04 solarSize | unit | `unit/calc.test.ts` | ✅ |
| SPEC-004/AC-05 carportConfig | unit | `unit/calc.test.ts` | ✅ |
| SPEC-004/AC-06 автономия и фасет | unit | `unit/calc.test.ts`, `unit/autonomy-facet.test.ts` | ✅ |
| SPEC-004/AC-07 границы | unit | `unit/calc.test.ts` | ✅ |
| SPEC-004/AC-08 calc.json | data | `data/calc.test.ts` | ✅ |
| SPEC-004/AC-09 подборщики и таблицы без JS | build | `build/pickers.test.ts` | ✅ |
| SPEC-004/AC-10 лендинг Carport | build | `build/pickers.test.ts` | ✅ |
| SPEC-004/AC-11 JS ≤ 150 КБ | build | `build/budget.test.ts` | ✅ |
| SPEC-004/AC-12 реакция подборщиков | functional | `functional/pickers.spec.ts` | ✅ |
| SPEC-004/AC-13 «Чи вистачить потужності?» | functional | `functional/pickers.spec.ts` | ✅ |
| SPEC-004/AC-14 CTA с параметрами, picker_complete | functional | `functional/pickers.spec.ts` | ✅ |
| SPEC-004/AC-15 ползунок и поле, границы | functional | `functional/pickers.spec.ts` | ✅ |
| SPEC-004/AC-16 фасет автономии в браузере | functional | `functional/pickers.spec.ts` | ✅ |
| SPEC-004/AC-17 axe-core | a11y | `a11y/pickers.spec.ts` | ✅ |
| SPEC-004/AC-18 клавиатура и подписи | a11y | `a11y/pickers.spec.ts` | ✅ |
| SPEC-004/AC-19 reduced-motion | a11y | `a11y/pickers.spec.ts` | ✅ |
| SPEC-009/AC-01 телефон | unit | `unit/leads.test.ts` | ✅ |
| SPEC-009/AC-02 проверка полей | unit | `unit/leads.test.ts` | ✅ |
| SPEC-009/AC-03 сводка подборщика | unit | `unit/leads.test.ts` | ✅ |
| SPEC-009/AC-04 формы на местах, без JS | build | `build/forms.test.ts` | ✅ |
| SPEC-009/AC-05 ≤ 5 полей, подписи | build | `build/forms.test.ts` | ✅ |
| SPEC-009/AC-06 товар из ?product= | functional | `functional/forms.spec.ts` | ✅ |
| SPEC-009/AC-07 параметры подборщика | functional | `functional/forms.spec.ts` | ✅ |
| SPEC-009/AC-08 ошибки | functional | `functional/forms.spec.ts` | ✅ |
| SPEC-009/AC-09 успешная заявка | functional | `functional/forms.spec.ts` | ✅ |
| SPEC-009/AC-10 антиспам | functional | `functional/forms.spec.ts` | ✅ |
| SPEC-009/AC-11 UTM | functional | `functional/forms.spec.ts` | ✅ |
| SPEC-009/AC-12 axe-core | a11y | `a11y/forms.spec.ts` | ✅ |
| SPEC-009/AC-13 клавиатура | a11y | `a11y/forms.spec.ts` | ✅ |
| SPEC-003/AC-01 совместимость с авто | unit | `unit/product.test.ts` | ✅ |
| SPEC-003/AC-02 цена монтажа, переключатель | unit | `unit/product.test.ts` | ✅ |
| SPEC-003/AC-03 11 блоков, плейсхолдеры | build | `build/product.test.ts` | ✅ |
| SPEC-003/AC-04 таблица характеристик | unit, build | `unit/product.test.ts`, `build/product.test.ts` | ✅ |
| SPEC-003/AC-05 перекрёстный блок ТЗ §5 | unit, build | `unit/product.test.ts`, `build/product.test.ts` | ✅ |
| SPEC-003/AC-06 переключатель и turnkey | functional | `functional/product.spec.ts` | ✅ |
| SPEC-003/AC-07 совместимость в браузере | functional | `functional/product.spec.ts` | ✅ |
| SPEC-003/AC-08 увеличение фото | functional | `functional/product.spec.ts` | ✅ |
| SPEC-003/AC-09 липкая панель | functional | `functional/product.spec.ts` | ✅ |
| SPEC-003/AC-10 недавно просмотренные | unit, functional | `unit/product.test.ts`, `functional/product.spec.ts` | ✅ |
| SPEC-003/AC-11 путь до корзины ≤ 6 шагов | functional | `functional/product.spec.ts` | ✅ |
| SPEC-003/AC-12 axe-core | a11y | `a11y/product.spec.ts` | ✅ |
| SPEC-003/AC-13 JS ≤ 100 КБ | build | `build/budget.test.ts` | ✅ |
