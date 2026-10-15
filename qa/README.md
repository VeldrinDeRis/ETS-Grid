# Ручные проверки (QA)

Сырые отчёты Lighthouse лежат в `qa/lighthouse/{страница}/report.html` и в git не идут — пересобираются Chrome DevTools MCP (`lighthouse_audit`) на `node ets-grid-site/scripts/serve.mjs`.

## Lighthouse — SPEC-008/AC-07

2026-10-14, сборка после SPEC-008, mobile, локально (`127.0.0.1`). Performance в этот аудит MCP не входит.

| Страница | Accessibility | Best Practices | SEO |
|---|---|---|---|
| `/` главная | 100 | 100 | 100 |
| `/zaryadni-stantsii/` уровень | 100 | 100 | 100 |
| `/zaryadni-stantsii/dlya-domu/` листинг | 100 | 100 | 100 |
| `/product/ets-home-7/` товар | 100 | 100 | 100 |

Повторить после SPEC-010 (шрифты, фото) и добавить Performance (SPEC-006 AC-23: ≥ 90).

## Lighthouse — SPEC-010/AC-10 (после доводки)

2026-10-14, сборка после доводки (D-040, D-041), mobile, локально.

| Страница | Accessibility | Best Practices | SEO |
|---|---|---|---|
| `/` главная | 100 | 100 | 100 |
| `/zaryadni-stantsii/` уровень | 100 | 100 | 100 |
| `/zaryadni-stantsii/dlya-domu/` листинг | 100 | 100 | 100 |
| `/product/ets-home-7/` товар | 100 | 100 | 100 |

**Performance.** Аудит MCP балл производительности не выдаёт. Трасса главной в условиях телефона (412×823, CPU ×4, Slow 4G): до встраивания CSS — LCP 1,98 с, CLS 0; после (`inlineStylesheets: 'always'`) — **LCP 1,14 с, CLS 0,02** (порог «хорошо»: LCP ≤ 2,5 с, CLS ≤ 0,1). Оставшиеся подсказки — сжатие текста и кэш-заголовки — задача сервера; локальный `serve.mjs` для показа их не отдаёт. Сырые трассы — `qa/lighthouse/home/trace-mobile*.json.gz` (вне git).

## Вес JS по страницам — D-066

2026-10-15, сборка HEAD `99a595c`. `node qa/pagejs.mjs ets-grid-site/dist --files /,/batarei/,/batarei/dlya-domu/` — тот же метод, что `tests/build/budget.test.ts` (`pageJsGz`): скрипты страницы и острова со всеми импортами, gz.

| Страница | КБ gz | Из чего |
|---|---|---|
| `/batarei/` уровень | 184,7 | React 80,5 · zod (`formulas.*`) 28,1 · motion 37,1 · остров 11,1 · Preact-подборщик 7,5 |
| `/batarei/dlya-domu/` листинг | 171,0 | то же без подборщика |
| `/` главная | 190,5 | React 80,5 · zod 28,1 · motion 37,1 · карусели и острова ≈ 15 |

Варианты экономии и рекомендация — DECISIONS D-066 (Q-15). Повторить после кода по D-066.
