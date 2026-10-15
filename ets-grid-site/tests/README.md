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
| D-066 zod не в клиентском JS | build | `build/budget.test.ts` | ✅ |
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
| SPEC-002/AC-29 пробелы видны: фасеты без данных, «Новинки» | unit, functional | `unit/missing-facets.test.ts`, `functional/catalog.spec.ts` | ✅ |
| SPEC-002/AC-30 перестановка карточек animateLayout | functional | `functional/catalog-rev5.spec.ts` | ✅ |
| SPEC-002/AC-31 без анимации: URL, 5 смен, reduced-motion | functional | `functional/catalog-rev5.spec.ts` | ✅ |
| SPEC-002/AC-32 анимация и фокус | a11y | `a11y/catalog.spec.ts` | ✅ |
| SPEC-002/AC-33 rankFacets | unit | `unit/rank-facets.test.ts` | ✅ |
| SPEC-002/AC-34 TYPE_ICON и набор иконок | data | `data/type-icons.test.ts` | ✅ |
| SPEC-002/AC-35 плитки, «Ще N фільтрів», плашка в HTML | build | `build/catalog-rev5.test.ts` | ✅ |
| SPEC-002/AC-36 плитки, огонёк, «Ще N», стабильное ранжирование | functional | `functional/catalog-rev5.spec.ts` | ✅ |
| SPEC-002/AC-37 AnimateNumber «Знайдено» и счётчики | functional | `functional/catalog-rev5.spec.ts` | ✅ |
| SPEC-002/AC-38 остров React, вес с островами | build | `build/catalog-rev5.test.ts`, `build/budget.test.ts` | ✅ |
| SPEC-002/AC-39 axe и клавиатура ревизии 5 | a11y | `a11y/catalog.spec.ts` | ✅ |
| SPEC-002/AC-40 эталоны листинга и уровня | visual | `visual/templates.spec.ts` | ✅ |
| SPEC-002/AC-41 наборы кадров, productFrames | unit | `unit/product-frames.test.ts` | ✅ |
| SPEC-002/AC-42 мини-галерея в HTML, compact и хиты без неё | build | `build/card-gallery.test.ts` | ✅ |
| SPEC-002/AC-43 гортание кадров, drag, без JS, фильтр | functional | `functional/card-gallery.spec.ts` | ✅ |
| SPEC-002/AC-44 axe и клавиатура галереи | a11y | `a11y/card-gallery.spec.ts` | ✅ |
| SPEC-001/AC-25 шапка ночью на всех страницах | build | `build/night-threshold.test.ts` | ✅ |
| SPEC-001/AC-26 ночной порог, стык dawn, витрина вне порога | build | `build/night-threshold.test.ts` | ✅ |
| SPEC-001/AC-27 высота порога | functional | `functional/night-threshold.spec.ts` | ✅ |
| SPEC-001/AC-28 axe на ночной шапке и пороге | a11y | `a11y/*.spec.ts` (общие проверки страниц) | ✅ |
| SPEC-001/AC-29 эталоны всех шаблонов | visual | `visual/templates.spec.ts` | ✅ |
| SPEC-002/AC-45 порог уровня и листинга | build | `build/night-threshold.test.ts` | ✅ |
| SPEC-002/AC-46 витрина в первом экране | functional | `functional/night-threshold.spec.ts` | ✅ |
| SPEC-004/AC-20 «рахунок, ₴» неактивен до тарифа | functional | `functional/pickers.spec.ts` | ✅ |
| SPEC-005/AC-01 корзина: setQty, setTurnkey, remove, clear, totals | unit | `unit/shop.test.ts` | ✅ |
| SPEC-005/AC-02 сравнение, событие, recent | unit | `unit/shop.test.ts` | ✅ |
| SPEC-005/AC-03 поиск: «ets home», «gbt», «інвертр» | unit | `unit/shop.test.ts` | ✅ |
| SPEC-005/AC-04 orderId, контракт заказа | unit | `unit/shop.test.ts` | ✅ |
| SPEC-005/AC-05 корзина в браузере | functional | `functional/shop.spec.ts` | ✅ |
| SPEC-005/AC-06 оформление, begin_checkout, purchase, «Дякуємо» | functional | `functional/shop.spec.ts` | ✅ |
| SPEC-005/AC-07 путь покупки ≤ 6 шагов | functional | `functional/shop.spec.ts` | ✅ |
| SPEC-005/AC-08 сравнение | functional | `functional/shop.spec.ts` | ✅ |
| SPEC-005/AC-09 поиск и подсказки в шапке | functional | `functional/shop.spec.ts` | ✅ |
| SPEC-005/AC-10 без JS — понятная строка; индекс и combobox | build | `build/shop.test.ts` | ✅ |
| SPEC-005/AC-11 axe-core | a11y | `a11y/shop.spec.ts` | ✅ |
| SPEC-005/AC-12 JS ≤ 100 КБ | build | `build/budget.test.ts` | ✅ |
| SPEC-006/AC-01 home-content.json | data | `data/home.test.ts` | ✅ |
| SPEC-006/AC-02 systemPrice | unit | `unit/home.test.ts` | ✅ |
| SPEC-006/AC-03 нет выдуманных фактов | data | `data/home.test.ts` | ✅ |
| SPEC-006/AC-04 блоки 1–11, плашка объектов, рамки фото | build, functional | `build/home.test.ts`, `functional/home.spec.ts` | ✅ |
| SPEC-006/AC-05 первый экран | build | `build/home.test.ts` | ✅ |
| SPEC-006/AC-06 вкладки блока 2 | build | `build/home.test.ts` | ✅ |
| SPEC-006/AC-07 хиты | build | `build/home.test.ts` | ✅ |
| SPEC-006/AC-08 схема потока | build | `build/home.test.ts` | ✅ |
| SPEC-006/AC-09 одна плашка-манифест | build | `build/home.test.ts` | ✅ |
| SPEC-006/AC-10 JS ≤ 100 КБ | build | `build/budget.test.ts` | ✅ |
| SPEC-006/AC-11 1440: первый экран целиком | functional | `functional/home.spec.ts` | ✅ |
| SPEC-006/AC-12 375: CTA в первом экране, плитки лентой | functional | `functional/home.spec.ts` | ✅ |
| SPEC-006/AC-13 CTA и аналитика | functional | `functional/home.spec.ts` | ✅ |
| SPEC-006/AC-14 вкладки и фильтры хитов | functional | `functional/home.spec.ts` | ✅ |
| SPEC-006/AC-15 варианты героя | functional | `functional/home.spec.ts` | ✅ |
| SPEC-006/AC-16 мини-конфигуратор | functional | `functional/home.spec.ts` | ✅ |
| SPEC-006/AC-17 один акцент в первом экране | functional | `functional/home.spec.ts` | ✅ |
| SPEC-006/AC-18 axe-core | a11y | `a11y/home.spec.ts` | ✅ |
| SPEC-006/AC-19 вкладки: WAI-ARIA и без JS | a11y, functional | `a11y/home.spec.ts`, `functional/home.spec.ts` | ✅ |
| SPEC-006/AC-20 reduced-motion | a11y | `a11y/home.spec.ts` | ✅ |
| SPEC-006/AC-40 кнопки-фильтры хитов: огонёк вместо инверсии (рев. 6.1, D-064) | functional | `functional/home.spec.ts` | ✅ |
| SPEC-007/AC-01 content-pages.json, числа — плейсхолдеры | data | `data/content.test.ts` | ✅ |
| SPEC-007/AC-02 блоки каждой страницы | build | `build/content.test.ts` | ✅ |
| SPEC-007/AC-03 страницы систем: состав, цена, CTA | build, unit, functional | `build/content.test.ts`, `unit/content.test.ts`, `functional/content.spec.ts` | ✅ |
| SPEC-007/AC-04 объекты и о компании без фактов | build | `build/content.test.ts` | ✅ |
| SPEC-007/AC-05 статья гида из level-content.json | build | `build/content.test.ts` | ✅ |
| SPEC-007/AC-06 навигатор финансирования | unit, build, functional | `unit/content.test.ts`, `build/content.test.ts`, `functional/content.spec.ts` | ✅ |
| SPEC-007/AC-07 axe-core | a11y | `a11y/content.spec.ts` | ✅ |
| SPEC-007/AC-08 JS ≤ 100 КБ | build | `build/budget.test.ts` | ✅ |
| SPEC-008/AC-01 title ≤ 60, description 120–160, уникальность, шаблоны | unit, build | `unit/seo.test.ts`, `build/seo.test.ts` | ✅ |
| SPEC-008/AC-02 noindex и sitemap | unit, build | `unit/seo.test.ts`, `build/seo.test.ts` | ✅ |
| SPEC-008/AC-03 JSON-LD без плейсхолдеров и AggregateRating | build | `build/seo.test.ts` | ✅ |
| SPEC-008/AC-04 Product и Offer | unit, build | `unit/seo.test.ts`, `build/seo.test.ts` | ✅ |
| SPEC-008/AC-05 FAQPage = FAQ в HTML | build | `build/seo.test.ts` | ✅ |
| SPEC-008/AC-06 robots, sitemap, hreflang, Open Graph | build | `build/seo.test.ts` | ✅ |
| SPEC-008/AC-07 Lighthouse SEO = 100 | вручную | `qa/README.md` | ✅ |
| SPEC-010/AC-04 имена токенов, контраст А и Б | unit | `unit/contrast.test.ts` (SPEC-001/AC-11) | ✅ |
| SPEC-010/AC-05 шрифты: 2 файла, swap, ґ є і ї ʼ без подмены | build, functional | `build/budget.test.ts`, `functional/design.spec.ts` | ✅ |
| SPEC-010/AC-06 запрещённые шрифты и цвет | build | `build/css.test.ts` (SPEC-001/AC-12) | ✅ |
| SPEC-010/AC-07 иконки: один набор, обводка, доступность | build | `build/icons.test.ts` | ✅ |
| SPEC-010/AC-09 визуальные эталоны: главная, уровень, листинг, карточка × 375/1440 | visual | `visual/templates.spec.ts` | ✅ |
| SPEC-010/AC-10 Lighthouse mobile | вручную | `qa/README.md` | ✅ |
| SPEC-010/AC-08 фото в CREDITS.md, AVIF/WebP, места на страницах | build | `build/images.test.ts` | ✅ |
| D-042 иллюстрации товаров с меткой, без них — портативная и адаптер; вне JSON-LD | build | `build/images.test.ts` | ✅ |
