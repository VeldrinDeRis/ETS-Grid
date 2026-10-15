## Motion Performance Audit
**Scope:** главная `/` после SPEC-006 рев. 6.3 (D-072), ветка `wip/home-motion` @ 2084bea. Файлы: src/pages/index.astro, src/components/home/** (HomeHero, EnergyFlow, HomeBlocks, HomeHits, HomeSystems), src/scripts/home.ts, src/lib/motion-tokens.ts, src/lib/motion-dom.ts, острова на главной (HitsCarousel.tsx, CaseGallery.tsx, LiveNumber.tsx, use-page-transition.ts, pickers/PowerCheck.tsx, pickers/CarportConfigurator.tsx в режиме mini, pickers/LiveNumber.tsx, pickers.css), ProductCard.astro (gallery={false}), Header.astro, LeadForm.astro, src/styles/*.css. Только статический аудит, runtime-прогона нет.
**Files scanned:** 29
**Animations found:** 38

Сравнение с прошлым отчётом (qa/motion-audit-2026-10-15.md, 43 анимации) идёт не один к одному: тот считал весь сайт, этот считает только `/`. В этот подсчёт не вошло то, чего на главной нет: animateLayout каталога, CardGallery (у карточек хитов `gallery={false}`), BatteryPicker и переходы catalog-filters.css. Добавлены элементы, которые грузятся на главной: radio/checkbox, иконка меню в шапке и @view-transition.

### Scorecard
```
:::'███::::
::'██ ██:::
:'██:. ██::
'██:::. ██:
.█████████:
.██.... ██:
.██:::: ██:
..:::::..::

Breakdown
S  ██████████████░░░░░░░░░░░  21 · 56%
A  ████░░░░░░░░░░░░░░░░░░░░░   6 · 16%
B  ██░░░░░░░░░░░░░░░░░░░░░░░   3 ·  8%
C  █████░░░░░░░░░░░░░░░░░░░░   8 · 20%
D  ░░░░░░░░░░░░░░░░░░░░░░░░░   0 ·  0%
F  ░░░░░░░░░░░░░░░░░░░░░░░░░   0 ·  0%
```

**Итог: A.** AC-44 выполнен: итог не ниже A, D = 0, F = 0.

### Таблица анимаций главной
| # | Анимация | Где | Значения | Тир |
|---|---|---|---|---|
| 1–3 | Небо: predawn / dawn / day, 48 s infinite | HomeHero.astro:129, :132, :135 | opacity | S |
| 4 | Страховка H1 (`hero-title-fallback`, 0 s, задержка 1,2 s) | HomeHero.astro:238 | opacity | S |
| 5 | Слова H1 (splitText + animate) | home.ts:143 | opacity | S |
| 6 | Появление и гашение лампы | home.ts:176, :178 | opacity | S |
| 7 | Огонёк плитки `::after` на hover/focus | HomeHero.astro:305 | opacity | S |
| 8 | Ореол плитки `::before` на hover/focus | HomeHero.astro:320 | opacity, transform | S |
| 9 | `tile-charge`, разовый проход по 4 плиткам | HomeHero.astro:348 | opacity | S |
| 10 | `tile-halo`, разовый проход по 4 плиткам | HomeHero.astro:352 | opacity, transform | S |
| 11 | LED `led-charge` 1,8 s infinite (box-shadow статичен) | HomeHero.astro:403 | opacity | S |
| 12 | Подсказка сцены `flow-hint`, 6 итераций alternate | EnergyFlow.astro:235 | transform: scaleX | S |
| 13 | Гашение подсказки при `[data-done]` | EnergyFlow.astro:251 | opacity | S |
| 14 | Блик линии `flow-spark` 2,4 s infinite | EnergyFlow.astro:156 | transform | S |
| 15 | Лампа узла схемы | home.ts:99 | opacity, transform | S |
| 16 | Линия узла на телефоне | home.ts:102 | transform: scaleY | S |
| 17 | Маркер FAQ «+ → ×» | HomeBlocks.astro:322 | transform | S |
| 18 | Стрелки CaseGallery, disabled | HomeBlocks.astro:435 | opacity | S |
| 19 | Точка radio/checkbox (форма, подборщик) | base.css:169 | transform | S |
| 20 | Иконка раскрытия меню в шапке | Header.astro:365 | transform | S |
| 21 | Переход между страницами `@view-transition` | base.css:108 | снимки (compositor) | S |
| 22 | Лампа-курсор: motionValue → frame.render | home.ts:163 | transform: translate | A |
| 23 | Положение LED (ResizeObserver → frame.read → frame.render) | home.ts:212 | transform: translate | A |
| 24 | Линия схемы на desktop, scroll()-callback | home.ts:118 | transform: scaleX | A |
| 25 | Линия шагов, scroll()-callback | home.ts:244 | transform: scaleY | A |
| 26 | HitsCarousel (Motion+ Carousel) | HitsCarousel.tsx:61 | transform | A |
| 27 | CaseGallery (Motion+ Carousel) | CaseGallery.tsx:53 | transform | A |
| 28 | FAQ-аккордеон, animateLayout | home.ts:257 | layout (FLIP) | B |
| 29 | Цифры схемы, AnimateNumber | LiveNumber.tsx:35 | layout + transform | B |
| 30 | Цифры PowerCheck и Carport mini, AnimateNumber | pickers/LiveNumber.tsx:33 | layout + transform | B |
| 31 | Плитка героя на hover/focus | HomeHero.astro:290 | border-color, background-color, transform | C |
| 32 | Подпись узла схемы | EnergyFlow.astro:320 | color | C |
| 33 | Кружок шага | HomeBlocks.astro:261 | border-color, background-color, color | C |
| 34 | Точка CaseGallery | HomeBlocks.astro:463 | background-color, transform | C |
| 35 | Огонёк фильтра хитов `::before` | HomeHits.astro:58 | opacity, box-shadow | C |
| 36 | Стрелка карусели хитов | HomeHits.astro:109 | background-color, opacity | C |
| 37 | Точка карусели хитов | HomeHits.astro:143 | background-color, transform | C |
| 38 | `.btn`: hover и active | buttons.css:21 | background-color, color, border-color, transform | C |

### Что изменилось против прошлого аудита
- **flow-hint, D → S.** Анимируется `scaleX` (EnergyFlow.astro:231–242), а не `width`: 6 итераций alternate, то есть 3 вдоха. При `[data-done]` анимация отключается.
- **Лампа-курсор, C → A.** Пятно фиксированного размера 72rem едет через `transform: translate` (home.ts:163). Переменных `--lx/--ly` и слушателя scroll больше нет. Размеры читаются только на pointerenter и resize.
- **Огоньки плиток, C → S.** `tile-breathe` удалён. Ореол вынесен в `::before`, анимируются только opacity и transform. `tile-charge` теперь меняет только opacity.
- **Циклы вне кадра.** Небо, LED и блик ставятся на паузу через `[data-offscreen]` и inView (home.ts:264–272, HomeHero.astro:407–410, EnergyFlow.astro:158).
- **Карусели при reduced motion.** Получают мгновенный transition `{ duration: 0 }` через usePageTransition (use-page-transition.ts:32).

### Findings
21 анимация уже в тире S. 6 в тире A без практичного апгрейда: scroll()-колбэки линий схемы и шагов (home.ts:118, :244) односторонние и не отматываются, поэтому в ScrollTimeline не переводятся; лампа идёт за указателем; LED ставятся заново только на resize; две Carousel устроены так в Motion+. 3 в тире B (FAQ animateLayout, два применения AnimateNumber) стоят копейки: один FLIP на клик, перестройка нескольких цифр на событие. Ниже C, кроме одного пункта, — переходы цвета на мелких контролах: 4 плитки, 5 подписей, кружки шагов, точки, стрелки, кнопки. Практичного апгрейда у них нет, они разрешены DESIGN.md (переходы цвета у контролов).

#### [src/components/home/HomeHits.astro:58] — Tier C
**What:** Огонёк фильтра хитов `.hits__filters button::before` переводит `box-shadow` до `0 0 8px var(--color-accent)` (:68) вместе с opacity, 200 ms.
**Why Tier C:** Каждый кадр `box-shadow` — перерисовка. Это последний `box-shadow`-переход на главной: для плиток героя в рев. 6.3 его убрали.
**Impact:** Малый: 5 кнопок 6×6 px, 200 ms на клик. Зато противоречит правилу DESIGN.md «только opacity/transform», которое рев. 6.3 соблюла для плиток.
**Upgrade:** Сделать как у плиток (HomeHero.astro:308–323): статичный ореол в `::after` с готовым `box-shadow`, переход только `opacity` (и при желании `transform: scale`) → S.

### Anti-Patterns
Не найдено. Нет layout thrashing. Нет анимаций CSS-переменных. Нет чтений scroll в анимационном цикле. Нет `will-change`. Длинные циклы вне кадра на паузе. reduced motion обработан везде: base.css:113, tokens.css:137, `reduce` / `data-motion` в home.ts, usePageTransition в каруселях.

### Accessibility
Нарушений нет. Бесконечных циклов ровно три (небо 48 s, LED 1,8 s, блик 2,4 s). Все на паузе вне кадра, при reduced motion отключены. Мигание LED — 0,55 Гц, далеко ниже порога 3/s.

### Замечания вне производительности
- **Лампа сдвигается после прокрутки внутри героя. Регресс логики, не тира.** `rect` меряется только на pointerenter и resize (home.ts:160–161, :167, :173), а на pointermove считается `e.clientX − rect.left` (:169–170). Если колёсиком прокрутить, не уводя указатель из героя, `rect.top` устаревает, и лампа на следующем pointermove встаёт на величину прокрутки ниже указателя. На первом экране это частый случай. Исправление без возврата scroll-слушателя: на pointerenter и resize запоминать смещение блока на странице (`rect.left + scrollX`, `rect.top + scrollY`), а на pointermove брать `e.pageX/pageY − смещение` (так и рекомендовал прошлый отчёт).
- **Подсказка сцены проигрывает свои 3 вдоха до того, как её увидят.** `flow-hint` (EnergyFlow.astro:235) стартует при загрузке и за 9,6 s заканчивается вне кадра: акт II идёт после героя. Лишний раз её никто не ставит на паузу. Добавить `.flow[data-offscreen] .flow__hint::before { animation-play-state: paused }`: inView для `.flow` уже есть (home.ts:264).
- **Токены.** В home.ts:85 кривая `[0.16, 1, 0.3, 1]` записана литералом, хотя это `EASE_SPRING`. В home.ts:257 `0.32` + `[0.22, 1, 0.36, 1]` тоже литералами (это `DUR` + `EASE_OUT`). Значения совпадают с токенами, но импортировать их надёжнее. Задокументированные исключения в порядке: H1 0,55 s (D-049), LiveNumber 0,7 s, AnimateNumber 0,45 s.

### Top 3 Recommendations
1. Перевести огонёк фильтра хитов (HomeHits.astro:58) с `box-shadow` на статичный ореол с opacity: так уходит последний paint-переход вне цвета и выполняется правило «только opacity/transform».
2. Исправить устаревший `rect` лампы при прокрутке (home.ts:169–170): `pageX/pageY` минус смещение страницы, замеренное на pointerenter и resize.
3. Ставить `flow-hint` на паузу вне кадра, чтобы 3 вдоха проигрывались, когда акт II на экране.
