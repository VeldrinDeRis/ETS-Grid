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
